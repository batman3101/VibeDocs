'use client';

import { useState } from 'react';
import { Key, Eye, EyeOff, Check, X, Loader2, ExternalLink } from 'lucide-react';
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
import { useApiKey } from '@/stores';
import { validateGeminiApiKey } from '@/lib/gemini';
import { toast } from 'sonner';

interface ApiKeyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ApiKeyModal({ trigger, open, onOpenChange }: ApiKeyModalProps) {
  const { apiKey, hasApiKey, isApiKeyValid, setApiKey, setApiKeyValid } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleValidate = async () => {
    if (!inputValue.trim()) {
      toast.error('API 키를 입력해주세요');
      return;
    }

    // Google AI API 키는 AIza로 시작
    if (!inputValue.startsWith('AIza')) {
      toast.error('유효하지 않은 Google AI API 키 형식입니다');
      return;
    }

    setIsValidating(true);

    try {
      const result = await validateGeminiApiKey(inputValue);

      if (result.valid) {
        setApiKey(inputValue);
        setApiKeyValid(true);

        // 할당량 초과 경고가 있는 경우
        if (result.warning) {
          toast.warning(`API 키 저장됨 (${result.model})`, {
            description: result.warning,
            duration: 6000,
          });
        } else {
          toast.success(`API 키가 저장되었습니다 (${result.model})`);
        }
        setIsOpen(false);
      } else {
        setApiKeyValid(false);
        toast.error(result.error || 'API 키 검증 실패', {
          description: result.hint || '콘솔에서 자세한 내용을 확인하세요.',
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

  const handleRemove = () => {
    setApiKey(undefined);
    setApiKeyValid(null);
    setInputValue('');
    toast.success('API 키가 삭제되었습니다');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (newOpen) {
      setInputValue(apiKey || '');
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.slice(0, 8) + '...' + key.slice(-4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google AI API 키 설정
          </DialogTitle>
          <DialogDescription>
            문서 생성에 필요한 Google AI (Gemini) API 키를 입력해주세요.
            <br />
            API 키는 브라우저에만 저장되며, 서버로 전송되지 않습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">API 키</label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="AIza..."
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
            <p className="text-xs text-muted-foreground">
              자동으로 사용 가능한 Gemini 모델을 선택합니다 (무료)
            </p>
          </div>

          {/* Status */}
          {hasApiKey && (
            <div className="flex items-center gap-2 text-sm">
              {isApiKeyValid === true && (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">API 키가 유효합니다</span>
                </>
              )}
              {isApiKeyValid === false && (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">API 키가 유효하지 않습니다</span>
                </>
              )}
              {isApiKeyValid === null && (
                <>
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">
                    저장됨: {maskApiKey(apiKey || '')}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Help Link */}
          <div className="text-sm text-muted-foreground">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Google AI Studio에서 API 키 발급받기
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasApiKey && (
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
