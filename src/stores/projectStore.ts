import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Project,
  TodoItem,
  TodoStatus,
  Extension,
  ProjectProgress,
  PhaseProgress,
  CoreDocuments,
  DesignSystem,
} from '@/types';

// ============================================
// 유틸리티 함수
// ============================================

const calculateProgress = (todos: TodoItem[]): ProjectProgress => {
  const total = todos.length;
  const pending = todos.filter(t => t.status === 'pending').length;
  const inProgress = todos.filter(t => t.status === 'in-progress').length;
  const done = todos.filter(t => t.status === 'done').length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  const estimatedTotalHours = todos.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completedHours = todos
    .filter(t => t.status === 'done')
    .reduce((sum, t) => sum + (t.actualHours || t.estimatedHours), 0);
  const remainingHours = estimatedTotalHours - completedHours;

  // Phase별 진행률 계산
  const phases = [...new Set(todos.map(t => t.phase))];
  const phaseProgress: PhaseProgress[] = phases.map(phase => {
    const phaseTodos = todos.filter(t => t.phase === phase);
    const phaseDone = phaseTodos.filter(t => t.status === 'done').length;
    return {
      phase,
      total: phaseTodos.length,
      done: phaseDone,
      percentage: phaseTodos.length > 0 ? Math.round((phaseDone / phaseTodos.length) * 100) : 0,
    };
  });

  // 현재 진행 중인 Phase 찾기
  const currentPhase = phases.find(phase => {
    const phaseTodos = todos.filter(t => t.phase === phase);
    return phaseTodos.some(t => t.status !== 'done');
  }) || phases[0] || '';

  return {
    total,
    pending,
    inProgress,
    done,
    percentage,
    estimatedTotalHours,
    completedHours,
    remainingHours,
    startDate: new Date(),
    estimatedEndDate: new Date(Date.now() + remainingHours * 60 * 60 * 1000),
    currentPhase,
    phaseProgress,
  };
};

// ============================================
// 스토어 타입
// ============================================

interface ProjectState {
  // 상태
  project: Project | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // 프로젝트 액션
  setProject: (project: Project) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void;
  updateProject: (updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;

  // 문서 액션
  updateDocument: (key: keyof CoreDocuments, content: string) => void;

  // TODO 액션
  updateTodoStatus: (todoId: string, status: TodoStatus, updatedBy?: 'manual' | 'ai', confidence?: number) => void;
  updateTodosBatch: (updates: Array<{ id: string; status: TodoStatus; confidence?: number }>) => void;

  // Extension 액션
  addExtension: (extension: Omit<Extension, 'id' | 'createdAt'>, todos?: TodoItem[]) => void;

  // 디자인 시스템 액션
  setDesignSystem: (designSystem: DesignSystem) => void;

  // 프로젝트 관리 액션
  updateProjectInfo: (id: string, updates: { name?: string; description?: string }) => void;
  duplicateProject: (id: string) => void;
  updatePhaseOrder: (newOrder: string[]) => void;

  // 유틸리티 액션
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProject: () => void;
}

// ============================================
// 스토어 생성
// ============================================

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      project: null,
      projects: [],
      isLoading: false,
      error: null,

      // 프로젝트 액션
      setProject: (project) => set({ project }),

      createProject: (projectData) => {
        const now = new Date();
        const newProject: Project = {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          progress: calculateProgress(projectData.todos),
        };

        set((state) => ({
          project: newProject,
          projects: [...state.projects, newProject],
        }));
      },

      updateProject: (updates) => {
        set((state) => {
          if (!state.project) return state;

          const updatedProject: Project = {
            ...state.project,
            ...updates,
            updatedAt: new Date(),
            progress: updates.todos
              ? calculateProgress(updates.todos)
              : state.project.progress,
          };

          return {
            project: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      deleteProject: (id) => {
        set((state) => ({
          project: state.project?.id === id ? null : state.project,
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      loadProject: (id) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === id);
        if (project) {
          set({ project });
        }
      },

      // 문서 액션
      updateDocument: (key, content) => {
        set((state) => {
          if (!state.project) return state;

          return {
            project: {
              ...state.project,
              coreDocs: {
                ...state.project.coreDocs,
                [key]: content,
              },
              updatedAt: new Date(),
            },
          };
        });
      },

      // TODO 액션
      updateTodoStatus: (todoId, status, updatedBy = 'manual', confidence) => {
        set((state) => {
          if (!state.project) return state;

          const now = new Date();
          const updatedTodos = state.project.todos.map((todo) => {
            if (todo.id !== todoId) return todo;

            return {
              ...todo,
              status,
              statusUpdatedBy: updatedBy,
              statusConfidence: updatedBy === 'ai' ? confidence : undefined,
              updatedAt: now,
              startedAt: status === 'in-progress' && !todo.startedAt ? now : todo.startedAt,
              completedAt: status === 'done' ? now : undefined,
            };
          });

          const updatedProject: Project = {
            ...state.project,
            todos: updatedTodos,
            progress: calculateProgress(updatedTodos),
            updatedAt: now,
          };

          return {
            project: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      updateTodosBatch: (updates) => {
        set((state) => {
          if (!state.project) return state;

          const now = new Date();
          const updateMap = new Map(updates.map((u) => [u.id, u]));

          const updatedTodos = state.project.todos.map((todo) => {
            const update = updateMap.get(todo.id);
            if (!update) return todo;

            return {
              ...todo,
              status: update.status,
              statusUpdatedBy: 'ai' as const,
              statusConfidence: update.confidence,
              updatedAt: now,
              completedAt: update.status === 'done' ? now : undefined,
            };
          });

          const updatedProject: Project = {
            ...state.project,
            todos: updatedTodos,
            progress: calculateProgress(updatedTodos),
            updatedAt: now,
          };

          return {
            project: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      // Extension 액션
      addExtension: (extensionData, todos = []) => {
        set((state) => {
          if (!state.project) return state;

          const extensionId = crypto.randomUUID();
          const newExtension: Extension = {
            ...extensionData,
            id: extensionId,
            createdAt: new Date(),
          };

          // Add extension ID to todos
          const extensionTodos = todos.map(todo => ({
            ...todo,
            extensionId,
          }));

          const allTodos = [...state.project.todos, ...extensionTodos];

          const updatedProject: Project = {
            ...state.project,
            extensions: [...state.project.extensions, newExtension],
            todos: allTodos,
            progress: calculateProgress(allTodos),
            updatedAt: new Date(),
          };

          return {
            project: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      // 디자인 시스템 액션
      setDesignSystem: (designSystem) => {
        set((state) => {
          if (!state.project) return state;

          const updatedProject: Project = {
            ...state.project,
            designSystem,
            updatedAt: new Date(),
          };

          return {
            project: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      // 프로젝트 관리 액션
      updateProjectInfo: (id, updates) => {
        set((state) => {
          const now = new Date();
          const updatedProjects = state.projects.map((p) => {
            if (p.id !== id) return p;
            return {
              ...p,
              ...(updates.name && { name: updates.name }),
              ...(updates.description && { description: updates.description }),
              updatedAt: now,
            };
          });

          const currentProject = state.project?.id === id
            ? {
                ...state.project,
                ...(updates.name && { name: updates.name }),
                ...(updates.description && { description: updates.description }),
                updatedAt: now,
              }
            : state.project;

          return {
            project: currentProject,
            projects: updatedProjects,
          };
        });
      },

      duplicateProject: (id) => {
        const { projects } = get();
        const original = projects.find((p) => p.id === id);
        if (!original) return;

        const now = new Date();
        const newProject: Project = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (복사본)`,
          createdAt: now,
          updatedAt: now,
          // 진행도 초기화
          todos: original.todos.map((t) => ({
            ...t,
            status: 'pending' as const,
            statusUpdatedBy: 'manual' as const,
            statusConfidence: undefined,
            startedAt: undefined,
            completedAt: undefined,
          })),
          progress: calculateProgress(original.todos.map((t) => ({ ...t, status: 'pending' as const }))),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      updatePhaseOrder: (newOrder) => {
        set((state) => {
          if (!state.project) return state;

          const updatedProject: Project = {
            ...state.project,
            phaseOrder: newOrder,
            updatedAt: new Date(),
          };

          return {
            project: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      // 유틸리티 액션
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearProject: () => set({ project: null }),
    }),
    {
      name: 'vibedocs-project',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        project: state.project,
        projects: state.projects,
      }),
    }
  )
);
