# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint check
```

## Architecture Overview

VibeDocs is a Next.js 16 full-stack web application (Korean-language) that generates development documentation from project ideas using Google Gemini AI. Users input an idea and receive 10 core development documents automatically.

### Tech Stack
- **Framework:** Next.js 16 with App Router (RSC enabled)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 4.x with shadcn/ui (New York style)
- **State:** Zustand with localStorage persistence
- **AI:** Google Generative AI (Gemini 2.5-flash)
- **Animation:** Framer Motion

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # REST API endpoints
│   │   ├── generate-documents/   # Core document generation
│   │   ├── generate-extension/   # Feature extension
│   │   ├── analyze-progress/     # AI TODO matching
│   │   ├── extract-design/       # Design system extraction
│   │   └── gemini/              # Gemini API wrapper (generate, validate, test)
│   ├── new/               # Project creation flow
│   ├── dashboard/         # TODO management views
│   ├── extend/            # Feature extension
│   ├── design/            # Design extraction
│   ├── guide/             # User guides
│   └── workflow/          # Workflow steps
├── components/
│   ├── ui/                # shadcn/ui primitives (17 components)
│   ├── layout/            # Header, Footer
│   ├── project/           # IdeaForm, ApiKeyModal, GenerationProgress
│   ├── document/          # DocumentPreview
│   ├── todo/              # ChecklistView, KanbanView, TimelineView
│   └── dashboard/         # Dashboard-specific components
├── stores/                # Zustand stores with persistence
│   ├── projectStore.ts    # Projects, documents, TODOs, progress
│   ├── settingsStore.ts   # API key, theme, language
│   └── workflowStore.ts   # Workflow progression
├── types/index.ts         # All TypeScript definitions (centralized)
├── lib/
│   ├── gemini.ts          # Gemini API client
│   └── utils.ts           # General utilities
└── constants/
    ├── templates.ts       # 9 app templates (shopping, booking, etc.)
    └── workflow.ts        # Workflow definitions
```

### State Management

Three Zustand stores persist to localStorage:
- `vibedocs-project` / `vibedocs-projects` - Project data
- `vibedocs-api-key` / `vibedocs-settings` - User settings
- `vibedocs-workflow` - Workflow state

### Key Type Definitions

Core types in `src/types/index.ts`:
- `AppType`: 'web' | 'mobile' | 'both'
- `TemplateType`: 'shopping' | 'booking' | 'community' | 'blog' | 'dashboard' | 'inventory' | 'hr' | 'webpage' | 'custom'
- `TodoStatus`: 'pending' | 'in-progress' | 'done'
- `Priority`: 'critical' | 'high' | 'medium' | 'low'
- `Project`: Main entity with coreDocs, extensions, todos, progress
- `TodoItem`: Task with AI analysis fields (statusUpdatedBy, statusConfidence)

### Component Patterns

- **Client Components:** Use `'use client'` directive for interactivity
- **shadcn/ui:** Import from `@/components/ui/*`
- **Path Aliases:** `@/*` maps to `./src/*`
- **Exports:** Feature directories use index.ts for exports

### API Response Format

All API routes return consistent structure:
```typescript
{ success: boolean, data?: T, error?: string }
```

### Generated Documents

Ten core documents per project:
IDEA_BRIEF.md, USER_STORIES.md, SCREEN_FLOW.md, PRD_CORE.md, TECH_STACK.md, DATA_MODEL.md, API_SPEC.md, TEST_SCENARIOS.md, TODO_MASTER.md, PROMPT_GUIDE.md

### Development Notes

- Korean-first UI (all user-facing text in Korean)
- Mock mode available for testing without API key
- API keys stored client-side in localStorage only
- Uses Puppeteer for design extraction from URLs

### Communication

- 항상 설명과 답변은 한국어로 해 줘
