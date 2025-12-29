import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// 사용 가능한 모델 목록 (우선순위 순)
const AVAILABLE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-pro',
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 에러에서 상세 정보 추출
function extractErrorDetails(error: unknown): { message: string; status?: number; details?: string } {
  if (error instanceof Error) {
    const message = error.message;

    // GoogleGenerativeAI 에러 파싱
    if (message.includes('[GoogleGenerativeAI Error]')) {
      // API 키 관련 에러
      if (message.includes('API_KEY_INVALID') || message.includes('invalid')) {
        return { message: 'API 키가 유효하지 않습니다', status: 401 };
      }
      // 할당량 초과
      if (message.includes('429') || message.includes('quota') || message.includes('RATE_LIMIT')) {
        return { message: '할당량 초과 - 잠시 후 다시 시도하세요', status: 429 };
      }
      // 모델 없음
      if (message.includes('404') || message.includes('not found')) {
        return { message: '모델을 찾을 수 없습니다', status: 404 };
      }
      // 권한 없음
      if (message.includes('403') || message.includes('permission') || message.includes('PERMISSION_DENIED')) {
        return { message: 'API 접근 권한이 없습니다. Google Cloud Console에서 Generative Language API를 활성화하세요.', status: 403 };
      }
    }

    return { message: message.substring(0, 200), details: error.stack?.substring(0, 300) };
  }
  return { message: String(error).substring(0, 200) };
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json(
        { valid: false, error: 'Invalid API key format. Google AI API keys start with "AIza"' },
        { status: 400 }
      );
    }

    const errors: Array<{ model: string; error: string; status?: number }> = [];

    // 각 모델을 순서대로 시도
    for (let i = 0; i < AVAILABLE_MODELS.length; i++) {
      const modelName = AVAILABLE_MODELS[i];
      try {
        console.log(`[${i + 1}/${AVAILABLE_MODELS.length}] Trying model: ${modelName}`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Say "OK"');
        const response = await result.response;
        const text = response.text();

        if (text && text.length > 0) {
          console.log(`✅ Success! Using model: ${modelName}`);
          return NextResponse.json({
            valid: true,
            model: modelName,
            response: text.substring(0, 50),
          });
        }
      } catch (error: unknown) {
        const errorInfo = extractErrorDetails(error);
        console.log(`❌ Model ${modelName} failed:`, errorInfo.message);
        errors.push({ model: modelName, error: errorInfo.message, status: errorInfo.status });

        // 429 (할당량 초과) = API 키는 유효함! 모델만 잠시 사용 불가
        if (errorInfo.status === 429) {
          console.log(`⚠️ Rate limited but API key is valid! Saving model: ${modelName}`);
          return NextResponse.json({
            valid: true,
            model: modelName,
            warning: '할당량 초과로 잠시 후 사용 가능합니다. API 키는 유효합니다.',
            rateLimited: true,
          });
        }

        // 401/403 에러는 모든 모델에서 동일하므로 바로 반환
        if (errorInfo.status === 401 || errorInfo.status === 403) {
          return NextResponse.json(
            {
              valid: false,
              error: errorInfo.message,
              hint: 'https://aistudio.google.com/apikey 에서 새 API 키를 발급받으세요.',
            },
            { status: errorInfo.status }
          );
        }

        // 다음 시도 전 잠시 대기
        if (i < AVAILABLE_MODELS.length - 1) {
          await delay(300);
        }
      }
    }

    console.error('All models failed:', errors);
    return NextResponse.json(
      {
        valid: false,
        error: '모든 모델 시도 실패',
        details: errors,
        hint: 'API 키가 올바른지, Google Cloud Console에서 Generative Language API가 활성화되어 있는지 확인하세요.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Validation error:', error);
    const errorInfo = extractErrorDetails(error);
    return NextResponse.json(
      { valid: false, error: `서버 오류: ${errorInfo.message}` },
      { status: 500 }
    );
  }
}
