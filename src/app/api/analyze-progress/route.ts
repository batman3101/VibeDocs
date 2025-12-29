import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: string;
  priority: string;
}

interface AnalysisRequest {
  apiKey: string;
  workDescription: string;
  todos: TodoItem[];
  code?: string;
}

interface MatchedTodo {
  todoId: string;
  title: string;
  confidence: number;
  reason: string;
  suggestedStatus: 'in-progress' | 'done';
}

const ANALYSIS_PROMPT = `당신은 소프트웨어 개발 진행도를 분석하는 전문가입니다.

사용자가 제공한 작업 내용을 분석하여, 완료되었거나 진행 중인 TODO 항목을 식별해주세요.

## 규칙
1. 각 TODO 항목에 대해 작업 내용과의 관련성을 0-100% 신뢰도로 평가
2. 신뢰도 50% 이상인 항목만 반환
3. 작업 내용이 해당 TODO를 완전히 완료했다면 suggestedStatus는 "done"
4. 작업 내용이 해당 TODO를 부분적으로 진행했다면 suggestedStatus는 "in-progress"
5. 각 매칭에 대해 간단한 이유 설명 제공

## 응답 형식 (JSON)
{
  "matches": [
    {
      "todoId": "TODO-001",
      "title": "TODO 제목",
      "confidence": 85,
      "reason": "로그인 API 구현이 작업 내용에 포함됨",
      "suggestedStatus": "done"
    }
  ],
  "summary": "전체 분석 요약 (1-2문장)"
}

## TODO 목록
{{TODOS}}

## 사용자 작업 내용
{{WORK_DESCRIPTION}}

{{CODE_SECTION}}

JSON 형식으로만 응답해주세요. 마크다운 코드 블록 없이 순수 JSON만 반환하세요.`;

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { apiKey, workDescription, todos, code } = body;

    if (!apiKey || !workDescription) {
      return NextResponse.json(
        { error: 'API key and work description are required' },
        { status: 400 }
      );
    }

    if (!todos || todos.length === 0) {
      return NextResponse.json(
        { error: 'No TODO items provided' },
        { status: 400 }
      );
    }

    // 미완료 TODO만 필터링
    const pendingTodos = todos.filter(
      (t) => t.status === 'pending' || t.status === 'in-progress'
    );

    if (pendingTodos.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        summary: '모든 TODO가 이미 완료되었습니다.',
      });
    }

    // TODO 목록 포맷팅
    const todosText = pendingTodos
      .map((t) => `- [${t.id}] ${t.title} (Phase: ${t.phase}, Priority: ${t.priority})`)
      .join('\n');

    // 코드 섹션 추가 (있는 경우)
    const codeSection = code
      ? `## 구현된 코드\n\`\`\`\n${code}\n\`\`\``
      : '';

    // 프롬프트 생성
    const prompt = ANALYSIS_PROMPT
      .replace('{{TODOS}}', todosText)
      .replace('{{WORK_DESCRIPTION}}', workDescription)
      .replace('{{CODE_SECTION}}', codeSection);

    // Gemini API 호출
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱
    let analysisResult;
    try {
      // JSON 코드 블록 제거 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'AI 응답 파싱 실패' },
        { status: 500 }
      );
    }

    // 결과 검증 및 정규화
    const matches: MatchedTodo[] = (analysisResult.matches || [])
      .filter((m: { confidence: number }) => m.confidence >= 50)
      .map((m: { todoId: string; title: string; confidence: number; reason: string; suggestedStatus: string }) => ({
        todoId: m.todoId,
        title: m.title || pendingTodos.find((t) => t.id === m.todoId)?.title || '',
        confidence: Math.min(100, Math.max(0, m.confidence)),
        reason: m.reason || '관련성 감지됨',
        suggestedStatus: m.suggestedStatus === 'done' ? 'done' : 'in-progress',
      }))
      .sort((a: MatchedTodo, b: MatchedTodo) => b.confidence - a.confidence);

    return NextResponse.json({
      success: true,
      matches,
      summary: analysisResult.summary || `${matches.length}개의 관련 TODO 항목을 발견했습니다.`,
    });

  } catch (error) {
    console.error('Progress analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: `진행도 분석 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
