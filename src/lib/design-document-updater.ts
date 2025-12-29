import type { DesignSystem, CoreDocuments } from '@/types';

/**
 * 디자인 시스템을 마크다운 섹션으로 변환
 */
export function generateDesignSection(design: DesignSystem): string {
  const extractedDate = new Date(design.extractedAt).toLocaleDateString('ko-KR');

  return `
## Design System

> 출처: ${design.sourceUrl}
> 추출일: ${extractedDate}

### Color Palette

| 역할 | 색상 |
|------|------|
| Primary | \`${design.colors.primary}\` |
| Secondary | \`${design.colors.secondary}\` |
| Accent | \`${design.colors.accent}\` |
| Background | \`${design.colors.background}\` |
| Surface | \`${design.colors.surface}\` |
| Text (Primary) | \`${design.colors.text.primary}\` |
| Text (Secondary) | \`${design.colors.text.secondary}\` |
| Text (Muted) | \`${design.colors.text.muted}\` |
| Border | \`${design.colors.border}\` |
| Success | \`${design.colors.success}\` |
| Warning | \`${design.colors.warning}\` |
| Error | \`${design.colors.error}\` |

### Typography

- **Heading Font:** ${design.typography.fontFamily.heading}
- **Body Font:** ${design.typography.fontFamily.body}
- **Mono Font:** ${design.typography.fontFamily.mono}

### Effects

| 타입 | 값 |
|------|-----|
| Border Radius | sm: ${design.effects.borderRadius.sm || '-'}, md: ${design.effects.borderRadius.md || '-'}, lg: ${design.effects.borderRadius.lg || '-'} |
| Shadow | sm, md, lg 사용 가능 |
`;
}

/**
 * TECH_STACK 문서에 추가할 디자인 섹션 생성
 */
function generateTechStackSection(design: DesignSystem): string {
  return `

---

${generateDesignSection(design)}

### CSS Variables 예시

\`\`\`css
:root {
  --color-primary: ${design.colors.primary};
  --color-secondary: ${design.colors.secondary};
  --color-accent: ${design.colors.accent};
  --color-background: ${design.colors.background};
  --color-surface: ${design.colors.surface};
  --color-text-primary: ${design.colors.text.primary};
  --color-text-secondary: ${design.colors.text.secondary};
  --color-border: ${design.colors.border};

  --font-heading: ${design.typography.fontFamily.heading};
  --font-body: ${design.typography.fontFamily.body};
  --font-mono: ${design.typography.fontFamily.mono};
}
\`\`\`
`;
}

/**
 * PRD 문서에 추가할 디자인 참조 섹션 생성
 */
function generatePrdSection(design: DesignSystem): string {
  return `

---

## Design Reference

이 프로젝트는 추출된 디자인 시스템을 따릅니다.

- **주요 색상:** Primary(${design.colors.primary}), Secondary(${design.colors.secondary})
- **폰트:** ${design.typography.fontFamily.body}
- **디자인 소스:** ${design.sourceUrl}

자세한 디자인 스펙은 TECH_STACK.md를 참조하세요.
`;
}

/**
 * PROMPT_GUIDE 문서에 추가할 디자인 사용 팁 섹션 생성
 */
function generatePromptGuideSection(design: DesignSystem): string {
  return `

---

## Design System 활용 가이드

AI 도구로 UI를 구현할 때 다음 디자인 시스템을 참고하세요:

### 색상 사용
- **Primary 버튼/강조:** ${design.colors.primary}
- **Secondary 요소:** ${design.colors.secondary}
- **배경색:** ${design.colors.background}
- **카드/Surface:** ${design.colors.surface}
- **텍스트:** ${design.colors.text.primary}
- **보조 텍스트:** ${design.colors.text.secondary}

### 폰트 설정
\`\`\`
Heading: ${design.typography.fontFamily.heading}
Body: ${design.typography.fontFamily.body}
Code: ${design.typography.fontFamily.mono}
\`\`\`

### 프롬프트 예시

> "Primary 색상(${design.colors.primary})을 사용한 버튼을 만들어주세요.
> 폰트는 ${design.typography.fontFamily.body}를 사용하고,
> 모서리는 rounded-md 스타일로 해주세요."
`;
}

/**
 * 문서들에 디자인 섹션 추가
 * @returns 업데이트된 문서 객체 (변경된 필드만 포함)
 */
export function updateDocumentsWithDesign(
  coreDocs: CoreDocuments,
  design: DesignSystem
): Partial<CoreDocuments> {
  return {
    techStack: coreDocs.techStack + generateTechStackSection(design),
    prd: coreDocs.prd + generatePrdSection(design),
    promptGuide: coreDocs.promptGuide + generatePromptGuideSection(design),
  };
}

/**
 * 문서에 이미 디자인 섹션이 있는지 확인
 */
export function hasDesignSection(document: string): boolean {
  return document.includes('## Design System') || document.includes('## Design Reference');
}
