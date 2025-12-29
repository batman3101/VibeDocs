import type { AIProvider } from '@/types/ai-providers';

// ============================================
// 타입 정의
// ============================================

export interface ValidateApiKeyRequest {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface ValidateApiKeyResponse {
  valid: boolean;
  provider?: AIProvider;
  model?: string;
  warning?: string;
  rateLimited?: boolean;
  error?: string;
  hint?: string;
}

export interface GenerateContentRequest {
  provider: AIProvider;
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface GenerateContentResponse {
  success: boolean;
  text?: string;
  error?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

// ============================================
// API 호출 함수
// ============================================

/**
 * AI API 키 검증
 * 서버 API 라우트를 통해 공급업체별 API 키를 검증합니다.
 */
export async function validateApiKey(
  request: ValidateApiKeyRequest
): Promise<ValidateApiKeyResponse> {
  try {
    const response = await fetch('/api/ai/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 키 검증 오류:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}

/**
 * AI 콘텐츠 생성
 * 서버 API 라우트를 통해 공급업체별 AI 모델로 콘텐츠를 생성합니다.
 */
export async function generateContent(
  request: GenerateContentRequest
): Promise<GenerateContentResponse> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('콘텐츠 생성 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 에러 메시지를 사용자 친화적인 한국어로 변환
 */
export function getErrorMessage(error: string | undefined): string {
  if (!error) return '알 수 없는 오류가 발생했습니다';

  // 일반적인 에러 메시지 매핑
  const errorMap: Record<string, string> = {
    'API 키가 유효하지 않습니다': 'API 키가 올바르지 않습니다. 키를 확인해주세요.',
    '할당량 초과': 'API 호출 한도에 도달했습니다. 잠시 후 다시 시도해주세요.',
    '모델을 찾을 수 없습니다': '선택한 모델을 사용할 수 없습니다. 다른 모델을 선택해주세요.',
    'API 접근 권한이 없습니다': 'API 접근 권한이 없습니다. API 설정을 확인해주세요.',
    '네트워크 오류': '네트워크 연결을 확인해주세요.',
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value;
    }
  }

  return error;
}

/**
 * API 키가 형식상 유효한지 클라이언트에서 빠르게 확인
 * (서버 검증 전 사전 필터링용)
 */
export function quickValidateApiKeyFormat(provider: AIProvider, apiKey: string): boolean {
  if (!apiKey || apiKey.length < 20) return false;

  switch (provider) {
    case 'google':
      return apiKey.startsWith('AIza');
    case 'openai':
      return apiKey.startsWith('sk-');
    case 'anthropic':
      return apiKey.startsWith('sk-ant-');
    default:
      return false;
  }
}
