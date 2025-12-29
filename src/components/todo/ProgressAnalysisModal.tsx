'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Loader2, Code } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectStore } from '@/stores';
import { useApiKey } from '@/stores/settingsStore';
import type { TodoItem } from '@/types';
import { toast } from 'sonner';

interface MatchedTodo {
  todo: TodoItem;
  confidence: number;
  reason: string;
  suggestedStatus: 'in-progress' | 'done';
}

export function ProgressAnalysisModal() {
  const { project, updateTodoStatus } = useProjectStore();
  const { hasApiKey, apiKey } = useApiKey();
  const [isOpen, setIsOpen] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchedTodos, setMatchedTodos] = useState<MatchedTodo[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [analyzed, setAnalyzed] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'description' | 'code'>('description');
  const [summary, setSummary] = useState('');

  const handleAnalyze = async () => {
    if (!project) {
      toast.error('프로젝트가 없습니다');
      return;
    }

    const inputText = analysisMode === 'code' ? codeSnippet : workDescription;
    if (!inputText.trim()) {
      toast.error(analysisMode === 'code' ? '코드를 입력해주세요' : '작업 내용을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    setMatchedTodos([]);
    setSelectedTodos(new Set());
    setAnalyzed(false);
    setSummary('');

    try {
      // API 키가 있으면 실제 AI 분석 사용
      if (hasApiKey && apiKey) {
        const response = await fetch('/api/analyze-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            workDescription: analysisMode === 'description' ? inputText : `구현한 코드:\n${inputText}`,
            todos: project.todos.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              phase: t.phase,
              status: t.status,
              priority: t.priority,
            })),
            code: analysisMode === 'code' ? inputText : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'AI 분석 실패');
        }

        // 결과 매핑
        const matches: MatchedTodo[] = data.matches.map((m: { todoId: string; confidence: number; reason: string; suggestedStatus: 'in-progress' | 'done' }) => {
          const todo = project.todos.find((t) => t.id === m.todoId);
          return {
            todo,
            confidence: m.confidence,
            reason: m.reason,
            suggestedStatus: m.suggestedStatus,
          };
        }).filter((m: MatchedTodo) => m.todo);

        // 자동 선택 (70% 이상)
        const autoSelected = new Set<string>();
        matches.forEach((match: MatchedTodo) => {
          if (match.confidence >= 70) {
            autoSelected.add(match.todo.id);
          }
        });

        setMatchedTodos(matches);
        setSelectedTodos(autoSelected);
        setSummary(data.summary || '');
        setAnalyzed(true);
      } else {
        // Mock 분석 (API 키 없을 때)
        await performMockAnalysis(inputText);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다');
      // 폴백: Mock 분석 실행
      await performMockAnalysis(inputText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performMockAnalysis = async (inputText: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pendingTodos = project!.todos.filter((t) => t.status !== 'done');
    const inputLower = inputText.toLowerCase();

    const matches: MatchedTodo[] = [];

    pendingTodos.forEach((todo) => {
      const titleWords = todo.title.toLowerCase().split(/\s+/);
      const descWords = (todo.description || '').toLowerCase().split(/\s+/);
      const allWords = [...titleWords, ...descWords];

      let matchCount = 0;
      allWords.forEach((word) => {
        if (word.length > 2 && inputLower.includes(word)) {
          matchCount++;
        }
      });

      const keywords = [
        '설정', '설치', '구현', '완료', '추가', '생성', '작성',
        'setup', 'install', 'implement', 'complete', 'add', 'create', 'write',
        'api', 'ui', 'component', '컴포넌트', 'page', '페이지', 'test', '테스트'
      ];

      keywords.forEach((keyword) => {
        if (inputLower.includes(keyword) && (todo.title.toLowerCase().includes(keyword) ||
            (todo.description || '').toLowerCase().includes(keyword))) {
          matchCount += 2;
        }
      });

      if (matchCount > 0) {
        const confidence = Math.min(95, 40 + matchCount * 15);
        matches.push({
          todo,
          confidence,
          reason: `키워드 매칭 (${matchCount}개 일치)`,
          suggestedStatus: confidence >= 70 ? 'done' : 'in-progress',
        });
      }
    });

    matches.sort((a, b) => b.confidence - a.confidence);
    const topMatches = matches.slice(0, 5);

    const autoSelected = new Set<string>();
    topMatches.forEach((match) => {
      if (match.confidence >= 70) {
        autoSelected.add(match.todo.id);
      }
    });

    setMatchedTodos(topMatches);
    setSelectedTodos(autoSelected);
    setSummary(`${topMatches.length}개의 관련 TODO 항목을 발견했습니다. (Mock 분석)`);
    setAnalyzed(true);
  };

  const toggleTodoSelection = (todoId: string) => {
    setSelectedTodos((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  };

  const handleApplySelected = () => {
    if (selectedTodos.size === 0) {
      toast.error('적용할 항목을 선택해주세요');
      return;
    }

    let doneCount = 0;
    let progressCount = 0;

    selectedTodos.forEach((todoId) => {
      const match = matchedTodos.find((m) => m.todo.id === todoId);
      const status = match?.suggestedStatus || 'done';
      updateTodoStatus(todoId, status, 'ai', match?.confidence);
      if (status === 'done') doneCount++;
      else progressCount++;
    });

    const message = [];
    if (doneCount > 0) message.push(`${doneCount}개 완료`);
    if (progressCount > 0) message.push(`${progressCount}개 진행중`);
    toast.success(`${message.join(', ')}으로 표시되었습니다`);
    setIsOpen(false);
    resetState();
  };

  const handleApplyAll = () => {
    if (matchedTodos.length === 0) return;

    let doneCount = 0;
    let progressCount = 0;

    matchedTodos.forEach((match) => {
      updateTodoStatus(match.todo.id, match.suggestedStatus, 'ai', match.confidence);
      if (match.suggestedStatus === 'done') doneCount++;
      else progressCount++;
    });

    const message = [];
    if (doneCount > 0) message.push(`${doneCount}개 완료`);
    if (progressCount > 0) message.push(`${progressCount}개 진행중`);
    toast.success(`${message.join(', ')}으로 표시되었습니다`);
    setIsOpen(false);
    resetState();
  };

  const resetState = () => {
    setWorkDescription('');
    setCodeSnippet('');
    setMatchedTodos([]);
    setSelectedTodos(new Set());
    setAnalyzed(false);
    setSummary('');
    setAnalysisMode('description');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-blue-600 dark:text-blue-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (confidence >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI 진행도 분석
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 진행도 분석
          </DialogTitle>
          <DialogDescription>
            작업 내용을 설명하면 AI가 완료된 TODO 항목을 자동으로 매칭해드립니다.
            {!hasApiKey && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400">
                (현재 Mock 모드로 실행 중입니다. 실제 AI 분석을 위해서는 API 키를 설정해주세요.)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Input Section with Tabs */}
          <Tabs value={analysisMode} onValueChange={(v) => setAnalysisMode(v as 'description' | 'code')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description" className="gap-2">
                <Sparkles className="h-4 w-4" />
                작업 설명
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="h-4 w-4" />
                코드 분석
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-2 mt-4">
              <label className="text-sm font-medium">작업 내용</label>
              <Textarea
                placeholder="오늘 완료한 작업을 자세히 설명해주세요...&#10;&#10;예: 프로젝트 초기 설정을 완료했습니다. Next.js 14와 TypeScript를 설치하고 Tailwind CSS 테마를 설정했습니다. shadcn/ui 컴포넌트도 추가했습니다."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                구체적으로 작성할수록 더 정확한 매칭이 가능합니다.
              </p>
            </TabsContent>

            <TabsContent value="code" className="space-y-2 mt-4">
              <label className="text-sm font-medium">구현한 코드</label>
              <Textarea
                placeholder="구현한 코드를 붙여넣기 하세요...&#10;&#10;AI가 코드를 분석하여 관련된 TODO 항목을 자동으로 식별합니다."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                함수, 컴포넌트, 또는 주요 로직을 포함한 코드를 붙여넣으세요.
              </p>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (analysisMode === 'description' ? !workDescription.trim() : !codeSnippet.trim())}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {hasApiKey ? 'AI 분석 중...' : 'Mock 분석 중...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {hasApiKey ? 'AI로 분석하기' : '분석하기 (Mock)'}
              </>
            )}
          </Button>

          {/* Results Section */}
          {analyzed && (
            <div className="space-y-4 pt-4 border-t">
              {/* Summary */}
              {summary && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">{summary}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h4 className="font-medium">매칭된 TODO 항목</h4>
                {matchedTodos.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedTodos.size}개 선택됨
                  </span>
                )}
              </div>

              {matchedTodos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>매칭된 항목이 없습니다.</p>
                  <p className="text-sm">작업 내용을 더 자세히 작성해보세요.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {matchedTodos.map((match) => (
                      <div
                        key={match.todo.id}
                        className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                          selectedTodos.has(match.todo.id)
                            ? 'bg-primary/5 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleTodoSelection(match.todo.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedTodos.has(match.todo.id)}
                            onCheckedChange={() => toggleTodoSelection(match.todo.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{match.todo.title}</span>
                              <Badge className={getConfidenceBadge(match.confidence)}>
                                {match.confidence}% 일치
                              </Badge>
                              <Badge variant={match.suggestedStatus === 'done' ? 'default' : 'secondary'}>
                                {match.suggestedStatus === 'done' ? '완료' : '진행중'}
                              </Badge>
                            </div>
                            {match.todo.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {match.todo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={match.confidence} className="h-1.5 w-24" />
                              <span className={`text-xs ${getConfidenceColor(match.confidence)}`}>
                                {match.reason}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleApplySelected}
                      disabled={selectedTodos.size === 0}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      선택 적용 ({selectedTodos.size})
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleApplyAll}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      전체 적용 ({matchedTodos.length})
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
