import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/types/ai-providers';

// Document system prompts
const DOCUMENT_PROMPTS: Record<string, string> = {
  ideaBrief: `당신은 프로젝트 기획 전문가입니다.
사용자의 아이디어를 분석하여 IDEA_BRIEF.md 문서를 작성해주세요.
마크다운 형식으로 작성하고, 다음 섹션을 포함해주세요:
- 프로젝트 개요
- 핵심 가치 제안
- 목표 사용자
- 주요 기능 요약
- 성공 지표`,

  userStories: `당신은 UX 전문가입니다.
사용자 스토리를 "~로서, ~하고 싶다, 왜냐하면 ~" 형식으로 작성해주세요.
마크다운 형식으로 작성하고, 사용자 유형별로 그룹화해주세요.
최소 5개 이상의 사용자 스토리를 작성해주세요.`,

  screenFlow: `당신은 UI/UX 설계 전문가입니다.
화면 흐름도를 마크다운으로 작성해주세요.
- 전체 사이트맵을 트리 구조로 보여주세요
- 각 화면의 목적과 주요 요소를 설명해주세요
- 화면 간 전환 흐름을 설명해주세요`,

  prd: `당신은 프로덕트 매니저입니다.
PRD(Product Requirements Document)를 마크다운으로 작성해주세요.
다음 섹션을 포함해주세요:
- 프로젝트 개요
- 기능적 요구사항 (테이블 형태로)
- 비기능적 요구사항
- 제약사항 및 가정`,

  techStack: `당신은 시니어 풀스택 개발자입니다.
프로젝트에 적합한 기술 스택을 마크다운으로 추천해주세요.
테이블 형태로 정리하고, 각 기술의 선택 이유를 설명해주세요.
- 프론트엔드
- 백엔드
- 데이터베이스
- 개발 도구
- 배포`,

  dataModel: `당신은 데이터베이스 설계 전문가입니다.
프로젝트의 데이터 모델을 마크다운으로 작성해주세요.
- TypeScript 인터페이스 형태로 정의
- 각 엔티티의 필드와 타입 설명
- 엔티티 간의 관계도 설명`,

  apiSpec: `당신은 백엔드 API 설계 전문가입니다.
RESTful API 명세를 마크다운으로 작성해주세요.
- 각 엔드포인트의 메소드, 경로
- 요청/응답 JSON 형식 예시
- 에러 응답 형식`,

  testScenarios: `당신은 QA 전문가입니다.
테스트 시나리오를 마크다운으로 작성해주세요.
- Given-When-Then 형식
- 각 시나리오에 TC ID 부여
- 주요 기능별로 최소 3개 이상의 테스트 케이스`,

  todoMaster: `당신은 프로젝트 매니저입니다.
개발 TODO 목록을 Phase별로 구성해주세요.
- 각 Phase에 적절한 태스크 포함
- 예상 소요시간(시간 단위) 명시
- 우선순위(Critical/High/Medium/Low) 표시
- 체크박스 형태로 작성`,

  promptGuide: `당신은 AI 코딩 전문가입니다.
이 프로젝트의 문서들을 AI 도구(Claude, Cursor, Bolt 등)와 함께 사용하는 방법을 안내해주세요.
- 각 문서의 활용법
- 추천 프롬프트 예시
- AI 도구별 팁`,
};

const DOCUMENT_ORDER = [
  'ideaBrief',
  'userStories',
  'screenFlow',
  'prd',
  'techStack',
  'dataModel',
  'apiSpec',
  'testScenarios',
  'todoMaster',
  'promptGuide',
];

interface GenerateRequest {
  apiKey: string;
  idea: string;
  appType: string;
  template?: string;
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
    const body: GenerateRequest = await request.json();
    const { apiKey, idea, appType, template, provider = 'google', model = 'gemini-2.5-flash' } = body;

    if (!apiKey || !idea || !appType) {
      return NextResponse.json(
        { error: 'API key, idea, and appType are required' },
        { status: 400 }
      );
    }

    console.log(`Using AI provider: ${provider}, model: ${model}`);

    const appTypeName = appType === 'web' ? '웹앱' : appType === 'mobile' ? '모바일앱' : '웹/모바일앱';
    const templateInfo = template ? `템플릿: ${template}` : '';

    const baseContext = `
프로젝트 아이디어: ${idea}
앱 유형: ${appTypeName}
${templateInfo}

위 프로젝트에 대해 다음 문서를 작성해주세요.
한국어로 작성해주세요.
마크다운 형식으로만 응답해주세요 (코드 블록 없이).
`;

    const documents: Record<string, string> = {};
    const errors: string[] = [];

    // Generate documents sequentially with delay to avoid rate limiting
    for (const docKey of DOCUMENT_ORDER) {
      try {
        console.log(`Generating ${docKey}...`);

        const systemPrompt = DOCUMENT_PROMPTS[docKey];
        const text = await generateWithProvider(
          provider,
          apiKey,
          model,
          baseContext,
          systemPrompt
        );

        documents[docKey] = text;
        console.log(`✅ ${docKey} generated`);

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error generating ${docKey}:`, errorMsg);
        errors.push(`${docKey}: ${errorMsg}`);

        // Use fallback content
        documents[docKey] = `# ${docKey}\n\n문서 생성에 실패했습니다. 다시 시도해주세요.\n\n오류: ${errorMsg}`;

        // If rate limited, wait longer
        if (errorMsg.includes('429') || errorMsg.includes('quota')) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Generate TODOs from todoMaster content
    const todos = parseTodosFromMaster(documents.todoMaster);

    return NextResponse.json({
      success: true,
      documents,
      todos,
      warnings: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Document generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: `문서 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Parse TODO items from the todoMaster markdown
function parseTodosFromMaster(todoMasterContent: string): Array<{
  id: string;
  title: string;
  description: string;
  phase: string;
  status: 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
}> {
  const todos: Array<{
    id: string;
    title: string;
    description: string;
    phase: string;
    status: 'pending';
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedHours: number;
  }> = [];

  const lines = todoMasterContent.split('\n');
  let currentPhase = '';
  let todoId = 1;

  for (const line of lines) {
    // Detect phase headers
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const phaseMatch = line.match(/#+\s*(Phase\s*\d+[:\s]*.+)/i);
      if (phaseMatch) {
        currentPhase = phaseMatch[1].trim();
      }
    }

    // Detect TODO items (checkbox format)
    const todoMatch = line.match(/^[-*]\s*\[[ x]\]\s*(.+)/i);
    if (todoMatch && currentPhase) {
      const title = todoMatch[1].trim();

      // Extract hours if mentioned
      const hoursMatch = title.match(/\((\d+(?:\.\d+)?)\s*(?:시간|h|hr|hours?)\)/i);
      const estimatedHours = hoursMatch ? parseFloat(hoursMatch[1]) : 2;

      // Determine priority
      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      if (title.toLowerCase().includes('critical') || currentPhase.toLowerCase().includes('phase 1')) {
        priority = 'critical';
      } else if (title.toLowerCase().includes('high') || currentPhase.toLowerCase().includes('phase 2')) {
        priority = 'high';
      } else if (title.toLowerCase().includes('low')) {
        priority = 'low';
      }

      todos.push({
        id: `TODO-${String(todoId++).padStart(3, '0')}`,
        title: title.replace(/\(.*?\)/g, '').trim(),
        description: `${currentPhase}: ${title}`,
        phase: currentPhase,
        status: 'pending',
        priority,
        estimatedHours,
      });
    }
  }

  // If no todos parsed, create default structure
  if (todos.length === 0) {
    const defaultPhases = [
      { name: 'Phase 1: 프로젝트 설정', items: ['프로젝트 초기화', '기본 설정', '의존성 설치'] },
      { name: 'Phase 2: 핵심 기능', items: ['메인 기능 구현', 'UI 개발', 'API 연동'] },
      { name: 'Phase 3: 테스트 및 배포', items: ['테스트 작성', '버그 수정', '배포'] },
    ];

    defaultPhases.forEach(phase => {
      phase.items.forEach(item => {
        todos.push({
          id: `TODO-${String(todoId++).padStart(3, '0')}`,
          title: item,
          description: `${phase.name}: ${item}`,
          phase: phase.name,
          status: 'pending',
          priority: phase.name.includes('1') ? 'critical' : 'high',
          estimatedHours: 2,
        });
      });
    });
  }

  return todos;
}
