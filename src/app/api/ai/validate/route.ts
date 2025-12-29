import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/types/ai-providers';
import { AI_PROVIDERS, validateApiKeyFormat } from '@/types/ai-providers';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 에러에서 상세 정보 추출
function extractErrorDetails(error: unknown): { message: string; status?: number; details?: string } {
  if (error instanceof Error) {
    const message = error.message;

    // API 키 관련 에러
    if (message.includes('API_KEY_INVALID') || message.includes('invalid') || message.includes('Incorrect API key')) {
      return { message: 'API 키가 유효하지 않습니다', status: 401 };
    }
    // 할당량 초과
    if (message.includes('429') || message.includes('quota') || message.includes('RATE_LIMIT') || message.includes('rate_limit')) {
      return { message: '할당량 초과 - 잠시 후 다시 시도하세요', status: 429 };
    }
    // 모델 없음
    if (message.includes('404') || message.includes('not found') || message.includes('model_not_found')) {
      return { message: '모델을 찾을 수 없습니다', status: 404 };
    }
    // 권한 없음
    if (message.includes('403') || message.includes('permission') || message.includes('PERMISSION_DENIED')) {
      return { message: 'API 접근 권한이 없습니다', status: 403 };
    }
    // 인증 오류
    if (message.includes('401') || message.includes('authentication') || message.includes('unauthorized')) {
      return { message: 'API 키 인증에 실패했습니다', status: 401 };
    }

    return { message: message.substring(0, 200), details: error.stack?.substring(0, 300) };
  }
  return { message: String(error).substring(0, 200) };
}

// Google Gemini API 검증
async function validateGoogle(apiKey: string, modelId?: string): Promise<{
  valid: boolean;
  model?: string;
  error?: string;
  warning?: string;
  rateLimited?: boolean;
}> {
  const modelsToTry = modelId ? [modelId] : ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const aiModel = genAI.getGenerativeModel({ model });

      const result = await aiModel.generateContent('Say "OK"');
      const response = await result.response;
      const text = response.text();

      if (text && text.length > 0) {
        return { valid: true, model };
      }
    } catch (error) {
      const errorInfo = extractErrorDetails(error);

      // 429 (할당량 초과) = API 키는 유효함
      if (errorInfo.status === 429) {
        return {
          valid: true,
          model,
          warning: '할당량 초과로 잠시 후 사용 가능합니다. API 키는 유효합니다.',
          rateLimited: true,
        };
      }

      // 401/403 에러는 즉시 반환
      if (errorInfo.status === 401 || errorInfo.status === 403) {
        return { valid: false, error: errorInfo.message };
      }

      if (i < modelsToTry.length - 1) {
        await delay(300);
      }
    }
  }

  return { valid: false, error: '모든 모델 시도 실패' };
}

// OpenAI API 검증
async function validateOpenAI(apiKey: string, modelId?: string): Promise<{
  valid: boolean;
  model?: string;
  error?: string;
  warning?: string;
  rateLimited?: boolean;
}> {
  const model = modelId || 'gpt-4o-mini';

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say "OK"' }],
      max_tokens: 5,
    });

    if (response.choices[0]?.message?.content) {
      return { valid: true, model };
    }

    return { valid: false, error: '응답이 비어있습니다' };
  } catch (error) {
    const errorInfo = extractErrorDetails(error);

    if (errorInfo.status === 429) {
      return {
        valid: true,
        model,
        warning: '할당량 초과로 잠시 후 사용 가능합니다. API 키는 유효합니다.',
        rateLimited: true,
      };
    }

    return { valid: false, error: errorInfo.message };
  }
}

// Anthropic API 검증
async function validateAnthropic(apiKey: string, modelId?: string): Promise<{
  valid: boolean;
  model?: string;
  error?: string;
  warning?: string;
  rateLimited?: boolean;
}> {
  const model = modelId || 'claude-3-5-haiku-20241022';

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say "OK"' }],
    });

    if (response.content[0]?.type === 'text' && response.content[0].text) {
      return { valid: true, model };
    }

    return { valid: false, error: '응답이 비어있습니다' };
  } catch (error) {
    const errorInfo = extractErrorDetails(error);

    if (errorInfo.status === 429) {
      return {
        valid: true,
        model,
        warning: '할당량 초과로 잠시 후 사용 가능합니다. API 키는 유효합니다.',
        rateLimited: true,
      };
    }

    return { valid: false, error: errorInfo.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json() as {
      provider: AIProvider;
      apiKey: string;
      model?: string;
    };

    if (!provider || !apiKey) {
      return NextResponse.json(
        { valid: false, error: 'provider와 apiKey가 필요합니다' },
        { status: 400 }
      );
    }

    // 공급업체가 유효한지 확인
    if (!AI_PROVIDERS[provider]) {
      return NextResponse.json(
        { valid: false, error: '지원하지 않는 공급업체입니다' },
        { status: 400 }
      );
    }

    // API 키 형식 검증
    if (!validateApiKeyFormat(provider, apiKey)) {
      const config = AI_PROVIDERS[provider];
      return NextResponse.json(
        {
          valid: false,
          error: `잘못된 API 키 형식입니다. ${config.displayName} API 키는 "${config.apiKeyPrefix}"로 시작합니다.`,
          hint: config.apiKeyUrl,
        },
        { status: 400 }
      );
    }

    console.log(`Validating ${provider} API key...`);

    let result: {
      valid: boolean;
      model?: string;
      error?: string;
      warning?: string;
      rateLimited?: boolean;
    };

    switch (provider) {
      case 'google':
        result = await validateGoogle(apiKey, model);
        break;
      case 'openai':
        result = await validateOpenAI(apiKey, model);
        break;
      case 'anthropic':
        result = await validateAnthropic(apiKey, model);
        break;
      default:
        return NextResponse.json(
          { valid: false, error: '지원하지 않는 공급업체입니다' },
          { status: 400 }
        );
    }

    if (result.valid) {
      console.log(`✅ ${provider} API key is valid, model: ${result.model}`);
      return NextResponse.json({
        valid: true,
        provider,
        model: result.model,
        warning: result.warning,
        rateLimited: result.rateLimited,
      });
    } else {
      console.log(`❌ ${provider} API key validation failed:`, result.error);
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
          hint: AI_PROVIDERS[provider].apiKeyUrl,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Validation error:', error);
    const errorInfo = extractErrorDetails(error);
    return NextResponse.json(
      { valid: false, error: `서버 오류: ${errorInfo.message}` },
      { status: 500 }
    );
  }
}
