'use client';

import { useState, useEffect } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAIProvider } from '@/stores';
import { validateApiKey, quickValidateApiKeyFormat } from '@/lib/ai-client';
import { toast } from 'sonner';
import type { AIProvider as AIProviderType, AIModel } from '@/types/ai-providers';
import { AI_PROVIDERS, getProviderConfig, getModelById } from '@/types/ai-providers';

interface AIProviderModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AIProviderModal({ trigger, open, onOpenChange }: AIProviderModalProps) {
  const {
    aiProvider,
    aiModel,
    apiKeys,
    hasApiKey,
    isApiKeyValid,
    setAIProvider,
    setAIModel,
    setProviderApiKey,
    setApiKeyValid,
    clearProviderApiKey,
  } = useAIProvider();

  // Local state
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(aiProvider);
  const [selectedModel, setSelectedModel] = useState(aiModel);
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  // Controlled/uncontrolled dialog
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  // Get current provider config
  const providerConfig = getProviderConfig(selectedProvider);
  const currentApiKey = apiKeys[selectedProvider];

  // Update local state when provider changes
  useEffect(() => {
    if (isOpen) {
      setSelectedProvider(aiProvider);
      setSelectedModel(aiModel);
      setInputValue(currentApiKey || '');
    }
  }, [isOpen, aiProvider, aiModel, currentApiKey]);

  // Handle provider change
  const handleProviderChange = (provider: AIProviderType) => {
    setSelectedProvider(provider);
    // Set default model for new provider
    const config = getProviderConfig(provider);
    const defaultModel = config.models.find((m) => m.recommended) || config.models[0];
    setSelectedModel(defaultModel.id);
    // Load saved API key for this provider
    setInputValue(apiKeys[provider] || '');
  };

  // Handle model change
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  // Handle validate and save
  const handleValidate = async () => {
    const trimmedKey = inputValue.trim();

    if (!trimmedKey) {
      toast.error('API 키를 입력해주세요');
      return;
    }

    // Quick format check
    if (!quickValidateApiKeyFormat(selectedProvider, trimmedKey)) {
      toast.error(`${providerConfig.displayName} API 키는 "${providerConfig.apiKeyPrefix}"로 시작해야 합니다`);
      return;
    }

    setIsValidating(true);

    try {
      const result = await validateApiKey({
        provider: selectedProvider,
        apiKey: trimmedKey,
        model: selectedModel,
      });

      if (result.valid) {
        // Save settings
        setAIProvider(selectedProvider);
        setAIModel(selectedModel);
        setProviderApiKey(selectedProvider, trimmedKey);
        setApiKeyValid(true);

        // Show success message
        if (result.warning) {
          toast.warning(`API 키 저장됨 (${result.model})`, {
            description: result.warning,
            duration: 6000,
          });
        } else {
          toast.success(`API 키가 저장되었습니다 (${providerConfig.displayName})`);
        }

        setIsOpen(false);
      } else {
        setApiKeyValid(false);
        toast.error(result.error || 'API 키 검증 실패', {
          description: result.hint ? (
            <span>
              <a
                href={result.hint}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                API 키 발급 페이지 방문
              </a>
            </span>
          ) : '콘솔에서 자세한 내용을 확인하세요.',
          duration: 8000,
        });
      }
    } catch (error) {
      setApiKeyValid(false);
      const errorMsg = error instanceof Error ? error.message : '';
      toast.error('API 키 검증 오류', {
        description: errorMsg || '알 수 없는 오류가 발생했습니다.',
        duration: 5000,
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle remove API key
  const handleRemove = () => {
    clearProviderApiKey(selectedProvider);
    setInputValue('');
    toast.success(`${providerConfig.displayName} API 키가 삭제되었습니다`);
  };

  // Handle dialog open change
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (newOpen) {
      setSelectedProvider(aiProvider);
      setSelectedModel(aiModel);
      setInputValue(apiKeys[aiProvider] || '');
    }
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.slice(0, 8) + '...' + key.slice(-4);
  };

  // Get model info
  const currentModelInfo = getModelById(selectedProvider, selectedModel);

  // Provider icons
  const getProviderIcon = (provider: AIProviderType) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        );
      case 'openai':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
          </svg>
        );
      case 'anthropic':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.304 3.541h-3.672l6.696 16.918H24l-6.696-16.918zM6.696 3.541L0 20.459h3.768l1.272-3.312h6.384l1.272 3.312H16.44l-6.696-16.918H6.696zm-.408 10.776l2.16-5.616L10.608 14.317H6.288z" />
          </svg>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="sm:max-w-lg overflow-visible"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking on Select dropdown
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-content]') || target.closest('[data-slot="select-content"]') || target.closest('[role="listbox"]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent interaction outside from closing the dialog when Select is open
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-content]') || target.closest('[data-slot="select-content"]') || target.closest('[role="listbox"]')) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          // Prevent focus from being stolen when interacting with Select
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-content]') || target.closest('[data-slot="select-content"]') || target.closest('[role="listbox"]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI 공급업체 설정
          </DialogTitle>
          <DialogDescription>
            문서 생성에 사용할 AI 공급업체와 모델을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Alert */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">API 공급사와 모델 선택은 신중하게 결정하세요</p>
            <p className="text-xs mt-1 opacity-80">
              유료 모델은 API 사용량에 따라 비용이 발생합니다.
            </p>
          </div>
        </div>

        <div className="space-y-4 py-2">
          {/* AI Provider Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI 공급업체</label>
            <Select value={selectedProvider} onValueChange={(v) => handleProviderChange(v as AIProviderType)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getProviderIcon(selectedProvider)}
                    <span>{providerConfig.displayName}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {Object.values(AI_PROVIDERS).map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      {getProviderIcon(provider.id)}
                      <span>{provider.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">모델</label>
            <Select key={selectedProvider} value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center justify-between w-full">
                    <span>{currentModelInfo?.name || selectedModel}</span>
                    {currentModelInfo && (
                      <Badge
                        variant={currentModelInfo.tier === 'free' ? 'default' : 'secondary'}
                        className={
                          currentModelInfo.tier === 'free'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
                        }
                      >
                        {currentModelInfo.tier === 'free' ? '무료' : '유료'}
                      </Badge>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {providerConfig.models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-2">
                        {model.recommended && (
                          <Sparkles className="h-3 w-3 text-amber-500" />
                        )}
                        <span>{model.name}</span>
                      </div>
                      <Badge
                        variant={model.tier === 'free' ? 'default' : 'secondary'}
                        className={
                          model.tier === 'free'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
                        }
                      >
                        {model.tier === 'free' ? '무료' : '유료'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentModelInfo && (
              <p className="text-xs text-muted-foreground">{currentModelInfo.description}</p>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">API 키</label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder={providerConfig.apiKeyPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* API Key Status */}
          {currentApiKey && selectedProvider === aiProvider && (
            <div className="flex items-center gap-2 text-sm">
              {isApiKeyValid === true && (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">API 키가 유효합니다</span>
                </>
              )}
              {isApiKeyValid === false && (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">API 키가 유효하지 않습니다</span>
                </>
              )}
              {isApiKeyValid === null && (
                <>
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">
                    저장됨: {maskApiKey(currentApiKey)}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Help Link */}
          <div className="text-sm">
            <a
              href={providerConfig.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {providerConfig.displayName}에서 API 키 발급받기
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentApiKey && (
            <Button variant="outline" onClick={handleRemove} className="sm:mr-auto">
              삭제
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleValidate} disabled={isValidating || !inputValue.trim()}>
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                검증 중...
              </>
            ) : (
              '저장'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
