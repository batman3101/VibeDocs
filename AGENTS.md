# AGENTS.md

이 파일은 VibeDocs 코드베이스에서 작업하는 에이전트 코딩 AI들을 위한 가이드라인입니다.

## 빌드 및 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 서버 시작
npm run lint     # ESLint 검사 (Next.js 설정 사용)
```

### 테스팅
현재 이 프로젝트는 테스트 프레임워크가 설정되어 있지 않습니다. 테스트를 추가할 때는 package.json의 스크립트를 먼저 확인하세요.

## 코드 스타일 가이드라인

### TypeScript 및 타입
- **엄격한 타입 검사 활성화** - 모든 코드는 TypeScript strict mode를 통과해야 함
- **중앙화된 타입** - 모든 타입은 `src/types/index.ts`에 정의
- **타입 임포트** - 타입 전용 임포트는 `import type` 사용
- **인터페이스 vs 타입** - 확장 가능한 객체 형태는 인터페이스, 유니온/프리미티브는 타입 선호

### 임포트 구성
```typescript
// 1. 외부 라이브러리 (React, Next.js 등)
import * as React from "react"
import { NextRequest } from 'next/server'

// 2. UI 컴포넌트 (@/components/ui/*)
import { Button } from "@/components/ui/button"

// 3. 내부 컴포넌트 (@/components/*)
import { IdeaForm } from "@/components/project"

// 4. 스토어 및 훅
import { useProjectStore } from "@/stores/projectStore"

// 5. 타입 (타입 임포트 사용)
import type { Project, TodoItem } from "@/types"

// 6. 유틸리티
import { cn } from "@/lib/utils"
```

### 컴포넌트 패턴
- **클라이언트 컴포넌트** - 인터랙티브한 기능은 `'use client'` 지시어 사용
- **shadcn/ui** - `@/components/ui/*`에서 임포트, 기존 패턴 따르기
- **경로 별칭** - `@/*` 매핑 사용 (tsconfig.json에 설정됨)
- **피처 익스포트** - 피처 디렉토리에서 index.ts 파일로 깔끔한 익스포트

### 상태 관리
- **Zustand 스토어** - localStorage 영속성을 가진 3개의 메인 스토어:
  - `vibedocs-project` / `vibedocs-projects` - 프로젝트 데이터
  - `vibedocs-api-key` / `vibedocs-settings` - 사용자 설정
  - `vibedocs-workflow` - 워크플로우 상태
- **스토어 패턴** - stores/의 기존 패턴을 따라 액션, 상태 업데이트, 영속성 구현

### API 라우트
- **일관된 응답 형식**:
  ```typescript
  { success: boolean, data?: T, error?: string }
  ```
- **에러 처리** - try/catch와 적절한 에러 응답 사용
- **타입 안전성** - `@/types`에서 타입 임포트하여 요청/응답 검증

### 스타일링 및 UI
- **Tailwind CSS 4.x** - 유틸리티 클래스 사용, 커스텀 CSS 최소화
- **shadcn/ui 컴포넌트** - New York 스타일 설정 따르기
- **컴포넌트 변형** - class-variance-authority (cva)로 컴포넌트 변형 구현
- **반응형 디자인** - Tailwind 브레이크포인트로 모바일 퍼스트 접근

### 명명 규칙
- **파일** - 컴포넌트는 PascalCase (IdeaForm.tsx), 유틸리티는 camelCase (utils.ts)
- **컴포넌트** - PascalCase (IdeaForm, DocumentPreview)
- **함수/변수** - camelCase (calculateProgress, updateTodoStatus)
- **상수** - UPPER_SNAKE_CASE (DOCUMENT_NAMES, STORAGE_KEYS)
- **타입/인터페이스** - PascalCase (Project, TodoItem, CoreDocuments)

### 에러 처리
- **API 에러** - code, message, details를 포함한 일관된 에러 객체 반환
- **클라이언트 에러** - try/catch 블록 사용, 사용자 친화적 메시지 표시
- **검증** - 컴파일 타임 검증은 TypeScript, 런타임 검증은 API 입력

### 파일 구조
```
src/
├── app/                    # Next.js App Router 페이지 및 API 라우트
├── components/
│   ├── ui/                # shadcn/ui 프리미티브
│   ├── layout/            # Header, Footer
│   ├── project/           # 프로젝트 관련 컴포넌트
│   ├── document/          # 문서 컴포넌트
│   └── todo/              # TODO 관리 컴포넌트
├── stores/                # Zustand 스토어
├── types/index.ts         # 모든 TypeScript 정의
├── lib/                   # 유틸리티 및 헬퍼
└── constants/             # 상수 및 템플릿
```

### 한국어 지원
- **UI 우선 한국어** - 모든 사용자 대면 텍스트는 한국어여야 함
- **코드 주석** - 기술적 명확성을 위해 영문 사용 가능
- **API 응답** - 생성된 문서는 한국어, 기술 응답은 영문

### AI 통합
- **멀티 프로바이더 지원** - Google Gemini (기본), OpenAI, Anthropic
- **API 키 관리** - 클라이언트 측 localStorage만 사용, 서버 측 노출 금지
- **모크 모드** - API 키 없이 테스트용으로 사용 가능

### 보안 모범 사례
- **API 키 노출 금지** - API 키를 로그하거나 노출하지 않음
- **입력 검증** - 모든 사용자 입력 검증, 특히 AI 프롬프트
- **CORS** - API 라우트에 적절하게 설정

### 개발 워크플로우
1. **항상 lint 실행** - 커밋 전 `npm run lint`
2. **타입 검사** - TypeScript 컴파일 성공 확인
3. **컴포넌트 테스팅** - 개발 환경에서 컴포넌트 테스트
4. **API 테스팅** - 적절한 에러 케이스로 API 엔드포인트 테스트

### 성능 고려사항
- **React 19** - 최신 React 기능 적절히 사용
- **Next.js 16** - App Router 최적화 활용
- **번들 크기** - 임포트 크기 주의, 적절한 곳에 동적 임포트 사용
- **상태 영속성** - Zustand persist로 효율적인 localStorage 사용

### 일반적인 패턴
- **조건부 렌더링** - 간단한 조건은 삼항 연산자, 복잡한 로직은 early return
- **이벤트 핸들러** - JSX에서 분리된 핸들러 함수
- **비동기 작업** - 적절한 로딩 상태와 에러 처리
- **폼 처리** - 적절한 검증이 있는 제어된 컴포넌트

## 중요 참고사항

- **한국어 우선 애플리케이션** - 모든 사용자 인터페이스와 생성된 콘텐츠는 한국어 우선
- **AI 기반 문서화** - 핵심 기능은 AI 생성 개발 문서를 중심으로 함
- **기존 테스트 프레임워크 없음** - 테스트 추가 시 적절한 프레임워크 선택 및 package.json 스크립트 업데이트
- **shadcn/ui 통합** - UI 컴포넌트와 스타일링을 위한 기존 패턴 따르기