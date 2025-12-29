import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/types/ai-providers';

const EXTENSION_PROMPTS = {
  prd: `당신은 프로덕트 매니저입니다.
기존 프로젝트에 추가되는 새 기능의 PRD 확장 문서를 작성해주세요.
다음 섹션을 포함해주세요:
- 기능 개요
- 기능 요구사항 (필수/선택 구분)
- 비기능 요구사항
- 사용자 스토리`,

  dataModel: `당신은 데이터베이스 설계 전문가입니다.
새 기능에 필요한 데이터 모델 확장을 작성해주세요.
- TypeScript 인터페이스로 정의
- 기존 모델과의 관계 설명
- 인덱스 추천`,

  testScenarios: `당신은 QA 전문가입니다.
새 기능에 대한 테스트 시나리오를 작성해주세요.
- Given-When-Then 형식
- TC-EXT-XXX 형태로 ID 부여
- 단위/통합/E2E 테스트 구분`,

  todo: `당신은 프로젝트 매니저입니다.
새 기능 구현을 위한 TODO 목록을 작성해주세요.
- Phase EXT로 구분
- 각 항목에 예상 시간(시간 단위) 명시
- 우선순위(Critical/High/Medium/Low) 표시
- 체크박스 형태로 작성`,
};

interface ExtensionRequest {
  apiKey: string;
  featureName: string;
  featureDescription: string;
  projectContext?: string;
  provider?: AIProvider;
  model?: string;
}

// Generate content using the appropriate AI provider
async function generateWithProvider(
  provider: AIProvider,
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt: string
): Promise<string> {
  switch (provider) {
    case 'google': {
      const genAI = new GoogleGenerativeAI(apiKey);
      const aiModel = genAI.getGenerativeModel({
        model,
        systemInstruction: systemPrompt,
      });
      const result = await aiModel.generateContent(prompt);
      return result.response.text();
    }
    case 'openai': {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4096,
      });
      return response.choices[0]?.message?.content || '';
    }
    case 'anthropic': {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      let text = '';
      for (const block of response.content) {
        if (block.type === 'text') {
          text += block.text;
        }
      }
      return text;
    }
    default:
      throw new Error(`지원하지 않는 AI 공급업체: ${provider}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtensionRequest = await request.json();
    const { apiKey, featureName, featureDescription, projectContext, provider = 'google', model = 'gemini-2.5-flash' } = body;

    if (!apiKey || !featureName || !featureDescription) {
      return NextResponse.json(
        { error: 'API key, feature name, and description are required' },
        { status: 400 }
      );
    }

    console.log(`Using AI provider: ${provider}, model: ${model}`);

    const baseContext = `
기능명: ${featureName}
기능 설명: ${featureDescription}
${projectContext ? `프로젝트 컨텍스트: ${projectContext}` : ''}

위 기능에 대해 다음 문서를 작성해주세요.
한국어로 작성해주세요.
마크다운 형식으로만 응답해주세요.
`;

    const documents: Record<string, string> = {};
    const errors: string[] = [];

    // Generate documents
    for (const [docKey, systemPrompt] of Object.entries(EXTENSION_PROMPTS)) {
      try {
        console.log(`Generating extension ${docKey}...`);

        const text = await generateWithProvider(
          provider,
          apiKey,
          model,
          baseContext,
          systemPrompt
        );

        documents[docKey] = text;
        console.log(`✅ Extension ${docKey} generated`);

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error generating ${docKey}:`, errorMsg);
        errors.push(`${docKey}: ${errorMsg}`);

        // Fallback content
        documents[docKey] = `# ${docKey}\n\n문서 생성 실패. 오류: ${errorMsg}`;

        if (errorMsg.includes('429') || errorMsg.includes('quota')) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Parse TODOs from todo document
    const todos = parseTodosFromExtension(documents.todo, featureName);

    return NextResponse.json({
      success: true,
      documents,
      todos,
      warnings: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Extension generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: `확장 문서 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function parseTodosFromExtension(todoContent: string, featureName: string): Array<{
  id: string;
  title: string;
  description: string;
  phase: string;
  source: 'extension';
  status: 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
}> {
  const todos: Array<{
    id: string;
    title: string;
    description: string;
    phase: string;
    source: 'extension';
    status: 'pending';
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedHours: number;
  }> = [];

  const lines = todoContent.split('\n');
  let todoId = 1;
  const phase = `EXT: ${featureName}`;

  for (const line of lines) {
    const todoMatch = line.match(/^[-*]\s*\[[ x]\]\s*(.+)/i);
    if (todoMatch) {
      const title = todoMatch[1].trim();

      const hoursMatch = title.match(/\((\d+(?:\.\d+)?)\s*(?:시간|h|hr|hours?)\)/i);
      const estimatedHours = hoursMatch ? parseFloat(hoursMatch[1]) : 2;

      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      if (title.toLowerCase().includes('critical')) priority = 'critical';
      else if (title.toLowerCase().includes('high')) priority = 'high';
      else if (title.toLowerCase().includes('low')) priority = 'low';

      todos.push({
        id: `TODO-EXT-${Date.now()}-${todoId++}`,
        title: title.replace(/\(.*?\)/g, '').trim(),
        description: `${phase}: ${title}`,
        phase,
        source: 'extension',
        status: 'pending',
        priority,
        estimatedHours,
      });
    }
  }

  // Default TODOs if none parsed
  if (todos.length === 0) {
    const defaultItems = [
      { title: '데이터 모델 정의', hours: 2, priority: 'high' as const },
      { title: 'API 엔드포인트 구현', hours: 4, priority: 'high' as const },
      { title: 'UI 컴포넌트 구현', hours: 6, priority: 'medium' as const },
      { title: '테스트 작성', hours: 3, priority: 'medium' as const },
    ];

    defaultItems.forEach(item => {
      todos.push({
        id: `TODO-EXT-${Date.now()}-${todoId++}`,
        title: `${featureName} ${item.title}`,
        description: `${phase}: ${item.title}`,
        phase,
        source: 'extension',
        status: 'pending',
        priority: item.priority,
        estimatedHours: item.hours,
      });
    });
  }

  return todos;
}
