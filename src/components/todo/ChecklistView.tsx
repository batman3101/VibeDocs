'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Clock, Check, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjectStore } from '@/stores';
import { PRIORITY_LABELS } from '@/types';
import type { TodoItem, TodoStatus, Priority } from '@/types';
import { toast } from 'sonner';

interface PhaseGroup {
  phase: string;
  todos: TodoItem[];
  completed: number;
  total: number;
}

export function ChecklistView() {
  const { project, updateTodoStatus, updatePhaseOrder } = useProjectStore();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // Group todos by phase
  const phases = useMemo(() => {
    if (!project) return [];

    const phaseMap = new Map<string, TodoItem[]>();
    project.todos.forEach((todo) => {
      const existing = phaseMap.get(todo.phase) || [];
      phaseMap.set(todo.phase, [...existing, todo]);
    });

    // 저장된 순서가 있으면 그 순서대로, 없으면 기본 순서
    const orderedPhases: PhaseGroup[] = [];
    const phaseOrder = project.phaseOrder || Array.from(phaseMap.keys());

    // 저장된 순서에 있는 phase들 먼저 추가
    phaseOrder.forEach((phaseName) => {
      const todos = phaseMap.get(phaseName);
      if (todos) {
        const completed = todos.filter((t) => t.status === 'done').length;
        orderedPhases.push({ phase: phaseName, todos, completed, total: todos.length });
      }
    });

    // 새로 추가된 phase가 있다면 마지막에 추가
    phaseMap.forEach((todos, phase) => {
      if (!orderedPhases.find((p) => p.phase === phase)) {
        const completed = todos.filter((t) => t.status === 'done').length;
        orderedPhases.push({ phase, todos, completed, total: todos.length });
      }
    });

    return orderedPhases;
  }, [project]);

  if (!project) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        프로젝트가 없습니다. 새 프로젝트를 생성해주세요.
      </div>
    );
  }

  const handlePhaseReorder = (newOrder: PhaseGroup[]) => {
    const newPhaseOrder = newOrder.map((p) => p.phase);
    updatePhaseOrder(newPhaseOrder);
    toast.success('Phase 순서가 변경되었습니다');
  };

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  };

  const handleStatusChange = (todoId: string, checked: boolean) => {
    const newStatus: TodoStatus = checked ? 'done' : 'pending';
    updateTodoStatus(todoId, newStatus);
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('프롬프트가 클립보드에 복사되었습니다');
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'badge-critical';
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
        return 'badge-low';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: TodoStatus) => {
    switch (status) {
      case 'done':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">전체 진행률</span>
          <span className="text-muted-foreground">
            {project.progress.done} / {project.progress.total} 완료
          </span>
        </div>
        <Progress value={project.progress.percentage} className="h-2" />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            완료: {project.progress.done}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            진행중: {project.progress.inProgress}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            대기: {project.progress.pending}
          </span>
        </div>
      </div>

      {/* Phase List - Drag & Drop */}
      <div className="space-y-1 mb-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <GripVertical className="h-3 w-3" />
          Phase를 드래그하여 순서를 변경할 수 있습니다
        </p>
      </div>
      <Reorder.Group
        axis="y"
        values={phases}
        onReorder={handlePhaseReorder}
        className="space-y-3"
      >
        {phases.map((phaseGroup) => {
          const isExpanded = expandedPhases.has(phaseGroup.phase);
          const percentage = Math.round((phaseGroup.completed / phaseGroup.total) * 100);

          return (
            <Reorder.Item
              key={phaseGroup.phase}
              value={phaseGroup}
              className="border rounded-lg overflow-hidden bg-background"
            >
              {/* Phase Header */}
              <div className="flex items-center">
                {/* Drag Handle */}
                <div
                  className="flex items-center justify-center px-2 py-4 cursor-grab active:cursor-grabbing hover:bg-muted/50 border-r"
                  title="드래그하여 순서 변경"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <button
                  className="flex-1 flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => togglePhase(phaseGroup.phase)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{phaseGroup.phase}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {phaseGroup.completed} / {phaseGroup.total}
                    </span>
                    <div className="w-24">
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </button>
              </div>

              {/* Todo Items */}
              {isExpanded && (
                <div className="border-t divide-y">
                  {phaseGroup.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 transition-colors ${
                        todo.status === 'done' ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.status === 'done'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(todo.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium ${
                                todo.status === 'done'
                                  ? 'line-through text-muted-foreground'
                                  : ''
                              }`}
                            >
                              {todo.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getPriorityBadgeClass(todo.priority)}`}
                            >
                              {PRIORITY_LABELS[todo.priority]}
                            </Badge>
                            {getStatusIcon(todo.status)}
                          </div>
                          {todo.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {todo.estimatedHours}시간
                            </span>
                            {todo.dependencies.length > 0 && (
                              <span>
                                선행: {todo.dependencies.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPrompt(todo.prompt)}
                          title="프롬프트 복사"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
