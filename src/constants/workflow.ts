import type { WorkflowStep, UserScenario, DeploymentCategory, DeploymentPlatform } from '@/types';

// ============================================
// 기본 워크플로우 단계 정의
// ============================================

export const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'idea',
    name: '아이디어 정리',
    description: '프로젝트의 핵심 아이디어를 구체화합니다',
    status: 'available',
    icon: 'Lightbulb',
    estimatedTime: '30분',
    checklist: [
      {
        id: 'idea-1',
        title: '해결하려는 문제 정의',
        description: '이 앱이 해결하려는 핵심 문제가 무엇인가요?',
        checked: false,
      },
      {
        id: 'idea-2',
        title: '타겟 사용자 정의',
        description: '주요 사용자는 누구인가요?',
        checked: false,
      },
      {
        id: 'idea-3',
        title: '핵심 기능 3가지 선정',
        description: 'MVP에 포함될 핵심 기능은 무엇인가요?',
        checked: false,
      },
      {
        id: 'idea-4',
        title: '경쟁 서비스 조사',
        description: '비슷한 서비스가 있다면 어떤 점이 다른가요?',
        checked: false,
      },
    ],
  },
  {
    id: 'generate',
    name: '문서 생성',
    description: 'AI가 프로젝트에 필요한 10개 문서를 자동 생성합니다',
    status: 'locked',
    linkedPage: '/new',
    icon: 'FileText',
    estimatedTime: '5분',
    checklist: [
      {
        id: 'gen-1',
        title: '아이디어 입력 (50자 이상)',
        description: '프로젝트 아이디어를 상세하게 입력하세요',
        checked: false,
      },
      {
        id: 'gen-2',
        title: '앱 유형 선택',
        description: '웹, 모바일, 또는 둘 다 선택하세요',
        checked: false,
      },
      {
        id: 'gen-3',
        title: 'API 키 설정',
        description: 'Google AI Studio API 키를 입력하세요',
        checked: false,
      },
      {
        id: 'gen-4',
        title: '문서 생성 완료',
        description: '10개 문서가 모두 생성되었는지 확인하세요',
        checked: false,
      },
    ],
  },
  {
    id: 'ai-tool',
    name: 'AI 도구 선택',
    description: '개발에 사용할 AI 도구를 선택하고 설정합니다',
    status: 'locked',
    linkedPage: '/guide',
    icon: 'Bot',
    estimatedTime: '15분',
    checklist: [
      {
        id: 'ai-1',
        title: 'VS Code 설치',
        description: 'VS Code를 설치하세요 (code.visualstudio.com)',
        checked: false,
      },
      {
        id: 'ai-2',
        title: 'AI 도구 비교 검토',
        description: 'Claude Code, OpenAI Codex, Cursor 중 선택',
        checked: false,
      },
      {
        id: 'ai-3',
        title: '선택한 도구 설치',
        description: 'npm install -g 명령어로 CLI 도구를 설치하세요',
        checked: false,
      },
      {
        id: 'ai-4',
        title: 'API 키 설정',
        description: '선택한 도구의 API 키를 환경변수로 설정하세요',
        checked: false,
      },
      {
        id: 'ai-5',
        title: '첫 번째 테스트',
        description: '생성된 문서를 활용해 AI와 첫 대화를 시도해보세요',
        checked: false,
      },
    ],
  },
  {
    id: 'develop',
    name: '개발 진행',
    description: 'TODO 목록을 따라 단계별로 개발을 진행합니다',
    status: 'locked',
    linkedPage: '/dashboard',
    icon: 'Code',
    estimatedTime: '프로젝트에 따라 다름',
    checklist: [
      {
        id: 'dev-1',
        title: '프로젝트 초기 설정',
        description: '개발 환경 및 프로젝트 구조 설정',
        checked: false,
      },
      {
        id: 'dev-2',
        title: 'Phase 1 완료',
        description: '첫 번째 개발 단계 완료',
        checked: false,
      },
      {
        id: 'dev-3',
        title: '중간 점검',
        description: '진행률 분석으로 진행 상황 확인',
        checked: false,
      },
      {
        id: 'dev-4',
        title: '핵심 기능 구현',
        description: 'MVP 핵심 기능 개발 완료',
        checked: false,
      },
    ],
  },
  {
    id: 'extend',
    name: '기능 확장',
    description: '필요에 따라 새로운 기능을 추가합니다',
    status: 'locked',
    linkedPage: '/extend',
    icon: 'PlusCircle',
    estimatedTime: '기능당 1-2시간',
    checklist: [
      {
        id: 'ext-1',
        title: '추가 기능 목록 작성',
        description: 'MVP 이후 추가할 기능 정리',
        checked: false,
      },
      {
        id: 'ext-2',
        title: '기능 우선순위 결정',
        description: '가장 중요한 기능부터 순서 정하기',
        checked: false,
      },
      {
        id: 'ext-3',
        title: '확장 문서 생성',
        description: '새 기능에 대한 문서 자동 생성',
        checked: false,
      },
      {
        id: 'ext-4',
        title: '확장 기능 구현',
        description: '새 기능 개발 완료',
        checked: false,
      },
    ],
  },
  {
    id: 'deploy',
    name: '배포 준비',
    description: '프로젝트를 배포하기 위한 최종 점검을 합니다',
    status: 'locked',
    icon: 'Rocket',
    estimatedTime: '1-2시간',
    checklist: [
      {
        id: 'dep-1',
        title: '코드 품질 검사',
        description: '린트, 타입 체크, 빌드 테스트',
        checked: false,
      },
      {
        id: 'dep-2',
        title: '테스트 실행',
        description: '모든 테스트가 통과하는지 확인',
        checked: false,
      },
      {
        id: 'dep-3',
        title: '환경 변수 설정',
        description: '프로덕션 환경 변수 준비',
        checked: false,
      },
      {
        id: 'dep-4',
        title: '배포 플랫폼 선택',
        description: 'Vercel, Netlify 등 플랫폼 선택',
        checked: false,
      },
      {
        id: 'dep-5',
        title: '배포 완료',
        description: '성공적으로 배포 완료',
        checked: false,
      },
    ],
  },
  {
    id: 'maintain',
    name: '배포 후 관리',
    description: '배포된 서비스를 모니터링하고 관리합니다',
    status: 'locked',
    icon: 'Settings',
    estimatedTime: '지속적',
    checklist: [
      {
        id: 'main-1',
        title: '모니터링 설정',
        description: '에러 트래킹, 성능 모니터링 설정',
        checked: false,
      },
      {
        id: 'main-2',
        title: '사용자 피드백 수집',
        description: '초기 사용자 의견 수렴',
        checked: false,
      },
      {
        id: 'main-3',
        title: '버그 수정',
        description: '발견된 버그 해결',
        checked: false,
      },
      {
        id: 'main-4',
        title: '다음 버전 계획',
        description: 'v2 기능 목록 작성',
        checked: false,
      },
    ],
  },
];

// ============================================
// 사용자 시나리오 정의
// ============================================

export const USER_SCENARIOS: UserScenario[] = [
  {
    id: 'beginner',
    name: '완전 초보자',
    description: '프로그래밍 경험이 없고, AI 도구도 처음 사용합니다',
    icon: 'GraduationCap',
    recommendedPath: ['idea', 'generate', 'ai-tool', 'develop', 'deploy'],
  },
  {
    id: 'has-idea',
    name: '아이디어가 있는 분',
    description: '구체적인 앱 아이디어가 있고, 빠르게 시작하고 싶습니다',
    icon: 'Lightbulb',
    recommendedPath: ['generate', 'ai-tool', 'develop', 'extend', 'deploy'],
  },
  {
    id: 'has-design',
    name: '디자인 영감이 있는 분',
    description: '참고하고 싶은 웹사이트가 있고, 비슷한 디자인을 원합니다',
    icon: 'Palette',
    recommendedPath: ['idea', 'generate', 'ai-tool', 'develop', 'deploy'],
  },
  {
    id: 'experienced',
    name: '개발 경험이 있는 분',
    description: '기본적인 개발 지식이 있고, AI를 활용하고 싶습니다',
    icon: 'Code',
    recommendedPath: ['generate', 'develop', 'extend', 'deploy', 'maintain'],
  },
];

// ============================================
// 배포 체크리스트 정의
// ============================================

export const DEPLOYMENT_CHECKLIST: DeploymentCategory[] = [
  {
    category: '코드 품질',
    icon: 'CheckCircle',
    items: [
      {
        id: 'lint',
        title: '린트 검사 통과',
        description: 'ESLint 에러 및 경고 해결',
        isRequired: true,
        checked: false,
      },
      {
        id: 'type-check',
        title: '타입 검사 통과',
        description: 'TypeScript 컴파일 에러 없음',
        isRequired: true,
        checked: false,
      },
      {
        id: 'build',
        title: '프로덕션 빌드 성공',
        description: 'npm run build 성공',
        isRequired: true,
        checked: false,
      },
      {
        id: 'console',
        title: '콘솔 에러 제거',
        description: '브라우저 콘솔에 에러 없음',
        isRequired: false,
        checked: false,
      },
    ],
  },
  {
    category: '테스트',
    icon: 'TestTube',
    items: [
      {
        id: 'unit-test',
        title: '단위 테스트 통과',
        description: '모든 유닛 테스트 통과',
        isRequired: false,
        checked: false,
      },
      {
        id: 'e2e-test',
        title: 'E2E 테스트 통과',
        description: '주요 사용자 흐름 테스트',
        isRequired: false,
        checked: false,
      },
      {
        id: 'manual-test',
        title: '수동 테스트 완료',
        description: '주요 기능 직접 테스트',
        isRequired: true,
        checked: false,
      },
    ],
  },
  {
    category: '환경 설정',
    icon: 'Settings',
    items: [
      {
        id: 'env-vars',
        title: '환경 변수 설정',
        description: '프로덕션 환경 변수 준비',
        isRequired: true,
        checked: false,
      },
      {
        id: 'secrets',
        title: 'API 키 보안 확인',
        description: 'API 키가 코드에 노출되지 않음',
        isRequired: true,
        checked: false,
      },
      {
        id: 'domain',
        title: '도메인 설정',
        description: '커스텀 도메인 연결 (선택)',
        isRequired: false,
        checked: false,
      },
    ],
  },
  {
    category: '성능',
    icon: 'Zap',
    items: [
      {
        id: 'lighthouse',
        title: 'Lighthouse 점수 확인',
        description: '성능 점수 70점 이상',
        isRequired: false,
        checked: false,
      },
      {
        id: 'images',
        title: '이미지 최적화',
        description: '이미지 크기 및 포맷 최적화',
        isRequired: false,
        checked: false,
      },
      {
        id: 'bundle',
        title: '번들 크기 확인',
        description: '불필요한 종속성 제거',
        isRequired: false,
        checked: false,
      },
    ],
  },
  {
    category: '보안',
    icon: 'Shield',
    items: [
      {
        id: 'https',
        title: 'HTTPS 활성화',
        description: 'SSL 인증서 적용',
        isRequired: true,
        checked: false,
      },
      {
        id: 'headers',
        title: '보안 헤더 설정',
        description: 'CSP, CORS 등 보안 헤더',
        isRequired: false,
        checked: false,
      },
      {
        id: 'dependencies',
        title: '의존성 취약점 검사',
        description: 'npm audit으로 취약점 확인',
        isRequired: false,
        checked: false,
      },
    ],
  },
];

// ============================================
// 배포 플랫폼 정보
// ============================================

export const DEPLOYMENT_PLATFORMS: DeploymentPlatform[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    icon: 'Triangle',
    description: 'Next.js 프로젝트에 최적화된 배포 플랫폼',
    steps: [
      'Vercel 계정 생성 (vercel.com)',
      'GitHub 저장소 연결',
      '프로젝트 import',
      '환경 변수 설정',
      'Deploy 클릭',
    ],
    docsUrl: 'https://vercel.com/docs',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: 'Layers',
    description: '정적 사이트 및 서버리스 함수 배포',
    steps: [
      'Netlify 계정 생성 (netlify.com)',
      'GitHub 저장소 연결',
      '빌드 설정 (npm run build)',
      '환경 변수 설정',
      'Deploy site 클릭',
    ],
    docsUrl: 'https://docs.netlify.com',
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    icon: 'Github',
    description: '정적 사이트 무료 호스팅 (GitHub 연동)',
    steps: [
      'Repository Settings 이동',
      'Pages 섹션 선택',
      'Source를 GitHub Actions로 설정',
      '배포 워크플로우 추가',
      '커밋 후 자동 배포',
    ],
    docsUrl: 'https://docs.github.com/pages',
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: 'Train',
    description: '풀스택 앱 배포 및 데이터베이스 호스팅',
    steps: [
      'Railway 계정 생성 (railway.app)',
      'New Project 클릭',
      'GitHub 저장소 연결',
      '환경 변수 설정',
      '자동 배포 활성화',
    ],
    docsUrl: 'https://docs.railway.app',
  },
];

// ============================================
// AI 도구 비교 정보
// ============================================

export const AI_TOOLS_COMPARISON = [
  {
    id: 'claudecode',
    name: 'Claude Code',
    url: 'https://www.anthropic.com',
    bestFor: 'VS Code에서 터미널 기반 AI 코딩',
    pros: ['VS Code 연동', '전체 프로젝트 이해', '자연어 명령어'],
    cons: ['Node.js 설치 필요', 'API 키 필요'],
    difficulty: 'easy',
    recommended: true,
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    url: 'https://openai.com',
    bestFor: 'VS Code에서 자동 코드 편집',
    pros: ['자동 승인 모드', '빠른 코드 수정', '안전한 승인 시스템'],
    cons: ['Node.js 설치 필요', 'API 키 필요'],
    difficulty: 'easy',
    recommended: false,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.com',
    bestFor: 'AI 네이티브 코드 에디터',
    pros: ['AI 내장 IDE', 'Cmd+K 인라인 편집', '자동 완성'],
    cons: ['별도 에디터 설치', '유료 플랜 권장'],
    difficulty: 'medium',
    recommended: false,
  },
];
