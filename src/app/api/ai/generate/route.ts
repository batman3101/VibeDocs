import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/types/ai-providers';
import { AI_PROVIDERS } from '@/types/ai-providers';

interface GenerateRequest {
  provider: AIProvider;
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

interface GenerateResponse {
  success: boolean;
  text?: string;
  error?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

// 에러에서 상세 정보 추출
function extractErrorDetails(error: unknown): { message: string; status?: number } {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes('API_KEY_INVALID') || message.includes('invalid') || message.includes('Incorrect API key')) {
      return { message: 'API 키가 유효하지 않습니다', status: 401 };
    }
    if (message.includes('429') || message.includes('quota') || message.includes('RATE_LIMIT') || message.includes('rate_limit')) {
      return { message: '할당량 초과 - 잠시 후 다시 시도하세요', status: 429 };
    }
    if (message.includes('404') || message.includes('not found') || message.includes('model_not_found')) {
      return { message: '모델을 찾을 수 없습니다', status: 404 };
    }
    if (message.includes('403') || message.includes('permission') || message.includes('PERMISSION_DENIED')) {
      return { message: 'API 접근 권한이 없습니다', status: 403 };
    }

    return { message: message.substring(0, 300) };
  }
  return { message: String(error).substring(0, 300) };
}

// Google Gemini 생성
async function generateWithGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string,
): Promise<GenerateResponse> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const aiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
    });

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      text,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
      },
    };
  } catch (error) {
    const errorInfo = extractErrorDetails(error);
    return { success: false, error: errorInfo.message };
  }
}

// OpenAI 생성
async function generateWithOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens?: number,
): Promise<GenerateResponse> {
  try {
    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens || 4096,
    });

    const text = response.choices[0]?.message?.content || '';

    return {
      success: true,
      text,
      usage: {
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      },
    };
  } catch (error) {
    const errorInfo = extractErrorDetails(error);
    return { success: false, error: errorInfo.message };
  }
}

// Anthropic 생성
async function generateWithAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens?: number,
): Promise<GenerateResponse> {
  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens || 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text;
      }
    }

    return {
      success: true,
      text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    const errorInfo = extractErrorDetails(error);
    return { success: false, error: errorInfo.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { provider, apiKey, model, prompt, systemPrompt, maxTokens } = body;

    // 필수 필드 검증
    if (!provider || !apiKey || !model || !prompt) {
      return NextResponse.json(
        { success: false, error: 'provider, apiKey, model, prompt가 필요합니다' },
        { status: 400 }
      );
    }

    // 공급업체가 유효한지 확인
    if (!AI_PROVIDERS[provider]) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 공급업체입니다' },
        { status: 400 }
      );
    }

    console.log(`Generating with ${provider}/${model}...`);

    let result: GenerateResponse;

    switch (provider) {
      case 'google':
        result = await generateWithGoogle(apiKey, model, prompt, systemPrompt);
        break;
      case 'openai':
        result = await generateWithOpenAI(apiKey, model, prompt, systemPrompt, maxTokens);
        break;
      case 'anthropic':
        result = await generateWithAnthropic(apiKey, model, prompt, systemPrompt, maxTokens);
        break;
      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 공급업체입니다' },
          { status: 400 }
        );
    }

    if (result.success) {
      console.log(`✅ Generation successful, ${result.usage?.outputTokens || 'N/A'} tokens`);
      return NextResponse.json(result);
    } else {
      console.error(`❌ Generation failed:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generation error:', error);
    const errorInfo = extractErrorDetails(error);
    return NextResponse.json(
      { success: false, error: `서버 오류: ${errorInfo.message}` },
      { status: 500 }
    );
  }
}
