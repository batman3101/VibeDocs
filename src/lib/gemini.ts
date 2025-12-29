// 현재 사용 중인 모델 (서버에서 검증 후 설정됨)
let currentModel = 'gemini-2.5-flash';

// API 라우트를 통한 Gemini API 호출 (CORS 우회)
export async function generateWithGemini(
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey,
      prompt,
      systemPrompt,
      model: currentModel,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Generation failed');
  }

  const data = await response.json();
  return data.text;
}

// 검증 결과 타입
export interface ValidationResult {
  valid: boolean;
  model?: string;
  error?: string;
  hint?: string;
  warning?: string;
  rateLimited?: boolean;
  details?: Array<{ model: string; error: string }>;
}

// API 라우트를 통한 API 키 검증
export async function validateGeminiApiKey(apiKey: string): Promise<ValidationResult> {
  try {
    console.log('Validating API key via server...');

    const response = await fetch('/api/gemini/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (data.valid) {
      currentModel = data.model;
      if (data.rateLimited) {
        console.log(`⚠️ API key valid but rate limited. Model: ${currentModel}`);
      } else {
        console.log(`✅ API key validated! Using model: ${currentModel}`);
      }
      return {
        valid: true,
        model: currentModel,
        warning: data.warning,
        rateLimited: data.rateLimited,
      };
    }

    console.error('❌ Validation failed:', data.error);
    if (data.hint) {
      console.error('💡 Hint:', data.hint);
    }
    if (data.details) {
      console.error('Details:', data.details);
    }

    return {
      valid: false,
      error: data.error,
      hint: data.hint,
      details: data.details,
    };
  } catch (error) {
    console.error('❌ Network error during validation:', error);
    return {
      valid: false,
      error: '네트워크 오류가 발생했습니다. 서버가 실행 중인지 확인하세요.',
    };
  }
}

// 현재 사용 중인 모델 반환
export function getCurrentModel(): string {
  return currentModel;
}

// 문서 생성용 시스템 프롬프트
export const DOCUMENT_SYSTEM_PROMPTS = {
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
마크다운 형식으로 작성하고, 사용자 유형별로 그룹화해주세요.`,

  screenFlow: `당신은 UI/UX 설계 전문가입니다.
화면 흐름도를 마크다운으로 작성해주세요.
각 화면의 목적, 주요 요소, 다음 화면으로의 전환을 설명해주세요.`,

  prd: `당신은 프로덕트 매니저입니다.
PRD(Product Requirements Document)를 마크다운으로 작성해주세요.
기능적 요구사항, 비기능적 요구사항, 제약사항을 포함해주세요.`,

  techStack: `당신은 시니어 개발자입니다.
프로젝트에 적합한 기술 스택을 마크다운으로 추천해주세요.
프론트엔드, 백엔드, 데이터베이스, 인프라 등을 포함해주세요.`,

  dataModel: `당신은 데이터베이스 설계 전문가입니다.
TypeScript 인터페이스 형태로 데이터 모델을 정의해주세요.
엔티티 간의 관계도 설명해주세요.`,

  apiSpec: `당신은 백엔드 API 설계 전문가입니다.
RESTful API 명세를 마크다운으로 작성해주세요.
각 엔드포인트의 메소드, 경로, 요청/응답 형식을 포함해주세요.`,

  testScenarios: `당신은 QA 전문가입니다.
테스트 시나리오를 Given-When-Then 형식으로 작성해주세요.
단위 테스트, 통합 테스트, E2E 테스트를 구분해주세요.`,

  todoMaster: `당신은 프로젝트 매니저입니다.
개발 TODO 목록을 Phase별로 구성해주세요.
각 태스크의 예상 소요시간과 우선순위를 포함해주세요.`,

  promptGuide: `당신은 AI 코딩 전문가입니다.
각 TODO를 수행할 때 AI에게 전달할 프롬프트 가이드를 작성해주세요.
효과적인 프롬프트 작성 팁도 포함해주세요.`,
};

// TODO 매칭용 시스템 프롬프트
export const TODO_MATCHING_PROMPT = `당신은 프로젝트 진행 상황 분석 전문가입니다.
사용자가 설명하는 작업 내용을 분석하여, 주어진 TODO 목록에서 완료된 항목을 찾아주세요.

다음 JSON 형식으로 응답해주세요:
{
  "matches": [
    {
      "todoId": "TODO ID",
      "confidence": 0-100 사이의 신뢰도,
      "reason": "매칭 이유"
    }
  ]
}

신뢰도 기준:
- 90-100: 작업 내용과 정확히 일치
- 70-89: 높은 연관성
- 50-69: 중간 연관성
- 50 미만: 제외

신뢰도 50% 이상인 항목만 포함해주세요.`;
