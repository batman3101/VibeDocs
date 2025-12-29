'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Route, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AI 바이브 코딩의 시작</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            아이디어만 있으면
            <br />
            <span className="text-primary">충분합니다</span>
          </h1>

          {/* Sub Headline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            코딩 경험이 없어도 괜찮아요.
            <br className="hidden sm:block" />
            아이디어를 입력하면 AI가 개발에 필요한 <strong>10개의 핵심 문서</strong>를 자동으로 생성합니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/workflow" className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                워크플로우 시작
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/new" className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                바로 문서 생성
              </Link>
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>아이디어부터 배포까지</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>7단계 완벽 가이드</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>100% 무료 오픈소스</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
