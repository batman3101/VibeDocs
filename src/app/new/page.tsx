'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IdeaForm, GenerationProgress } from '@/components/project';
import { DocumentPreview } from '@/components/document';
import { useProjectStore, useApiKey } from '@/stores';
import type { AppType, TemplateType, CoreDocuments, TodoItem } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { DOCUMENT_NAMES } from '@/types';

type Step = 'input' | 'generating' | 'preview';

const STEPS = [
  { id: 'input', label: '아이디어 입력' },
  { id: 'generating', label: '문서 생성' },
  { id: 'preview', label: '미리보기' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const { apiKey, hasApiKey } = useApiKey();

  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [projectData, setProjectData] = useState<{
    idea: string;
    appType: AppType;
    template?: TemplateType;
    projectName?: string;
  } | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<CoreDocuments | null>(null);
  const [generatedTodos, setGeneratedTodos] = useState<TodoItem[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleIdeaSubmit = async (idea: string, appType: AppType, template?: TemplateType, projectName?: string) => {
    if (!hasApiKey || !apiKey) {
      toast.error('API 키가 필요합니다', {
        description: '헤더의 API 설정에서 Google AI API 키를 입력해주세요.',
      });
      return;
    }

    setProjectData({ idea, appType, template, projectName });
    setCurrentStep('generating');
    setGenerationError(null);

    try {
      // Call the document generation API
      const response = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          idea,
          appType,
          template,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '문서 생성에 실패했습니다');
      }

      // Set generated documents
      const docs: CoreDocuments = {
        ideaBrief: data.documents.ideaBrief || '',
        userStories: data.documents.userStories || '',
        screenFlow: data.documents.screenFlow || '',
        prd: data.documents.prd || '',
        techStack: data.documents.techStack || '',
        dataModel: data.documents.dataModel || '',
        apiSpec: data.documents.apiSpec || '',
        testScenarios: data.documents.testScenarios || '',
        todoMaster: data.documents.todoMaster || '',
        promptGuide: data.documents.promptGuide || '',
      };

      setGeneratedDocs(docs);

      // Set generated TODOs
      if (data.todos && Array.isArray(data.todos)) {
        const todos: TodoItem[] = data.todos.map((t: {
          id: string;
          title: string;
          description: string;
          phase: string;
          status: string;
          priority: string;
          estimatedHours: number;
        }) => ({
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
        setGeneratedTodos(todos);
      }

      if (data.warnings && data.warnings.length > 0) {
        toast.warning('일부 문서 생성에 문제가 있었습니다', {
          description: '자세한 내용은 콘솔을 확인해주세요.',
        });
        console.warn('Document generation warnings:', data.warnings);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setGenerationError(errorMessage);
      toast.error('문서 생성 실패', {
        description: errorMessage,
        duration: 5000,
      });
      setCurrentStep('input');
    }
  };

  const handleGenerationComplete = useCallback(() => {
    setCurrentStep('preview');
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
          <IdeaForm onSubmit={handleIdeaSubmit} />
        )}

        {currentStep === 'generating' && (
          <GenerationProgress onComplete={handleGenerationComplete} />
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
