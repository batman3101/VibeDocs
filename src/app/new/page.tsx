'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IdeaForm, GenerationProgress } from '@/components/project';
import { DocumentPreview } from '@/components/document';
import { useProjectStore, useApiKey, useAIProvider } from '@/stores';
import type { AppType, TemplateType, CoreDocuments, TodoItem } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { DOCUMENT_NAMES, DOCUMENT_TITLES } from '@/types';

type Step = 'input' | 'generating' | 'preview';

const STEPS = [
  { id: 'input', label: '아이디어 입력' },
  { id: 'generating', label: '문서 생성' },
  { id: 'preview', label: '미리보기' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, getPartialGeneration, clearPartialGeneration } = useProjectStore();
  const { apiKey, hasApiKey } = useApiKey();
  const { aiProvider, aiModel } = useAIProvider();

  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [projectData, setProjectData] = useState<{
    idea: string;
    appType: AppType;
    template?: TemplateType;
    projectName?: string;
  } | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<CoreDocuments | null>(null);
  const [generatedTodos, setGeneratedTodos] = useState<TodoItem[]>([]);
  const [failedDocs, setFailedDocs] = useState<(keyof CoreDocuments)[]>([]);
  const [existingDocs, setExistingDocs] = useState<Partial<CoreDocuments>>({});
  const [hasPartialGeneration, setHasPartialGeneration] = useState(false);

  // 미완료 생성 상태 확인
  useEffect(() => {
    const partial = getPartialGeneration();
    if (partial && Object.keys(partial.completedDocs).length > 0) {
      setHasPartialGeneration(true);
    }
  }, [getPartialGeneration]);

  const handleIdeaSubmit = async (idea: string, appType: AppType, template?: TemplateType, projectName?: string) => {
    if (!hasApiKey || !apiKey) {
      toast.error('API 키가 필요합니다', {
        description: '헤더의 API 설정에서 API 키를 입력해주세요.',
      });
      return;
    }

    setProjectData({ idea, appType, template, projectName });
    setExistingDocs({});  // 새 프로젝트는 기존 문서 없음
    setFailedDocs([]);
    setCurrentStep('generating');
  };

  // 이전 생성 이어서 진행
  const handleResumeGeneration = useCallback(() => {
    const partial = getPartialGeneration();
    if (!partial || !hasApiKey || !apiKey) return;

    setProjectData({
      idea: partial.idea,
      appType: partial.appType,
      template: partial.template,
    });
    setExistingDocs(partial.completedDocs);
    setFailedDocs(partial.failedDocs);
    setCurrentStep('generating');

    toast.info('이전 생성을 이어서 진행합니다', {
      description: `${Object.keys(partial.completedDocs).length}개 문서가 이미 생성되어 있습니다.`,
    });
  }, [getPartialGeneration, hasApiKey, apiKey]);

  // 이전 생성 삭제
  const handleDiscardPartial = useCallback(() => {
    clearPartialGeneration();
    setHasPartialGeneration(false);
    toast.info('이전 생성 데이터가 삭제되었습니다');
  }, [clearPartialGeneration]);

  const handleGenerationComplete = useCallback((docs: CoreDocuments, todos: TodoItem[]) => {
    setGeneratedDocs(docs);
    setGeneratedTodos(todos);
    setFailedDocs([]);
    setCurrentStep('preview');
    toast.success('문서 생성이 완료되었습니다');
  }, []);

  // 부분 완료 처리 (일부 문서만 성공)
  const handlePartialSave = useCallback((docs: Partial<CoreDocuments>, failed: (keyof CoreDocuments)[]) => {
    // 실패한 문서는 플레이스홀더로 채우기
    const completeDocs: CoreDocuments = {
      ideaBrief: docs.ideaBrief || `# 아이디어 개요\n\n문서 생성에 실패했습니다.`,
      userStories: docs.userStories || `# 사용자 스토리\n\n문서 생성에 실패했습니다.`,
      screenFlow: docs.screenFlow || `# 화면 흐름도\n\n문서 생성에 실패했습니다.`,
      prd: docs.prd || `# PRD 핵심 문서\n\n문서 생성에 실패했습니다.`,
      techStack: docs.techStack || `# 기술 스택\n\n문서 생성에 실패했습니다.`,
      dataModel: docs.dataModel || `# 데이터 모델\n\n문서 생성에 실패했습니다.`,
      apiSpec: docs.apiSpec || `# API 명세서\n\n문서 생성에 실패했습니다.`,
      testScenarios: docs.testScenarios || `# 테스트 시나리오\n\n문서 생성에 실패했습니다.`,
      todoMaster: docs.todoMaster || `# TODO 마스터\n\n## Phase 1: 기본 설정\n- [ ] 프로젝트 초기화`,
      promptGuide: docs.promptGuide || `# 프롬프트 가이드\n\n문서 생성에 실패했습니다.`,
    };

    setGeneratedDocs(completeDocs);
    setFailedDocs(failed);

    // 기본 TODO 생성
    const defaultTodos: TodoItem[] = [
      {
        id: 'TODO-001',
        title: '프로젝트 초기화',
        description: 'Phase 1: 프로젝트 초기화',
        phase: 'Phase 1: 프로젝트 설정',
        source: 'core',
        status: 'pending',
        statusUpdatedBy: 'manual',
        priority: 'critical',
        estimatedHours: 2,
        dependencies: [],
        prompt: '프로젝트를 초기화해주세요.',
        testCriteria: ['프로젝트가 정상적으로 초기화되었는지 확인'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setGeneratedTodos(defaultTodos);

    setCurrentStep('preview');

    if (failed.length > 0) {
      toast.warning(`${failed.length}개 문서 생성에 실패했습니다`, {
        description: '미리보기에서 실패한 문서를 확인할 수 있습니다.',
      });
    }
  }, []);

  const handleGenerationError = useCallback((error: string) => {
    toast.error('문서 생성 실패', {
      description: error,
      duration: 5000,
    });
    setCurrentStep('input');
  }, []);

  const handleDownloadAll = async () => {
    if (!generatedDocs || !projectData) return;

    const zip = new JSZip();
    const folder = zip.folder('VIBEDOCS');

    if (folder) {
      Object.entries(generatedDocs).forEach(([key, content]) => {
        const filename = DOCUMENT_NAMES[key as keyof CoreDocuments];
        folder.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'VIBEDOCS.zip');
      toast.success('전체 문서가 다운로드되었습니다');
    }
  };

  const handleContinue = () => {
    if (!generatedDocs || !projectData) return;

    // Create project with AI-generated TODOs
    createProject({
      name: projectData.projectName || projectData.idea.slice(0, 50),
      description: projectData.idea,
      appType: projectData.appType,
      template: projectData.template,
      coreDocs: generatedDocs,
      extensions: [],
      todos: generatedTodos,
    });

    toast.success('프로젝트가 생성되었습니다');
    router.push('/dashboard');
  };

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로
        </Button>
        <h1 className="text-3xl font-bold">새 프로젝트</h1>
        <p className="text-muted-foreground mt-1">
          아이디어를 입력하면 AI가 개발에 필요한 문서를 자동으로 생성합니다
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-12">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index < stepIndex
                    ? 'bg-primary border-primary text-primary-foreground'
                    : index === stepIndex
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                }`}
              >
                {index < stepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  index < stepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {currentStep === 'input' && (
          <>
            {/* 이전 생성 복구 알림 */}
            {hasPartialGeneration && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      이전에 생성 중이던 문서가 있습니다
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      이어서 생성하거나 새로 시작할 수 있습니다.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={handleResumeGeneration}
                        disabled={!hasApiKey}
                      >
                        이어서 생성하기
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDiscardPartial}
                      >
                        삭제하고 새로 시작
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <IdeaForm onSubmit={handleIdeaSubmit} />
          </>
        )}

        {currentStep === 'generating' && projectData && apiKey && (
          <GenerationProgress
            apiKey={apiKey}
            idea={projectData.idea}
            appType={projectData.appType}
            template={projectData.template}
            provider={aiProvider}
            model={aiModel}
            existingDocs={existingDocs}
            skipDocuments={Object.keys(existingDocs) as (keyof CoreDocuments)[]}
            onComplete={handleGenerationComplete}
            onError={handleGenerationError}
            onPartialSave={handlePartialSave}
          />
        )}

        {currentStep === 'preview' && generatedDocs && (
          <DocumentPreview
            documents={generatedDocs}
            onDownloadAll={handleDownloadAll}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
}
