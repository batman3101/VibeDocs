// VibeDocs 핵심 타입 정의

// AI 공급업체 타입 re-export
export * from './ai-providers';
import type { AIProvider } from './ai-providers';

// ============================================
// 기본 타입
// ============================================

export type TemplateType = 'shopping' | 'booking' | 'community' | 'blog' | 'dashboard' | 'inventory' | 'hr' | 'webpage' | 'custom';
export type AppType = 'web' | 'mobile' | 'both';
export type TodoStatus = 'pending' | 'in-progress' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// ============================================
// 문서 관련 타입
// ============================================

export interface CoreDocuments {
  ideaBrief: string;      // IDEA_BRIEF.md
  userStories: string;    // USER_STORIES.md
  screenFlow: string;     // SCREEN_FLOW.md
  prd: string;            // PRD_CORE.md
  techStack: string;      // TECH_STACK.md
  dataModel: string;      // DATA_MODEL.md
  apiSpec: string;        // API_SPEC.md
  testScenarios: string;  // TEST_SCENARIOS.md
  todoMaster: string;     // TODO_MASTER.md
  promptGuide: string;    // PROMPT_GUIDE.md
}

export interface ExtensionDocuments {
  prd: string;
  dataModel: string;
  testScenarios: string;
  todo: string;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  docs: ExtensionDocuments;
  createdAt: Date;
}

// ============================================
// TODO 관련 타입
// ============================================

export interface TodoItem {
  id: string;                    // 예: "TODO-001"
  title: string;
  description: string;
  phase: string;
  source: 'core' | 'extension';
  extensionId?: string;
  status: TodoStatus;
  statusUpdatedBy: 'manual' | 'ai';
  statusConfidence?: number;     // 0-100
  priority: Priority;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  prompt: string;
  testCriteria: string[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface PhaseProgress {
  phase: string;
  total: number;
  done: number;
  percentage: number;
}

export interface ProjectProgress {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  percentage: number;
  estimatedTotalHours: number;
  completedHours: number;
  remainingHours: number;
  startDate: Date;
  estimatedEndDate: Date;
  currentPhase: string;
  phaseProgress: PhaseProgress[];
}

// ============================================
// 디자인 시스템 타입
// ============================================

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface Typography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
}

export interface SpacingSystem {
  base: number;
  scale: number[];
  container: Record<string, string>;
}

export interface EffectSystem {
  borderRadius: Record<string, string>;
  shadow: Record<string, string>;
  transition: Record<string, string>;
}

export interface ComponentStyles {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  border?: string;
  boxShadow?: string;
}

export interface ExtractedComponent {
  type: 'button' | 'card' | 'input' | 'badge' | 'link';
  count: number;
  styles: ComponentStyles;
  variants: string[];
}

export interface DesignSystem {
  sourceUrl: string;
  extractedAt: Date;
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingSystem;
  effects: EffectSystem;
  components?: ExtractedComponent[];
}

// ============================================
// 프로젝트 타입
// ============================================

export interface Project {
  id: string;                    // UUID v4
  name: string;                  // 프로젝트명
  description: string;           // 아이디어 원문
  appType: AppType;
  template?: TemplateType;
  coreDocs: CoreDocuments;
  extensions: Extension[];
  todos: TodoItem[];
  progress: ProjectProgress;
  designSystem?: DesignSystem;
  phaseOrder?: string[];         // Phase 순서 (드래그앤드롭 정렬용)
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 설정 타입
// ============================================

export interface Settings {
  // 기존 필드 (하위 호환성)
  apiKey?: string;
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  autoSave: boolean;
  autoSaveInterval: number; // ms

  // 새로운 AI 공급업체 관련 필드
  aiProvider: AIProvider;
  aiModel: string;
  apiKeys: Partial<Record<AIProvider, string>>;
}

// ============================================
// API 관련 타입
// ============================================

export interface GenerationRequest {
  idea: string;
  appType: AppType;
  template?: TemplateType;
  apiKey: string;
}

export interface GenerationProgress {
  step: number;
  totalSteps: number;
  currentDocument: string;
  percentage: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================
// 문서 이름 상수
// ============================================

export const DOCUMENT_NAMES: Record<keyof CoreDocuments, string> = {
  ideaBrief: 'IDEA_BRIEF.md',
  userStories: 'USER_STORIES.md',
  screenFlow: 'SCREEN_FLOW.md',
  prd: 'PRD_CORE.md',
  techStack: 'TECH_STACK.md',
  dataModel: 'DATA_MODEL.md',
  apiSpec: 'API_SPEC.md',
  testScenarios: 'TEST_SCENARIOS.md',
  todoMaster: 'TODO_MASTER.md',
  promptGuide: 'PROMPT_GUIDE.md',
};

export const DOCUMENT_TITLES: Record<keyof CoreDocuments, string> = {
  ideaBrief: '아이디어 개요',
  userStories: '사용자 스토리',
  screenFlow: '화면 흐름도',
  prd: 'PRD 핵심 문서',
  techStack: '기술 스택',
  dataModel: '데이터 모델',
  apiSpec: 'API 명세서',
  testScenarios: '테스트 시나리오',
  todoMaster: 'TODO 마스터',
  promptGuide: '프롬프트 가이드',
};

// ============================================
// 우선순위 색상 상수
// ============================================

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#ef4444', // red-500
  high: '#f59e0b',     // amber-500
  medium: '#3b82f6',   // blue-500
  low: '#6b7280',      // gray-500
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: '긴급',
  high: '높음',
  medium: '보통',
  low: '낮음',
};

// ============================================
// 저장소 키 상수
// ============================================

export const STORAGE_KEYS = {
  PROJECT: 'vibedocs-project',
  PROJECTS_LIST: 'vibedocs-projects',
  API_KEY: 'vibedocs-api-key',
  SETTINGS: 'vibedocs-settings',
  WORKFLOW: 'vibedocs-workflow',
} as const;

// ============================================
// 워크플로우 관련 타입
// ============================================

export type WorkflowStepId =
  | 'idea'
  | 'generate'
  | 'ai-tool'
  | 'develop'
  | 'extend'
  | 'deploy'
  | 'maintain';

export type WorkflowStepStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'skipped';

export interface WorkflowChecklistItem {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
}

export interface WorkflowStep {
  id: WorkflowStepId;
  name: string;
  description: string;
  status: WorkflowStepStatus;
  linkedPage?: string;
  icon: string;
  estimatedTime?: string;
  checklist: WorkflowChecklistItem[];
}

export interface UserScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  recommendedPath: WorkflowStepId[];
}

export interface WorkflowState {
  currentStep: WorkflowStepId;
  steps: WorkflowStep[];
  selectedScenario: string | null;
  startedAt?: Date;
  completedAt?: Date;
}

// ============================================
// 문서 버전 관련 타입
// ============================================

export interface DocumentVersion {
  id: string;
  documentKey: keyof CoreDocuments;
  content: string;
  timestamp: Date;
  reason: string;
  todoIds?: string[];
}

// ============================================
// 배포 관련 타입
// ============================================

export interface DeploymentItem {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  checked: boolean;
  guide?: string;
}

export interface DeploymentCategory {
  category: string;
  icon: string;
  items: DeploymentItem[];
}

export interface DeploymentPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: string[];
  docsUrl: string;
}

// ============================================
// AI 진행도 분석 타입
// ============================================

export interface ProgressAnalysisResult {
  todoId: string;
  title: string;
  confidence: number;
  reason: string;
  suggestedStatus: TodoStatus;
}

export interface CodeAnalysisRequest {
  code: string;
  language?: string;
  todos: TodoItem[];
}

export interface CodeAnalysisResult {
  matchedTodos: ProgressAnalysisResult[];
  suggestions: string[];
}
