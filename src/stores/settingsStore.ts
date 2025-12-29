import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Settings } from '@/types';
import type { AIProvider } from '@/types/ai-providers';
import { getDefaultModel } from '@/types/ai-providers';

// ============================================
// 기본 설정
// ============================================

const DEFAULT_SETTINGS: Settings = {
  // 기존 필드
  apiKey: undefined,
  theme: 'system',
  language: 'ko',
  autoSave: true,
  autoSaveInterval: 500, // 500ms 디바운스

  // 새로운 AI 공급업체 필드
  aiProvider: 'google',
  aiModel: 'gemini-2.5-flash',
  apiKeys: {},
};

// ============================================
// 마이그레이션: 기존 apiKey를 apiKeys로 변환
// ============================================

function migrateSettings(stored: unknown): Settings {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const old = stored as Record<string, unknown>;

  // 이미 마이그레이션된 경우
  if (old.apiKeys && typeof old.apiKeys === 'object') {
    return {
      ...DEFAULT_SETTINGS,
      ...old,
    } as Settings;
  }

  // 기존 apiKey가 있으면 google apiKeys로 마이그레이션
  if (old.apiKey && typeof old.apiKey === 'string') {
    return {
      ...DEFAULT_SETTINGS,
      ...old,
      aiProvider: 'google',
      aiModel: 'gemini-2.5-flash',
      apiKeys: { google: old.apiKey },
    } as Settings;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...old,
  } as Settings;
}

// ============================================
// 스토어 타입
// ============================================

interface SettingsState {
  // 상태
  settings: Settings;
  isApiKeyValid: boolean | null; // null = 검증 전

  // 기존 액션 (하위 호환성)
  setApiKey: (apiKey: string | undefined) => void;
  setTheme: (theme: Settings['theme']) => void;
  setLanguage: (language: Settings['language']) => void;
  setAutoSave: (enabled: boolean) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  setApiKeyValid: (isValid: boolean | null) => void;
  resetSettings: () => void;

  // 새로운 AI 공급업체 액션
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (modelId: string) => void;
  setProviderApiKey: (provider: AIProvider, apiKey: string | undefined) => void;
  getActiveApiKey: () => string | undefined;
  clearProviderApiKey: (provider: AIProvider) => void;
}

// ============================================
// 스토어 생성
// ============================================

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      settings: DEFAULT_SETTINGS,
      isApiKeyValid: null,

      // 기존 액션 (하위 호환성 유지)
      setApiKey: (apiKey) => {
        const state = get();
        set({
          settings: {
            ...state.settings,
            apiKey,
            // 기존 방식으로 설정되면 google로 간주
            apiKeys: {
              ...state.settings.apiKeys,
              google: apiKey,
            },
          },
          isApiKeyValid: null,
        });
      },

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      setLanguage: (language) => {
        set((state) => ({
          settings: { ...state.settings, language },
        }));
      },

      setAutoSave: (autoSave) => {
        set((state) => ({
          settings: { ...state.settings, autoSave },
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      setApiKeyValid: (isApiKeyValid) => set({ isApiKeyValid }),

      resetSettings: () => set({
        settings: DEFAULT_SETTINGS,
        isApiKeyValid: null,
      }),

      // 새로운 AI 공급업체 액션
      setAIProvider: (provider) => {
        const defaultModel = getDefaultModel(provider);
        set((state) => ({
          settings: {
            ...state.settings,
            aiProvider: provider,
            aiModel: defaultModel.id,
          },
          isApiKeyValid: null, // 공급업체 변경 시 검증 상태 리셋
        }));
      },

      setAIModel: (modelId) => {
        set((state) => ({
          settings: { ...state.settings, aiModel: modelId },
        }));
      },

      setProviderApiKey: (provider, apiKey) => {
        set((state) => ({
          settings: {
            ...state.settings,
            apiKeys: {
              ...state.settings.apiKeys,
              [provider]: apiKey,
            },
            // 현재 공급업체의 키를 설정하는 경우 apiKey도 업데이트 (하위 호환성)
            ...(state.settings.aiProvider === provider && { apiKey }),
          },
          isApiKeyValid: null,
        }));
      },

      getActiveApiKey: () => {
        const state = get();
        return state.settings.apiKeys[state.settings.aiProvider];
      },

      clearProviderApiKey: (provider) => {
        set((state) => {
          const newApiKeys = { ...state.settings.apiKeys };
          delete newApiKeys[provider];
          return {
            settings: {
              ...state.settings,
              apiKeys: newApiKeys,
              // 현재 공급업체의 키를 삭제하는 경우 apiKey도 삭제
              ...(state.settings.aiProvider === provider && { apiKey: undefined }),
            },
            isApiKeyValid: null,
          };
        });
      },
    }),
    {
      name: 'vibedocs-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
      }),
      // 마이그레이션 적용
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.settings = migrateSettings(state.settings);
        }
      },
    }
  )
);

// ============================================
// 헬퍼 훅
// ============================================

// 기존 useApiKey 훅 (하위 호환성)
export const useApiKey = () => {
  const settings = useSettingsStore((state) => state.settings);
  const isApiKeyValid = useSettingsStore((state) => state.isApiKeyValid);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const setApiKeyValid = useSettingsStore((state) => state.setApiKeyValid);

  // 현재 선택된 공급업체의 API 키 반환
  const apiKey = settings.apiKeys[settings.aiProvider] || settings.apiKey;

  return {
    apiKey,
    isApiKeyValid,
    hasApiKey: !!apiKey,
    setApiKey,
    setApiKeyValid,
  };
};

// 새로운 AI 공급업체 훅
export const useAIProvider = () => {
  const settings = useSettingsStore((state) => state.settings);
  const isApiKeyValid = useSettingsStore((state) => state.isApiKeyValid);
  const setAIProvider = useSettingsStore((state) => state.setAIProvider);
  const setAIModel = useSettingsStore((state) => state.setAIModel);
  const setProviderApiKey = useSettingsStore((state) => state.setProviderApiKey);
  const setApiKeyValid = useSettingsStore((state) => state.setApiKeyValid);
  const clearProviderApiKey = useSettingsStore((state) => state.clearProviderApiKey);

  const activeApiKey = settings.apiKeys[settings.aiProvider];

  return {
    aiProvider: settings.aiProvider,
    aiModel: settings.aiModel,
    apiKeys: settings.apiKeys,
    activeApiKey,
    hasApiKey: !!activeApiKey,
    isApiKeyValid,
    setAIProvider,
    setAIModel,
    setProviderApiKey,
    setApiKeyValid,
    clearProviderApiKey,
  };
};

export const useTheme = () => {
  const theme = useSettingsStore((state) => state.settings.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return { theme, setTheme };
};
