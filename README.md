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

---

## Quick Start (5분 안에 실행하기)

### 사전 요구사항

| 항목 | 버전 | 확인 명령어 |
|------|------|-------------|
| Node.js | 18.17 이상 | `node -v` |
| npm | 9.0 이상 | `npm -v` |
| Git | 최신 | `git --version` |

### Node.js 설치 (처음인 경우)

**Windows:**
1. [nodejs.org](https://nodejs.org/) 접속
2. LTS 버전 다운로드 및 설치
3. 설치 후 터미널(PowerShell 또는 CMD) 재시작

**Mac:**
```bash
# Homebrew 사용 (권장)
brew install node

# 또는 nodejs.org에서 직접 다운로드
```

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/batman3101/VibeDocs.git

# 2. 프로젝트 폴더로 이동
cd VibeDocs

# 3. 의존성 설치 (1-2분 소요)
npm install

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 주요 기능

### 1. 문서 자동 생성
아이디어를 입력하면 AI가 개발에 필요한 모든 문서를 자동으로 생성합니다.

### 2. 멀티 AI 프로바이더 지원
- **Google Gemini** (기본, 무료 티어 제공)
- **OpenAI** (GPT-4, GPT-4o 등)
- **Anthropic Claude** (Claude 3.5 Sonnet 등)

### 3. TODO 관리
- **체크리스트 뷰**: Phase별 아코디언 형태로 태스크 관리
- **칸반 뷰**: 드래그 앤 드롭으로 상태 변경
- **타임라인 뷰**: 시간 기반 진행 상황 확인

### 4. AI 진행도 분석
작업 내용을 설명하면 AI가 자동으로 완료된 TODO를 매칭해줍니다.

### 5. 기능 확장
기존 프로젝트에 새로운 기능을 추가하고, 관련 문서와 TODO를 자동 생성합니다.

### 6. 디자인 추출
웹사이트 URL에서 색상, 타이포그래피 등 디자인 시스템을 추출합니다.

### 7. 바이브 코딩 가이드
- 바이브 코딩 방법론
- Claude, Cursor, Bolt 등 AI 도구 사용법
- GitHub 사용법 (초보자용)
- Supabase 데이터베이스 사용법 (초보자용)

---

## API 키 설정

VibeDocs는 AI 기능을 사용하기 위해 API 키가 필요합니다.

### Google Gemini (추천 - 무료 시작 가능)

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. Google 계정으로 로그인
3. "Get API Key" 클릭
4. API 키 복사
5. VibeDocs의 설정(톱니바퀴 아이콘)에서 입력

### OpenAI

1. [platform.openai.com](https://platform.openai.com/) 접속
2. 계정 생성 및 로그인
3. API Keys 메뉴에서 새 키 생성
4. `sk-`로 시작하는 키 복사

### Anthropic Claude

1. [console.anthropic.com](https://console.anthropic.com/) 접속
2. 계정 생성 및 로그인
3. API Keys에서 새 키 생성
4. `sk-ant-`로 시작하는 키 복사

> **보안 안내**: API 키는 브라우저의 LocalStorage에만 저장되며 외부 서버로 전송되지 않습니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5.x |
| 스타일링 | Tailwind CSS 4.x |
| UI 컴포넌트 | shadcn/ui |
| 상태관리 | Zustand (persist) |
| AI | Google Gemini, OpenAI, Anthropic |

---

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # 랜딩 페이지 (/)
│   ├── new/page.tsx     # 새 프로젝트 (/new)
│   ├── dashboard/       # TODO 대시보드 (/dashboard)
│   ├── extend/          # 기능 확장 (/extend)
│   ├── design/          # 디자인 추출 (/design)
│   ├── guide/           # 사용 가이드 (/guide)
│   └── api/             # API Routes
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── layout/          # Header, Footer
│   ├── landing/         # Hero, Feature 섹션
│   ├── project/         # IdeaForm, ApiKeyModal
│   ├── document/        # DocumentPreview
│   └── todo/            # ChecklistView, KanbanView, TimelineView
├── stores/              # Zustand 스토어
├── types/               # TypeScript 타입
├── lib/                 # 유틸리티 함수
└── constants/           # 상수, 템플릿
```

---

## 빌드 및 배포

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드된 앱 실행
npm start
```

### Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

---

## 문제 해결 (Troubleshooting)

### npm install 오류

```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 포트 3000 이미 사용 중

```bash
# 다른 포트로 실행
npm run dev -- -p 3001
```

### Node.js 버전 문제

```bash
# Node.js 버전 확인
node -v

# 18.17 미만이면 업데이트 필요
# Windows: nodejs.org에서 재설치
# Mac: brew upgrade node
```

### Windows PowerShell 실행 정책 오류

```powershell
# 관리자 권한으로 PowerShell 실행 후
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

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

---

## 환경변수 (선택사항)

서버 사이드에서 API 키를 사용하려면 `.env.local` 파일 생성:

```env
# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

> 참고: 기본적으로 클라이언트 사이드에서 API 키를 입력받아 사용하므로 환경변수 설정은 선택사항입니다.

---

## 라이선스

MIT License

## 기여

이슈와 PR은 언제나 환영합니다!

---

Made with BATMAN
