# VibeDocs

AI 바이브 코딩을 위한 문서 자동 생성 웹앱

## 소개

VibeDocs는 코딩 경험이 없는 사용자가 AI 바이브 코딩을 시작할 때 필요한 모든 문서를 원클릭으로 자동 생성해주는 웹앱입니다.

아이디어만 입력하면 개발에 필요한 10개의 핵심 문서가 자동으로 생성됩니다:

- IDEA_BRIEF.md - 아이디어 개요
- USER_STORIES.md - 사용자 스토리
- SCREEN_FLOW.md - 화면 흐름도
- PRD_CORE.md - 제품 요구사항
- TECH_STACK.md - 기술 스택
- DATA_MODEL.md - 데이터 모델
- API_SPEC.md - API 명세서
- TEST_SCENARIOS.md - 테스트 시나리오
- TODO_MASTER.md - 개발 태스크 목록
- PROMPT_GUIDE.md - AI 프롬프트 가이드

## 주요 기능

### 1. 문서 자동 생성
아이디어를 입력하면 Claude AI가 개발에 필요한 모든 문서를 자동으로 생성합니다.

### 2. TODO 관리
- **체크리스트 뷰**: Phase별 아코디언 형태로 태스크 관리
- **칸반 뷰**: 드래그 앤 드롭으로 상태 변경
- **타임라인 뷰**: 시간 기반 진행 상황 확인

### 3. AI 진행도 분석
작업 내용을 설명하면 AI가 자동으로 완료된 TODO를 매칭해줍니다.

### 4. 기능 확장
기존 프로젝트에 새로운 기능을 추가하고, 관련 문서와 TODO를 자동 생성합니다.

### 5. 디자인 추출
웹사이트 URL에서 색상, 타이포그래피 등 디자인 시스템을 추출합니다.

### 6. 가이드
바이브 코딩 방법과 Claude, Cursor, Bolt 등 AI 도구 사용법을 안내합니다.

## 설치 및 실행

### 요구사항
- Node.js 18.17 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/vibedocs.git
cd vibedocs

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드된 앱 실행
npm start
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript 5.3+ |
| 스타일링 | Tailwind CSS 3.x |
| UI 컴포넌트 | shadcn/ui |
| 상태관리 | Zustand 4.x (persist) |
| AI | Claude API |
| 애니메이션 | Framer Motion |

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # 랜딩 페이지 (/)
│   ├── new/page.tsx     # 새 프로젝트 (/new)
│   ├── dashboard/       # TODO 대시보드 (/dashboard)
│   ├── extend/          # 기능 확장 (/extend)
│   ├── design/          # 디자인 추출 (/design)
│   └── guide/           # 사용 가이드 (/guide)
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── layout/          # Header, Footer
│   ├── landing/         # Hero, Feature 섹션
│   ├── project/         # IdeaForm, ApiKeyModal
│   ├── document/        # DocumentPreview
│   └── todo/            # ChecklistView, KanbanView, TimelineView
├── stores/              # Zustand 스토어
├── types/               # TypeScript 타입
└── constants/           # 상수, 템플릿
```

## 사용법

### 1. 새 프로젝트 생성

1. 메인 페이지에서 "새 프로젝트 시작" 클릭
2. 아이디어 입력 (50자 이상)
3. 앱 유형 선택 (웹/모바일/둘다)
4. 템플릿 선택 (선택사항)
5. "문서 생성하기" 클릭
6. 생성된 문서 미리보기 및 다운로드

### 2. TODO 관리

- 대시보드에서 체크리스트/칸반/타임라인 뷰 전환
- 체크박스로 완료 상태 변경
- 프롬프트 복사 버튼으로 AI 도구에 전달

### 3. AI 진행도 분석

1. 대시보드에서 "AI 진행도 분석" 클릭
2. 완료한 작업 내용 입력
3. 매칭된 TODO 확인 및 적용

## API 키 설정

Claude API를 사용하려면:

1. Header의 설정 아이콘 클릭
2. API 키 입력 (sk-ant-로 시작)
3. 저장

> 참고: API 키는 브라우저의 LocalStorage에만 저장되며 외부로 전송되지 않습니다.

## 개발 모드

현재 Mock 데이터 모드로 개발되어 있습니다. API 키 없이도 모든 기능을 테스트할 수 있습니다.

실제 AI 기능을 사용하려면:
1. Claude API 키 발급 ([console.anthropic.com](https://console.anthropic.com))
2. Header에서 API 키 설정
3. (추후 업데이트 예정)

## 라이선스

MIT License

## 기여

이슈와 PR은 언제나 환영합니다!

---

Made with VibeDocs
