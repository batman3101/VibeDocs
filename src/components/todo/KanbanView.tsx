'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, GripVertical, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectStore } from '@/stores';
import { PRIORITY_LABELS } from '@/types';
import type { TodoItem, TodoStatus, Priority } from '@/types';
import { toast } from 'sonner';

interface KanbanColumnProps {
  title: string;
  status: TodoStatus;
  todos: TodoItem[];
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
  onCopyPrompt: (prompt: string) => void;
}

function KanbanColumn({ title, status, todos, onStatusChange, onCopyPrompt }: KanbanColumnProps) {
  const getColumnStyle = () => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800';
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900';
      case 'done':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900';
      default:
        return '';
    }
  };

  const getHeaderStyle = () => {
    switch (status) {
      case 'pending':
        return 'text-gray-700 dark:text-gray-300';
      case 'in-progress':
        return 'text-blue-700 dark:text-blue-300';
      case 'done':
        return 'text-green-700 dark:text-green-300';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-400';
      default:
        return '';
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

  const getNextStatus = (current: TodoStatus): TodoStatus => {
    switch (current) {
      case 'pending':
        return 'in-progress';
      case 'in-progress':
        return 'done';
      case 'done':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getPrevStatus = (current: TodoStatus): TodoStatus => {
    switch (current) {
      case 'pending':
        return 'done';
      case 'in-progress':
        return 'pending';
      case 'done':
        return 'in-progress';
      default:
        return 'pending';
    }
  };

  return (
    <div className={`flex flex-col rounded-lg border-2 ${getColumnStyle()} min-h-[500px]`}>
      {/* Column Header */}
      <div className={`p-4 border-b ${getHeaderStyle()}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {todos.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-l-4 ${getPriorityColor(todo.priority)} p-3 cursor-pointer`}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2">{todo.title}</p>
                {todo.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {todo.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getPriorityBadgeClass(todo.priority)}`}
                  >
                    {PRIORITY_LABELS[todo.priority]}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {todo.estimatedHours}h
                  </span>
                  <span className="text-xs text-muted-foreground">{todo.phase}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {status !== 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onStatusChange(todo.id, getPrevStatus(status))}
                    >
                      ← 이전
                    </Button>
                  )}
                  {status !== 'done' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onStatusChange(todo.id, getNextStatus(status))}
                    >
                      다음 →
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs ml-auto"
                    onClick={() => onCopyPrompt(todo.prompt)}
                    title="프롬프트 복사"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {todos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            항목이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanView() {
  const { project, updateTodoStatus } = useProjectStore();
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  if (!project) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        프로젝트가 없습니다. 새 프로젝트를 생성해주세요.
      </div>
    );
  }

  // Get unique phases
  const phases = Array.from(new Set(project.todos.map((t) => t.phase)));

  // Filter todos
  const filteredTodos = project.todos.filter((todo) => {
    if (phaseFilter !== 'all' && todo.phase !== phaseFilter) return false;
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
    return true;
  });

  // Group by status
  const pendingTodos = filteredTodos.filter((t) => t.status === 'pending');
  const inProgressTodos = filteredTodos.filter((t) => t.status === 'in-progress');
  const doneTodos = filteredTodos.filter((t) => t.status === 'done');

  const handleStatusChange = (todoId: string, newStatus: TodoStatus) => {
    updateTodoStatus(todoId, newStatus);
    const statusLabel = newStatus === 'done' ? '완료' : newStatus === 'in-progress' ? '진행중' : '대기';
    toast.success(`상태가 '${statusLabel}'(으)로 변경되었습니다`);
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('프롬프트가 클립보드에 복사되었습니다');
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Phase:</span>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {phases.map((phase) => (
                <SelectItem key={phase} value={phase}>
                  {phase}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">우선순위:</span>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="critical">긴급</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="medium">중간</SelectItem>
              <SelectItem value="low">낮음</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          총 {filteredTodos.length}개 항목
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KanbanColumn
          title="대기"
          status="pending"
          todos={pendingTodos}
          onStatusChange={handleStatusChange}
          onCopyPrompt={handleCopyPrompt}
        />
        <KanbanColumn
          title="진행중"
          status="in-progress"
          todos={inProgressTodos}
          onStatusChange={handleStatusChange}
          onCopyPrompt={handleCopyPrompt}
        />
        <KanbanColumn
          title="완료"
          status="done"
          todos={doneTodos}
          onStatusChange={handleStatusChange}
          onCopyPrompt={handleCopyPrompt}
        />
      </div>
    </div>
  );
}
