import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkflowStep, WorkflowStepId, DeploymentCategory } from '@/types';
import { DEFAULT_WORKFLOW_STEPS, DEPLOYMENT_CHECKLIST } from '@/constants/workflow';

// ============================================
// 스토어 타입
// ============================================

interface WorkflowState {
  // 상태
  currentStep: WorkflowStepId;
  steps: WorkflowStep[];
  selectedScenario: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  deploymentChecklist: DeploymentCategory[];

  // 워크플로우 액션
  setCurrentStep: (stepId: WorkflowStepId) => void;
  updateStepStatus: (stepId: WorkflowStepId, status: WorkflowStep['status']) => void;
  toggleChecklistItem: (stepId: WorkflowStepId, itemId: string) => void;
  skipStep: (stepId: WorkflowStepId) => void;
  selectScenario: (scenarioId: string) => void;
  resetWorkflow: () => void;
  startWorkflow: () => void;
  completeWorkflow: () => void;

  // 배포 체크리스트 액션
  toggleDeploymentItem: (categoryIndex: number, itemId: string) => void;
  resetDeploymentChecklist: () => void;

  // 유틸리티
  getStepProgress: (stepId: WorkflowStepId) => number;
  getOverallProgress: () => number;
  canProceedToStep: (stepId: WorkflowStepId) => boolean;
  getNextAvailableStep: () => WorkflowStepId | null;
}

// ============================================
// 유틸리티 함수
// ============================================

const STEP_ORDER: WorkflowStepId[] = ['idea', 'generate', 'ai-tool', 'develop', 'extend', 'deploy', 'maintain'];

const getStepIndex = (stepId: WorkflowStepId): number => {
  return STEP_ORDER.indexOf(stepId);
};

const calculateStepProgress = (step: WorkflowStep): number => {
  if (step.checklist.length === 0) return 0;
  const completed = step.checklist.filter(item => item.checked).length;
  return Math.round((completed / step.checklist.length) * 100);
};

// ============================================
// 스토어 생성
// ============================================

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentStep: 'idea',
      steps: JSON.parse(JSON.stringify(DEFAULT_WORKFLOW_STEPS)), // Deep copy
      selectedScenario: null,
      startedAt: null,
      completedAt: null,
      deploymentChecklist: JSON.parse(JSON.stringify(DEPLOYMENT_CHECKLIST)),

      // 워크플로우 액션
      setCurrentStep: (stepId) => {
        const { canProceedToStep } = get();
        if (canProceedToStep(stepId)) {
          set({ currentStep: stepId });
        }
      },

      updateStepStatus: (stepId, status) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) => {
            if (step.id === stepId) {
              return { ...step, status };
            }
            return step;
          });

          // 현재 단계가 완료되면 다음 단계 잠금 해제
          if (status === 'completed') {
            const currentIndex = getStepIndex(stepId);
            const nextStepId = STEP_ORDER[currentIndex + 1];
            if (nextStepId) {
              const nextStepIndex = updatedSteps.findIndex(s => s.id === nextStepId);
              if (nextStepIndex !== -1 && updatedSteps[nextStepIndex].status === 'locked') {
                updatedSteps[nextStepIndex] = {
                  ...updatedSteps[nextStepIndex],
                  status: 'available',
                };
              }
            }
          }

          return { steps: updatedSteps };
        });
      },

      toggleChecklistItem: (stepId, itemId) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) => {
            if (step.id !== stepId) return step;

            const updatedChecklist = step.checklist.map((item) => {
              if (item.id === itemId) {
                return { ...item, checked: !item.checked };
              }
              return item;
            });

            // 모든 체크리스트 항목이 완료되면 단계 상태 업데이트
            const allChecked = updatedChecklist.every(item => item.checked);
            const newStatus = allChecked ? 'completed' :
              updatedChecklist.some(item => item.checked) ? 'in-progress' : step.status;

            return {
              ...step,
              checklist: updatedChecklist,
              status: newStatus === 'completed' ? 'completed' :
                      step.status === 'available' && updatedChecklist.some(item => item.checked) ? 'in-progress' :
                      step.status,
            };
          });

          // 단계 완료 시 다음 단계 잠금 해제
          const currentStep = updatedSteps.find(s => s.id === stepId);
          if (currentStep?.status === 'completed') {
            const currentIndex = getStepIndex(stepId);
            const nextStepId = STEP_ORDER[currentIndex + 1];
            if (nextStepId) {
              const nextStepIndex = updatedSteps.findIndex(s => s.id === nextStepId);
              if (nextStepIndex !== -1 && updatedSteps[nextStepIndex].status === 'locked') {
                updatedSteps[nextStepIndex] = {
                  ...updatedSteps[nextStepIndex],
                  status: 'available',
                };
              }
            }
          }

          return { steps: updatedSteps };
        });
      },

      skipStep: (stepId) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) => {
            if (step.id === stepId) {
              return { ...step, status: 'skipped' as const };
            }
            return step;
          });

          // 스킵된 단계의 다음 단계 잠금 해제
          const currentIndex = getStepIndex(stepId);
          const nextStepId = STEP_ORDER[currentIndex + 1];
          if (nextStepId) {
            const nextStepIndex = updatedSteps.findIndex(s => s.id === nextStepId);
            if (nextStepIndex !== -1 && updatedSteps[nextStepIndex].status === 'locked') {
              updatedSteps[nextStepIndex] = {
                ...updatedSteps[nextStepIndex],
                status: 'available',
              };
            }
          }

          // 다음 단계로 이동
          const nextStep = updatedSteps.find(s => s.status === 'available' || s.status === 'in-progress');
          const newCurrentStep = nextStep?.id || state.currentStep;

          return { steps: updatedSteps, currentStep: newCurrentStep };
        });
      },

      selectScenario: (scenarioId) => {
        set({ selectedScenario: scenarioId });
      },

      resetWorkflow: () => {
        set({
          currentStep: 'idea',
          steps: JSON.parse(JSON.stringify(DEFAULT_WORKFLOW_STEPS)),
          selectedScenario: null,
          startedAt: null,
          completedAt: null,
          deploymentChecklist: JSON.parse(JSON.stringify(DEPLOYMENT_CHECKLIST)),
        });
      },

      startWorkflow: () => {
        set((state) => {
          const updatedSteps = state.steps.map((step, index) => {
            if (index === 0) {
              return { ...step, status: 'in-progress' as const };
            }
            return step;
          });

          return {
            startedAt: new Date(),
            steps: updatedSteps,
          };
        });
      },

      completeWorkflow: () => {
        set({ completedAt: new Date() });
      },

      // 배포 체크리스트 액션
      toggleDeploymentItem: (categoryIndex, itemId) => {
        set((state) => {
          const updatedChecklist = state.deploymentChecklist.map((category, index) => {
            if (index !== categoryIndex) return category;

            return {
              ...category,
              items: category.items.map((item) => {
                if (item.id === itemId) {
                  return { ...item, checked: !item.checked };
                }
                return item;
              }),
            };
          });

          return { deploymentChecklist: updatedChecklist };
        });
      },

      resetDeploymentChecklist: () => {
        set({
          deploymentChecklist: JSON.parse(JSON.stringify(DEPLOYMENT_CHECKLIST)),
        });
      },

      // 유틸리티
      getStepProgress: (stepId) => {
        const step = get().steps.find(s => s.id === stepId);
        return step ? calculateStepProgress(step) : 0;
      },

      getOverallProgress: () => {
        const { steps } = get();
        const totalItems = steps.reduce((sum, step) => sum + step.checklist.length, 0);
        const completedItems = steps.reduce(
          (sum, step) => sum + step.checklist.filter(item => item.checked).length,
          0
        );
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      },

      canProceedToStep: (stepId) => {
        const { steps } = get();
        const step = steps.find(s => s.id === stepId);
        return step?.status !== 'locked';
      },

      getNextAvailableStep: () => {
        const { steps, currentStep } = get();
        const currentIndex = getStepIndex(currentStep);

        for (let i = currentIndex + 1; i < STEP_ORDER.length; i++) {
          const stepId = STEP_ORDER[i];
          const step = steps.find(s => s.id === stepId);
          if (step && step.status !== 'locked') {
            return stepId;
          }
        }

        return null;
      },
    }),
    {
      name: 'vibedocs-workflow',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        steps: state.steps,
        selectedScenario: state.selectedScenario,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        deploymentChecklist: state.deploymentChecklist,
      }),
    }
  )
);

// ============================================
// 커스텀 훅
// ============================================

export const useCurrentStep = () => {
  const currentStep = useWorkflowStore((state) => state.currentStep);
  const steps = useWorkflowStore((state) => state.steps);
  return steps.find((s) => s.id === currentStep);
};

export const useStepByIndex = (index: number) => {
  const steps = useWorkflowStore((state) => state.steps);
  return steps[index];
};
