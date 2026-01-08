import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/types/ai-providers';
import type { CoreDocuments, StreamEvent, RegenerateRequest } from '@/types';

// Document system prompts (동일한 프롬프트 사용)
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

// 설정 상수
const MAX_RETRIES = 3;
const TIMEOUT_MS = 90000; // 90초

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

// 타임아웃 래퍼 함수
async function generateWithTimeout(
  provider: AIProvider,
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt: string,
  timeoutMs: number = TIMEOUT_MS
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`API 요청 시간 초과 (${timeoutMs / 1000}초)`));
    }, timeoutMs);

    generateWithProvider(provider, apiKey, model, prompt, systemPrompt)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// 재시도 로직 (지수 백오프)
async function generateWithRetry(
  provider: AIProvider,
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt: string,
  maxRetries: number = MAX_RETRIES,
  onRetry?: (attempt: number, error: string) => void
): Promise<{ content: string; retryCount: number }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const content = await generateWithTimeout(
        provider,
        apiKey,
        model,
        prompt,
        systemPrompt
      );
      return { content, retryCount: attempt - 1 };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMsg = lastError.message;

      console.log(`[Regenerate] Attempt ${attempt}/${maxRetries} failed: ${errorMsg}`);

      if (onRetry) {
        onRetry(attempt, errorMsg);
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        const isRateLimit = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate');
        const actualDelay = isRateLimit ? delay * 2 : delay;

        console.log(`[Regenerate] Waiting ${actualDelay / 1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
  }

  throw lastError || new Error('문서 재생성 실패');
}

// Send SSE event
function sendEvent(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  event: StreamEvent
) {
  const data = JSON.stringify(event);
  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
}

export async function POST(request: NextRequest) {
  try {
    const body: RegenerateRequest = await request.json();
    const {
      apiKey,
      idea,
      appType,
      template,
      provider = 'google',
      model = 'gemini-2.5-flash',
      documentKeys,
      existingDocs = {}
    } = body;

    if (!apiKey || !idea || !appType || !documentKeys || documentKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'API key, idea, appType, and documentKeys are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const documents: Partial<CoreDocuments> = { ...existingDocs };
        const totalSteps = documentKeys.length;

        // Send start event
        sendEvent(controller, encoder, {
          type: 'start',
          totalSteps,
        });

        for (let i = 0; i < documentKeys.length; i++) {
          const docKey = documentKeys[i];

          // Send progress event
          sendEvent(controller, encoder, {
            type: 'progress',
            documentKey: docKey,
            step: i + 1,
            totalSteps,
          });

          try {
            console.log(`[Regenerate] Generating ${docKey}...`);
            const systemPrompt = DOCUMENT_PROMPTS[docKey];

            if (!systemPrompt) {
              throw new Error(`알 수 없는 문서 키: ${docKey}`);
            }

            const { content, retryCount } = await generateWithRetry(
              provider as AIProvider,
              apiKey,
              model,
              baseContext,
              systemPrompt,
              MAX_RETRIES,
              (attempt, error) => {
                sendEvent(controller, encoder, {
                  type: 'progress',
                  documentKey: docKey,
                  step: i + 1,
                  totalSteps,
                  retryCount: attempt,
                  maxRetries: MAX_RETRIES,
                  error: `재시도 ${attempt}/${MAX_RETRIES}: ${error}`,
                });
              }
            );

            documents[docKey] = content;
            console.log(`[Regenerate] ✅ ${docKey} regenerated (retries: ${retryCount})`);

            sendEvent(controller, encoder, {
              type: 'document',
              documentKey: docKey,
              content,
              step: i + 1,
              totalSteps,
              retryCount,
            });

            // 문서 간 딜레이
            if (i < documentKeys.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }

          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[Regenerate] ❌ Error regenerating ${docKey}:`, errorMsg);

            sendEvent(controller, encoder, {
              type: 'error',
              documentKey: docKey,
              error: errorMsg,
              step: i + 1,
              totalSteps,
              retryCount: MAX_RETRIES,
              maxRetries: MAX_RETRIES,
            });
          }
        }

        // Send complete event
        sendEvent(controller, encoder, {
          type: 'complete',
          documents: documents as CoreDocuments,
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[Regenerate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({ error: `문서 재생성 실패: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
