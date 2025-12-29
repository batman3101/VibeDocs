'use client';

import { FileText, Palette, CheckSquare, Layers, Cpu, Download, Route } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Route,
    title: 'End-to-End 가이드',
    description: '아이디어부터 배포까지 7단계 워크플로우로 초보자도 쉽게 개발 여정을 완성할 수 있습니다.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: FileText,
    title: '문서 자동 생성',
    description: '아이디어 입력 한 번으로 PRD, 기술스택, API 명세서 등 10개의 핵심 문서를 자동 생성합니다.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Palette,
    title: '디자인 추출',
    description: '마음에 드는 사이트 URL을 입력하면 색상, 폰트, 레이아웃을 자동으로 추출합니다.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: CheckSquare,
    title: 'TODO 대시보드',
    description: '체크리스트, 칸반 보드, 타임라인 등 3가지 뷰로 개발 진행 상황을 관리합니다.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Layers,
    title: '기능 확장',
    description: '새로운 기능이 필요하면 Extension 문서를 자동 생성하고 기존 TODO에 병합합니다.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Cpu,
    title: 'AI 진행도 분석',
    description: '작업 내용을 입력하면 AI가 완료된 TODO를 자동으로 분석하고 체크합니다.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    icon: Download,
    title: '다양한 내보내기',
    description: 'Markdown, JSON, ZIP 등 다양한 형식으로 내보내고 Claude, Cursor에서 바로 사용하세요.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

const documents = [
  'IDEA_BRIEF.md',
  'USER_STORIES.md',
  'SCREEN_FLOW.md',
  'PRD_CORE.md',
  'TECH_STACK.md',
  'DATA_MODEL.md',
  'API_SPEC.md',
  'TEST_SCENARIOS.md',
  'TODO_MASTER.md',
  'PROMPT_GUIDE.md',
];

export function FeatureSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            바이브 코딩에 필요한 모든 것
          </h2>
          <p className="text-lg text-muted-foreground">
            아이디어부터 배포까지, VibeDocs가 모든 과정을 도와드립니다
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">자동 생성되는 10개의 핵심 문서</h3>
            <p className="text-muted-foreground">
              Claude, Cursor, Bolt 등 AI 도구에 바로 사용할 수 있는 구조화된 문서
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {documents.map((doc, index) => (
              <div
                key={doc}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span className="text-sm font-mono truncate">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
