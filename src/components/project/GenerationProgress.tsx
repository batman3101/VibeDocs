'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DOCUMENT_TITLES } from '@/types';
import type {
  CoreDocuments,
  TodoItem,
  AppType,
  TemplateType,
  DocumentStatus,
  DocumentState,
  StreamEvent
} from '@/types';

interface GenerationProgressProps {
  apiKey: string;
  idea: string;
  appType: AppType;
  template?: TemplateType;
  provider?: string;
  model?: string;
  onComplete: (docs: CoreDocuments, todos: TodoItem[]) => void;
  onError: (error: string) => void;
}

const DOCUMENT_KEYS = Object.keys(DOCUMENT_TITLES) as (keyof CoreDocuments)[];

export function GenerationProgress({
  apiKey,
  idea,
  appType,
  template,
  provider = 'google',
  model = 'gemini-2.5-flash',
  onComplete,
  onError
}: GenerationProgressProps) {
  const [documentStates, setDocumentStates] = useState<DocumentState[]>(
    DOCUMENT_KEYS.map(key => ({ key, status: 'pending' as DocumentStatus }))
  );
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const updateDocumentStatus = useCallback((
    docKey: keyof CoreDocuments,
    status: DocumentStatus,
    content?: string,
    error?: string
  ) => {
    setDocumentStates(prev => prev.map(doc =>
      doc.key === docKey
        ? { ...doc, status, content, error }
        : doc
    ));
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let hasCompleted = false;

    async function startGeneration() {
      try {
        setIsConnected(true);

        const response = await fetch('/api/generate-documents-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            idea,
            appType,
            template,
            provider,
            model
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '문서 생성 실패');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('스트림 연결 실패');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData: StreamEvent = JSON.parse(line.slice(6));

                switch (eventData.type) {
                  case 'start':
                    console.log('[Stream] Generation started');
                    break;

                  case 'progress':
                    if (eventData.documentKey) {
                      updateDocumentStatus(eventData.documentKey, 'generating');
                      setCurrentStep(eventData.step || 0);
                      setProgress(Math.round(((eventData.step || 0) / (eventData.totalSteps || 10)) * 100));
                    }
                    break;

                  case 'document':
                    if (eventData.documentKey) {
                      updateDocumentStatus(
                        eventData.documentKey,
                        'completed',
                        eventData.content
                      );
                    }
                    break;

                  case 'error':
                    if (eventData.documentKey) {
                      updateDocumentStatus(
                        eventData.documentKey,
                        'error',
                        eventData.content,
                        eventData.error
                      );
                    }
                    break;

                  case 'complete':
                    if (eventData.documents && eventData.todos && !hasCompleted) {
                      hasCompleted = true;
                      setProgress(100);

                      // Convert todos to TodoItem format
                      const todos: TodoItem[] = eventData.todos.map(t => ({
                        ...t,
                        source: 'core' as const,
                        status: 'pending' as const,
                        statusUpdatedBy: 'manual' as const,
                        dependencies: [],
                        prompt: `${t.title}을(를) 구현해주세요.`,
                        testCriteria: [`${t.title}이(가) 정상 작동하는지 확인`],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      }));

                      // Small delay for UI feedback
                      setTimeout(() => {
                        onComplete(eventData.documents!, todos);
                      }, 500);
                    }
                    break;
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE event:', line, parseError);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[Stream] Request aborted');
          return;
        }

        console.error('[Stream] Generation error:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        onError(errorMessage);
      } finally {
        setIsConnected(false);
      }
    }

    startGeneration();

    return () => {
      abortController.abort();
    };
  }, [apiKey, idea, appType, template, provider, model, onComplete, onError, updateDocumentStatus]);

  const getStatusIcon = (status: DocumentStatus, index: number) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <span className="text-xs font-medium">{index + 1}</span>;
    }
  };

  const getStatusStyle = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-green-50 dark:bg-green-950/20',
          icon: 'bg-green-500 text-white',
          text: 'text-green-700 dark:text-green-400',
        };
      case 'generating':
        return {
          container: 'bg-primary/5 ring-1 ring-primary',
          icon: 'bg-primary text-primary-foreground',
          text: 'text-foreground',
        };
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-950/20',
          icon: 'bg-red-500 text-white',
          text: 'text-red-700 dark:text-red-400',
        };
      default:
        return {
          container: 'bg-muted/50',
          icon: 'bg-muted text-muted-foreground',
          text: 'text-muted-foreground',
        };
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'generating':
        return '생성 중...';
      case 'error':
        return '실패';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold">문서 생성 중...</h2>
        <p className="text-muted-foreground">
          AI가 프로젝트에 필요한 문서를 생성하고 있습니다
        </p>
        {isConnected && (
          <p className="text-xs text-muted-foreground">
            실시간 연결됨 • {currentStep}/{DOCUMENT_KEYS.length} 문서
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {documentStates.map((doc, index) => {
          const style = getStatusStyle(doc.status);
          const label = getStatusLabel(doc.status);

          return (
            <div
              key={doc.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${style.container}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${style.icon}`}
              >
                {getStatusIcon(doc.status, index)}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-medium ${style.text}`}>
                  {DOCUMENT_TITLES[doc.key]}
                </span>
                {doc.error && (
                  <p className="text-xs text-red-500 mt-1 truncate">
                    {doc.error}
                  </p>
                )}
              </div>
              {label && (
                <span className={`text-xs ${
                  doc.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  doc.status === 'generating' ? 'text-primary' :
                  doc.status === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-muted-foreground'
                }`}>
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
