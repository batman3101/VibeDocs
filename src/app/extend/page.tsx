'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Sparkles, FileText, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjectStore, useApiKey } from '@/stores';
import { toast } from 'sonner';
import type { Extension, ExtensionDocuments, TodoItem } from '@/types';

type Step = 'input' | 'generating' | 'preview';

const EXTENSION_DOCS = [
  { key: 'prd', name: 'PRD 확장', description: '새 기능 요구사항 정의' },
  { key: 'dataModel', name: '데이터 모델 확장', description: '추가 데이터 구조' },
  { key: 'testScenarios', name: '테스트 시나리오', description: '새 기능 테스트 케이스' },
  { key: 'todo', name: 'TODO 확장', description: '추가 개발 태스크' },
];

export default function ExtendPage() {
  const router = useRouter();
  const { project, addExtension } = useProjectStore();
  const { apiKey, hasApiKey } = useApiKey();
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [featureName, setFeatureName] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState<ExtensionDocuments | null>(null);
  const [generatedTodos, setGeneratedTodos] = useState<TodoItem[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentDoc, setCurrentDoc] = useState('');

  const handleGenerate = async () => {
    if (!featureName.trim() || !featureDescription.trim()) {
      toast.error('기능명과 설명을 모두 입력해주세요');
      return;
    }

    if (featureDescription.length < 30) {
      toast.error('기능 설명을 30자 이상 입력해주세요');
      return;
    }

    if (!hasApiKey || !apiKey) {
      toast.error('API 키가 필요합니다', {
        description: '헤더의 API 설정에서 Google AI API 키를 입력해주세요.',
      });
      return;
    }

    setCurrentStep('generating');
    setGenerationProgress(0);

    try {
      // Start progress animation
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += 5;
        if (progressValue <= 90) {
          setGenerationProgress(progressValue);
          const docIndex = Math.floor((progressValue / 100) * EXTENSION_DOCS.length);
          if (docIndex < EXTENSION_DOCS.length) {
            setCurrentDoc(EXTENSION_DOCS[docIndex].name);
          }
        }
      }, 500);

      // Call the extension generation API
      const response = await fetch('/api/generate-extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          featureName,
          featureDescription,
          projectContext: project?.description,
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '확장 문서 생성에 실패했습니다');
      }

      setGenerationProgress(100);

      // Set generated documents
      const docs: ExtensionDocuments = {
        prd: data.documents.prd || '',
        dataModel: data.documents.dataModel || '',
        testScenarios: data.documents.testScenarios || '',
        todo: data.documents.todo || '',
      };

      setGeneratedDocs(docs);

      // Set generated TODOs
      if (data.todos && Array.isArray(data.todos)) {
        const todos: TodoItem[] = data.todos.map((t: {
          id: string;
          title: string;
          description: string;
          phase: string;
          source: string;
          status: string;
          priority: string;
          estimatedHours: number;
        }) => ({
          ...t,
          source: 'extension' as const,
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

      setCurrentStep('preview');

      if (data.warnings && data.warnings.length > 0) {
        toast.warning('일부 문서 생성에 문제가 있었습니다');
        console.warn('Extension generation warnings:', data.warnings);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error('확장 문서 생성 실패', {
        description: errorMessage,
        duration: 5000,
      });
      setCurrentStep('input');
      setGenerationProgress(0);
    }
  };

  const handleApply = () => {
    if (!generatedDocs || !project) return;

    const extension: Omit<Extension, 'createdAt'> = {
      id: `ext-${Date.now()}`,
      name: featureName,
      description: featureDescription,
      docs: generatedDocs,
    };

    addExtension(extension, generatedTodos);
    toast.success('기능이 성공적으로 추가되었습니다');
    router.push('/dashboard');
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">프로젝트가 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            먼저 프로젝트를 생성해주세요
          </p>
          <Button asChild size="lg">
            <a href="/new">
              <Plus className="h-5 w-5 mr-2" />
              새 프로젝트 시작
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로
        </Button>
        <h1 className="text-3xl font-bold">기능 확장</h1>
        <p className="text-muted-foreground mt-1">
          기존 프로젝트에 새로운 기능을 추가합니다
        </p>
      </div>

      {/* Current Project Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">현재 프로젝트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {project.description}
              </p>
            </div>
            <Badge variant="secondary">
              {project.extensions.length}개 확장 기능
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {currentStep === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                새 기능 추가
              </CardTitle>
              <CardDescription>
                추가할 기능에 대해 설명해주세요. AI가 필요한 문서와 TODO를 자동으로 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featureName">기능명</Label>
                <Input
                  id="featureName"
                  placeholder="예: 소셜 로그인, 알림 시스템, 결제 연동"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featureDescription">기능 설명</Label>
                <Textarea
                  id="featureDescription"
                  placeholder="추가하려는 기능에 대해 자세히 설명해주세요...&#10;&#10;예: 카카오톡, 네이버, 구글 소셜 로그인을 추가하고 싶습니다. 기존 이메일 로그인과 함께 사용할 수 있어야 하며, 소셜 로그인으로 가입한 사용자도 이메일을 연결할 수 있어야 합니다."
                  className="min-h-[150px]"
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  최소 30자 이상 입력해주세요 ({featureDescription.length}자)
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={!featureName.trim() || featureDescription.length < 30}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                문서 생성하기
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 'generating' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                문서 생성 중
              </CardTitle>
              <CardDescription>
                {featureName} 기능에 필요한 문서를 생성하고 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{currentDoc}</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
              <div className="space-y-2">
                {EXTENSION_DOCS.map((doc, index) => {
                  const progress = (index + 1) / EXTENSION_DOCS.length * 100;
                  const isComplete = generationProgress >= progress;
                  const isCurrent = currentDoc === doc.name;

                  return (
                    <div
                      key={doc.key}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isComplete
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/20'
                          : 'bg-muted/30'
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'preview' && generatedDocs && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  문서 생성 완료
                </CardTitle>
                <CardDescription>
                  {featureName} 기능에 대한 4개의 문서와 {generatedTodos.length}개의 TODO가 생성되었습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {EXTENSION_DOCS.map((doc) => (
                    <div
                      key={doc.key}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>생성된 TODO 항목</CardTitle>
                <CardDescription>
                  아래 TODO 항목이 기존 프로젝트에 추가됩니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generatedTodos.map((todo, index) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <span className="text-sm font-mono text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{todo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {todo.estimatedHours}시간 예상
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {todo.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCurrentStep('input');
                  setGeneratedDocs(null);
                  setGeneratedTodos([]);
                }}
              >
                다시 생성
              </Button>
              <Button className="flex-1" onClick={handleApply}>
                <Check className="h-4 w-4 mr-2" />
                프로젝트에 적용
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
