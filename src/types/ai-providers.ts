// ============================================
// AI 공급업체 타입 정의
// ============================================

export type AIProvider = 'google' | 'openai' | 'anthropic';

export type PricingTier = 'free' | 'paid';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  tier: PricingTier;
  contextWindow: number;
  description: string;
  recommended?: boolean;
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  displayName: string;
  apiKeyPrefix: string;
  apiKeyPattern: RegExp;
  apiKeyPlaceholder: string;
  apiKeyUrl: string;
  docsUrl: string;
  models: AIModel[];
}

// ============================================
// 공급업체별 모델 목록
// ============================================

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google',
    displayName: 'Google Gemini',
    apiKeyPrefix: 'AIza',
    apiKeyPattern: /^AIza[A-Za-z0-9_-]{35}$/,
    apiKeyPlaceholder: 'AIza...',
    apiKeyUrl: 'https://aistudio.google.com/apikey',
    docsUrl: 'https://ai.google.dev/docs',
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'google',
        tier: 'free',
        contextWindow: 1000000,
        description: '최신 멀티모달 모델, 빠른 응답',
        recommended: true,
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (Exp)',
        provider: 'google',
        tier: 'free',
        contextWindow: 1000000,
        description: '실험적 기능 포함',
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        tier: 'free',
        contextWindow: 1000000,
        description: '안정적인 성능',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        tier: 'paid',
        contextWindow: 2000000,
        description: '최대 컨텍스트 윈도우',
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        tier: 'free',
        contextWindow: 32000,
        description: '레거시 모델',
      },
    ],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI GPT',
    apiKeyPrefix: 'sk-',
    apiKeyPattern: /^sk-[A-Za-z0-9_-]{32,}$/,
    apiKeyPlaceholder: 'sk-...',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/docs',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        tier: 'paid',
        contextWindow: 128000,
        description: '최신 멀티모달 모델',
        recommended: true,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        tier: 'paid',
        contextWindow: 128000,
        description: '비용 효율적인 소형 모델',
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        tier: 'paid',
        contextWindow: 128000,
        description: '빠른 GPT-4',
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        tier: 'paid',
        contextWindow: 16385,
        description: '저렴하고 빠른 모델',
      },
      {
        id: 'o1-preview',
        name: 'o1 Preview',
        provider: 'openai',
        tier: 'paid',
        contextWindow: 128000,
        description: '추론 특화 모델',
      },
      {
        id: 'o1-mini',
        name: 'o1 Mini',
        provider: 'openai',
        tier: 'paid',
        contextWindow: 128000,
        description: '추론 특화 소형 모델',
      },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Anthropic Claude',
    apiKeyPrefix: 'sk-ant-',
    apiKeyPattern: /^sk-ant-[A-Za-z0-9_-]{90,}$/,
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    docsUrl: 'https://docs.anthropic.com',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        provider: 'anthropic',
        tier: 'paid',
        contextWindow: 200000,
        description: '최신 균형 잡힌 모델',
        recommended: true,
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        tier: 'paid',
        contextWindow: 200000,
        description: '성능과 비용의 균형',
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        tier: 'paid',
        contextWindow: 200000,
        description: '빠르고 저렴한 모델',
      },
      {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        provider: 'anthropic',
        tier: 'paid',
        contextWindow: 200000,
        description: '최고 성능 모델',
      },
    ],
  },
};

// ============================================
// 헬퍼 함수
// ============================================

export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_PROVIDERS[provider];
}

export function getModelById(provider: AIProvider, modelId: string): AIModel | undefined {
  return AI_PROVIDERS[provider].models.find((m) => m.id === modelId);
}

export function getDefaultModel(provider: AIProvider): AIModel {
  const config = AI_PROVIDERS[provider];
  return config.models.find((m) => m.recommended) || config.models[0];
}

export function validateApiKeyFormat(provider: AIProvider, apiKey: string): boolean {
  const config = AI_PROVIDERS[provider];
  // 기본 접두사 검사
  if (!apiKey.startsWith(config.apiKeyPrefix)) {
    return false;
  }
  // 패턴 검사 (선택적 - 더 유연하게)
  return apiKey.length >= 20;
}

export function getAllProviders(): AIProviderConfig[] {
  return Object.values(AI_PROVIDERS);
}

export function getProviderByApiKeyPrefix(apiKey: string): AIProvider | null {
  for (const [providerId, config] of Object.entries(AI_PROVIDERS)) {
    if (apiKey.startsWith(config.apiKeyPrefix)) {
      return providerId as AIProvider;
    }
  }
  return null;
}
