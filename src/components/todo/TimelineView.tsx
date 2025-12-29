'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, Play, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjectStore } from '@/stores';
import { PRIORITY_LABELS } from '@/types';
import type { TodoItem, Priority } from '@/types';

interface PhaseData {
  phase: string;
  todos: TodoItem[];
  totalHours: number;
  completedHours: number;
  startDay: number;
  endDay: number;
  percentage: number;
}

export function TimelineView() {
  const { project } = useProjectStore();

  const { phases, totalDays, estimatedEndDate } = useMemo(() => {
    if (!project) {
      return { phases: [], totalDays: 0, estimatedEndDate: '' };
    }

    // Group todos by phase and calculate stats
    const phaseMap = new Map<string, TodoItem[]>();
    project.todos.forEach((todo) => {
      const existing = phaseMap.get(todo.phase) || [];
      phaseMap.set(todo.phase, [...existing, todo]);
    });

    let currentDay = 0;
    const phasesData: PhaseData[] = [];

    phaseMap.forEach((todos, phase) => {
      const totalHours = todos.reduce((sum, t) => sum + t.estimatedHours, 0);
      const completedHours = todos
        .filter((t) => t.status === 'done')
        .reduce((sum, t) => sum + t.estimatedHours, 0);

      // Assume 8 hours per day
      const daysNeeded = Math.ceil(totalHours / 8);
      const startDay = currentDay;
      const endDay = currentDay + daysNeeded;
      currentDay = endDay;

      const percentage = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

      phasesData.push({
        phase,
        todos,
        totalHours,
        completedHours,
        startDay,
        endDay,
        percentage,
      });
    });

    // Calculate estimated end date
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + currentDay);
    const formattedDate = endDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      phases: phasesData,
      totalDays: currentDay,
      estimatedEndDate: formattedDate,
    };
  }, [project]);

  if (!project) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        프로젝트가 없습니다. 새 프로젝트를 생성해주세요.
      </div>
    );
  }

  const getPhaseStatus = (phase: PhaseData) => {
    if (phase.percentage === 100) return 'done';
    if (phase.percentage > 0) return 'in-progress';
    return 'pending';
  };

  const getPhaseColor = (phase: PhaseData) => {
    const status = getPhaseStatus(phase);
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  const getPhaseIcon = (phase: PhaseData) => {
    const status = getPhaseStatus(phase);
    switch (status) {
      case 'done':
        return <Check className="h-4 w-4 text-white" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-white" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">총 Phase</div>
          <div className="text-2xl font-bold">{phases.length}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">예상 소요일</div>
          <div className="text-2xl font-bold">{totalDays}일</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">예상 완료일</div>
          <div className="text-lg font-semibold">{estimatedEndDate}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">전체 진행률</div>
          <div className="flex items-center gap-2">
            <Progress value={project.progress.percentage} className="h-2 flex-1" />
            <span className="text-sm font-medium">{project.progress.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

        {/* Phases */}
        <div className="space-y-6">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline Node */}
              <div
                className={`absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center ${getPhaseColor(phase)}`}
              >
                {getPhaseIcon(phase)}
              </div>

              {/* Connection Arrow */}
              {index < phases.length - 1 && (
                <ChevronRight className="absolute left-5 top-10 h-4 w-4 text-muted-foreground rotate-90" />
              )}

              {/* Phase Card */}
              <div className="border rounded-lg overflow-hidden">
                {/* Phase Header */}
                <div className="bg-muted/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{phase.phase}</h3>
                    <p className="text-sm text-muted-foreground">
                      Day {phase.startDay + 1} - Day {phase.endDay} ({phase.totalHours}시간)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress value={phase.percentage} className="h-2" />
                    </div>
                    <Badge variant={phase.percentage === 100 ? 'default' : 'secondary'}>
                      {phase.percentage}%
                    </Badge>
                  </div>
                </div>

                {/* Todos List */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {phase.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`text-sm p-2 rounded border ${
                        todo.status === 'done'
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                          : todo.status === 'in-progress'
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {todo.status === 'done' ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : todo.status === 'in-progress' ? (
                          <Play className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`line-clamp-2 ${
                              todo.status === 'done' ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {todo.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getPriorityBadgeClass(todo.priority)}`}
                            >
                              {PRIORITY_LABELS[todo.priority]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {todo.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dependency Note */}
      <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
        <strong>참고:</strong> 각 Phase는 순차적으로 진행됩니다. TODO 항목의 dependencies 속성에 따라
        선행 작업이 완료되어야 다음 작업을 시작할 수 있습니다.
      </div>
    </div>
  );
}
