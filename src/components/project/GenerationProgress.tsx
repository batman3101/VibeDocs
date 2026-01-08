'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Check, Loader2, FileText, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DOCUMENT_TITLES } from '@/types';
import { useProjectStore } from '@/stores/projectStore';
import type {
  CoreDocuments,
  TodoItem,
  AppType,
  TemplateType,
  DocumentStatus,
  DocumentState,
  StreamEvent,
  PartialGenerationState,
} from '@/types';

interface GenerationProgressProps {
  apiKey: string;
  idea: string;
  appType: AppType;
  template?: TemplateType;
  provider?: string;
  model?: string;
  existingDocs?: Partial<CoreDocuments>;  // 이미 생성된 문서 (재시도 시)
  skipDocuments?: (keyof CoreDocuments)[];  // 건너뛸 문서 목록
  onComplete: (docs: CoreDocuments, todos: TodoItem[]) => void;
  onError: (error: string) => void;
  onPartialSave?: (docs: Partial<CoreDocuments>, failedDocs: (keyof CoreDocuments)[]) => void;
}

const DOCUMENT_KEYS = Object.keys(DOCUMENT_TITLES) as (keyof CoreDocuments)[];

export function GenerationProgress({
  apiKey,
  idea,
  appType,
  template,
  provider = 'google',
  model = 'gemini-2.5-flash',
  existingDocs = {},
  skipDocuments = [],
  onComplete,
  onError,
  onPartialSave
}: GenerationProgressProps) {
  // 초기 상태: 이미 생성된 문서는 completed로 설정
  const [documentStates, setDocumentStates] = useState<DocumentState[]>(
    DOCUMENT_KEYS.map(key => ({
      key,
      status: (existingDocs[key] || skipDocuments.includes(key))
        ? 'completed' as DocumentStatus
        : 'pending' as DocumentStatus,
      content: existingDocs[key],
    }))
  );
  const [progress, setProgress] = useState(() => {
    const completedCount = skipDocuments.length + Object.keys(existingDocs).length;
    return Math.round((completedCount / DOCUMENT_KEYS.length) * 100);
  });
  const [currentStep, setCurrentStep] = useState(skipDocuments.length);
  const [isConnected, setIsConnected] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // 생성된 문서 저장용 ref
  const generatedDocsRef = useRef<Partial<CoreDocuments>>({ ...existingDocs });
  const failedDocsRef = useRef<(keyof CoreDocuments)[]>([]);

  // Zustand 스토어
  const {
    savePartialGeneration,
    updatePartialDocument,
    markDocumentFailed,
    clearPartialGeneration,
  } = useProjectStore();

  // 부분 생성 상태 초기화
  useEffect(() => {
    const projectId = crypto.randomUUID();
    const pendingDocs = DOCUMENT_KEYS.filter(
      key => !existingDocs[key] && !skipDocuments.includes(key)
    );

    savePartialGeneration({
      projectId,
      idea,
      appType,
      template,
      provider,
      model,
      completedDocs: existingDocs,
      failedDocs: [],
      pendingDocs,
      lastUpdated: new Date(),
    });
  }, []);

  const updateDocumentStatus = useCallback((
    docKey: keyof CoreDocuments,
    status: DocumentStatus,
    content?: string,
    error?: string,
    retryCount?: number
  ) => {
    setDocumentStates(prev => prev.map(doc =>
      doc.key === docKey
        ? { ...doc, status, content, error, retryCount }
        : doc
    ));

    // 문서가 완료되면 저장
    if (status === 'completed' && content) {
      generatedDocsRef.current[docKey] = content;
      updatePartialDocument(docKey, content);
    }

    // 에러 발생 시 실패 목록에 추가
    if (status === 'error') {
      if (!failedDocsRef.current.includes(docKey)) {
        failedDocsRef.current.push(docKey);
      }
      markDocumentFailed(docKey);
      setHasErrors(true);
    }
  }, [updatePartialDocument, markDocumentFailed]);

  // 실패한 문서만 재생성
  const handleRetryFailed = useCallback(async () => {
    const failedKeys = documentStates
      .filter(d => d.status === 'error')
      .map(d => d.key);

    if (failedKeys.length === 0) return;

    setIsRetrying(true);
    setHasErrors(false);

    // 실패한 문서들을 pending으로 리셋
    setDocumentStates(prev => prev.map(doc =>
      failedKeys.includes(doc.key)
        ? { ...doc, status: 'pending' as DocumentStatus, error: undefined }
        : doc
    ));

    try {
      const response = await fetch('/api/regenerate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          idea,
          appType,
          template,
          provider,
          model,
          documentKeys: failedKeys,
          existingDocs: generatedDocsRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '재생성 실패');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('스트림 연결 실패');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData: StreamEvent = JSON.parse(line.slice(6));

              switch (eventData.type) {
                case 'progress':
                  if (eventData.documentKey) {
                    updateDocumentStatus(eventData.documentKey, 'generating');
                  }
                  break;

                case 'document':
                  if (eventData.documentKey && eventData.content) {
                    updateDocumentStatus(
                      eventData.documentKey,
                      'completed',
                      eventData.content
                    );
                    // 실패 목록에서 제거
                    failedDocsRef.current = failedDocsRef.current.filter(k => k !== eventData.documentKey);
                  }
                  break;

                case 'error':
                  if (eventData.documentKey) {
                    updateDocumentStatus(
                      eventData.documentKey,
                      'error',
                      undefined,
                      eventData.error
                    );
                  }
                  break;

                case 'complete':
                  // 재생성 완료 후 전체 진행률 업데이트
                  const completedCount = documentStates.filter(
                    d => d.status === 'completed' || generatedDocsRef.current[d.key]
                  ).length;
                  setProgress(Math.round((completedCount / DOCUMENT_KEYS.length) * 100));
                  break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', line, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Retry error:', error);
      const errorMessage = error instanceof Error ? error.message : '재생성 실패';
      // 재시도 실패 시 에러 상태로 복원
      failedKeys.forEach(key => {
        if (!generatedDocsRef.current[key]) {
          updateDocumentStatus(key, 'error', undefined, errorMessage);
        }
      });
    } finally {
      setIsRetrying(false);
    }
  }, [apiKey, idea, appType, template, provider, model, documentStates, updateDocumentStatus]);

  // 부분 완료로 계속 진행
  const handleContinueWithPartial = useCallback(() => {
    const completedDocs: Partial<CoreDocuments> = {};
    const failed: (keyof CoreDocuments)[] = [];

    documentStates.forEach(doc => {
      if (doc.status === 'completed' && doc.content) {
        completedDocs[doc.key] = doc.content;
      } else if (doc.status === 'error') {
        failed.push(doc.key);
        // 실패한 문서는 플레이스홀더로
        completedDocs[doc.key] = `# ${DOCUMENT_TITLES[doc.key]}\n\n문서 생성에 실패했습니다. 나중에 재생성해주세요.`;
      }
    });

    // 저장된 문서 합치기
    const finalDocs = { ...completedDocs, ...generatedDocsRef.current };

    if (onPartialSave) {
      onPartialSave(finalDocs, failed);
    }

    clearPartialGeneration();
  }, [documentStates, onPartialSave, clearPartialGeneration]);

  useEffect(() => {
    const abortController = new AbortController();
    let hasCompleted = false;

    async function startGeneration() {
      try {
        setIsConnected(true);

        // 건너뛸 문서 목록 계산
        const docsToSkip = [
          ...skipDocuments,
          ...Object.keys(existingDocs) as (keyof CoreDocuments)[]
        ];

        const response = await fetch('/api/generate-documents-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            idea,
            appType,
            template,
            provider,
            model,
            skipDocuments: docsToSkip,
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

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

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
                      // 재시도 중 상태 표시
                      if (eventData.retryCount && eventData.retryCount > 0) {
                        updateDocumentStatus(
                          eventData.documentKey,
                          'generating',
                          undefined,
                          eventData.error,
                          eventData.retryCount
                        );
                      } else {
                        updateDocumentStatus(eventData.documentKey, 'generating');
                      }
                      setCurrentStep(eventData.step || 0);
                      setProgress(Math.round(((eventData.step || 0) / (eventData.totalSteps || 10)) * 100));
                    }
                    break;

                  case 'document':
                    if (eventData.documentKey) {
                      // 스킵된 문서는 기존 콘텐츠 사용
                      const content = eventData.content || existingDocs[eventData.documentKey];
                      if (content) {
                        updateDocumentStatus(
                          eventData.documentKey,
                          'completed',
                          content
                        );
                      }
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
                      setGenerationComplete(true);
                      setProgress(100);

                      // 저장된 문서와 합치기
                      const finalDocs = {
                        ...existingDocs,
                        ...generatedDocsRef.current,
                        ...eventData.documents,
                      } as CoreDocuments;

                      // 에러가 있는지 확인
                      const hasAnyErrors = documentStates.some(d => d.status === 'error') ||
                        failedDocsRef.current.length > 0;

                      if (hasAnyErrors) {
                        setHasErrors(true);
                        // 부분 저장 콜백 호출
                        if (onPartialSave) {
                          onPartialSave(finalDocs, failedDocsRef.current);
                        }
                      } else {
                        // 모든 문서 성공 - 완료 처리
                        clearPartialGeneration();

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

                        setTimeout(() => {
                          onComplete(finalDocs, todos);
                        }, 500);
                      }
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
  }, [apiKey, idea, appType, template, provider, model, skipDocuments, existingDocs, onComplete, onError, updateDocumentStatus, clearPartialGeneration, onPartialSave]);

  const getStatusIcon = (status: DocumentStatus, index: number, retryCount?: number) => {
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

  const getStatusLabel = (doc: DocumentState) => {
    switch (doc.status) {
      case 'completed':
        return '완료';
      case 'generating':
        if (doc.retryCount && doc.retryCount > 0) {
          return `재시도 중 (${doc.retryCount}/3)`;
        }
        return '생성 중...';
      case 'error':
        return '실패';
      default:
        return '';
    }
  };

  const failedCount = documentStates.filter(d => d.status === 'error').length;
  const completedCount = documentStates.filter(d => d.status === 'completed').length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold">
          {hasErrors ? '일부 문서 생성 실패' : '문서 생성 중...'}
        </h2>
        <p className="text-muted-foreground">
          {hasErrors
            ? `${completedCount}개 완료, ${failedCount}개 실패`
            : 'AI가 프로젝트에 필요한 문서를 생성하고 있습니다'}
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

      {/* Error Actions */}
      {hasErrors && generationComplete && (
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleRetryFailed}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                재시도 중...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                실패한 문서 재생성 ({failedCount}개)
              </>
            )}
          </Button>
          <Button onClick={handleContinueWithPartial}>
            완료된 문서로 계속
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-3">
        {documentStates.map((doc, index) => {
          const style = getStatusStyle(doc.status);
          const label = getStatusLabel(doc);

          return (
            <div
              key={doc.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${style.container}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${style.icon}`}
              >
                {getStatusIcon(doc.status, index, doc.retryCount)}
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
