'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Code2,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Rocket,
  Lightbulb,
  Target,
  MessageSquare,
  FolderOpen,
  Settings,
  List,
  Wand2,
  AlertCircle,
  Check,
  ArrowRight,
  Download,
  Terminal,
  Monitor,
  Keyboard,
  MousePointer,
  Package,
  Play,
  Zap,
  Key,
  Palette,
  LayoutDashboard,
  Plus,
  Eye,
  PenTool,
  Image,
  Globe,
  Bot,
  Coins,
  Star,
  HelpCircle,
  Home,
  Route,
  Github,
  GitCommit,
  CloudUpload,
  History,
  Users,
  Shield,
  FolderGit2,
  Database,
  Table2,
  Lock,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
  content: React.ReactNode;
}

export default function GuidePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('intro');

  const sections: GuideSection[] = [
    {
      id: 'intro',
      title: '바이브 코딩이란?',
      icon: <Sparkles className="h-5 w-5" />,
      emoji: '✨',
      description: 'AI와 함께하는 새로운 개발 방식',
      content: <IntroSection />,
    },
    {
      id: 'workflow',
      title: 'VibeDocs 사용법',
      icon: <Route className="h-5 w-5" />,
      emoji: '🗺️',
      description: 'VibeDocs 앱 완전 정복',
      content: <WorkflowSection />,
    },
    {
      id: 'documents',
      title: '문서 활용 가이드',
      icon: <FileText className="h-5 w-5" />,
      emoji: '📄',
      description: 'VibeDocs 문서 사용법',
      content: <DocumentsSection />,
    },
    {
      id: 'vscode',
      title: 'VS Code 설치',
      icon: <Code2 className="h-5 w-5" />,
      emoji: '💻',
      description: '개발 환경 준비하기',
      content: <VSCodeSection />,
    },
    {
      id: 'claudecode',
      title: 'Claude Code 사용법',
      icon: <Terminal className="h-5 w-5" />,
      emoji: '🤖',
      description: 'VS Code에서 Claude Code 활용',
      content: <ClaudeCodeSection />,
    },
    {
      id: 'codex',
      title: 'OpenAI Codex 사용법',
      icon: <Zap className="h-5 w-5" />,
      emoji: '⚡',
      description: 'VS Code에서 Codex CLI 활용',
      content: <CodexSection />,
    },
    {
      id: 'cursor',
      title: 'Cursor 사용법',
      icon: <MousePointer className="h-5 w-5" />,
      emoji: '🖱️',
      description: 'AI 내장 에디터 활용하기',
      content: <CursorSection />,
    },
    {
      id: 'tips',
      title: '효과적인 프롬프트',
      icon: <CheckCircle2 className="h-5 w-5" />,
      emoji: '💡',
      description: 'AI와 소통하는 팁',
      content: <TipsSection />,
    },
    {
      id: 'github',
      title: 'GitHub 사용법',
      icon: <Github className="h-5 w-5" />,
      emoji: '🐙',
      description: '코드 저장소 활용하기',
      content: <GitHubSection />,
    },
    {
      id: 'database',
      title: 'Supabase 데이터베이스',
      icon: <Database className="h-5 w-5" />,
      emoji: '🗄️',
      description: '클라우드 데이터베이스 시작하기',
      content: <SupabaseSection />,
    },
  ];

  const activeContent = sections.find((s) => s.id === activeSection);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">📚 사용 가이드</h1>
            <p className="text-muted-foreground mt-1">
              VibeDocs와 AI 코딩 도구 사용법을 쉽게 알아보세요
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2 sticky top-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                    : 'hover:bg-muted hover:scale-[1.01]'
                }`}
              >
                <span className="text-xl">{section.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{section.title}</p>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      activeSection === section.id
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {section.description}
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    activeSection === section.id ? 'translate-x-1' : ''
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeContent && (
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                    {activeContent.emoji}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{activeContent.title}</CardTitle>
                    <CardDescription className="mt-1">{activeContent.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">{activeContent.content}</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowSection() {
  return (
    <div className="space-y-8">
      {/* 시작하기 전에 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="text-2xl">👋</div>
          <div>
            <p className="font-semibold text-lg">VibeDocs에 오신 것을 환영합니다!</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              VibeDocs는 여러분의 앱 아이디어를 <strong className="text-foreground">체계적인 문서</strong>로
              바꿔주는 도구예요. 이 문서들을 AI 코딩 도구에 전달하면,
              누구나 쉽게 앱을 만들 수 있답니다! 🚀
            </p>
          </div>
        </div>
      </div>

      {/* 전체 흐름 요약 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          VibeDocs 사용 흐름 한눈에 보기
        </h3>
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
            <Key className="h-5 w-5 text-amber-500" />
            <span className="font-medium">AI 공급업체 설정</span>
            <span className="text-muted-foreground text-sm">→ API 키 입력</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
            <Plus className="h-5 w-5 text-green-500" />
            <span className="font-medium">새 프로젝트 생성</span>
            <span className="text-muted-foreground text-sm">→ 아이디어 입력 & 문서 생성</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
            <LayoutDashboard className="h-5 w-5 text-blue-500" />
            <span className="font-medium">대시보드에서 확인</span>
            <span className="text-muted-foreground text-sm">→ 문서 보기 & 다운로드</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">4</div>
            <Palette className="h-5 w-5 text-purple-500" />
            <span className="font-medium">디자인 추출 (선택)</span>
            <span className="text-muted-foreground text-sm">→ 참고 디자인 분석</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">5</div>
            <Bot className="h-5 w-5 text-cyan-500" />
            <span className="font-medium">AI 도구에 활용</span>
            <span className="text-muted-foreground text-sm">→ Claude Code, Cursor 등</span>
          </div>
        </div>
      </div>

      {/* VibeDocs 메뉴 설명 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          VibeDocs 메뉴 알아보기
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                워크플로우
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                단계별 가이드를 따라 프로젝트를 진행할 수 있어요
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-green-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                새 프로젝트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                아이디어를 입력하고 문서를 자동 생성해요
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-blue-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                대시보드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                생성된 문서를 보고 관리할 수 있어요
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-purple-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-500" />
                디자인 추출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                웹사이트/이미지에서 디자인 스펙을 추출해요
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-amber-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                가이드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                지금 보고 있는 페이지! 사용법을 안내해요
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step 1: AI 공급업체 설정 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-500" />
          Step 1: AI 공급업체 설정하기
        </h3>
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <p className="text-amber-700 dark:text-amber-400 flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            API 키가 있어야 문서 생성이 가능해요!
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground">
            VibeDocs는 여러분이 선택한 AI 서비스를 이용해 문서를 만들어요.
            헤더 오른쪽의 <Badge variant="outline" className="mx-1">⚙️ 설정</Badge> 버튼을 클릭하세요.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Google Gemini */}
            <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">✨</div>
                <div>
                  <p className="font-bold">Google Gemini</p>
                  <Badge className="bg-green-500 text-white text-xs">추천 - 무료</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                무료로 시작하기 좋아요! 빠르고 정확한 결과를 제공해요.
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>• gemini-2.5-flash <Star className="inline h-3 w-3 text-amber-500" /></p>
                <p>• gemini-1.5-flash</p>
                <p>• gemini-1.5-pro</p>
              </div>
            </div>

            {/* OpenAI */}
            <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <p className="font-bold">OpenAI</p>
                  <Badge className="bg-orange-500 text-white text-xs">유료</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                ChatGPT로 유명한 OpenAI의 최신 모델들이에요.
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>• gpt-4o <Star className="inline h-3 w-3 text-amber-500" /></p>
                <p>• gpt-4o-mini</p>
                <p>• gpt-3.5-turbo</p>
              </div>
            </div>

            {/* Anthropic Claude */}
            <div className="p-4 rounded-xl border-2 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🧠</div>
                <div>
                  <p className="font-bold">Anthropic Claude</p>
                  <Badge className="bg-orange-500 text-white text-xs">유료</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                긴 문서 작성에 탁월한 성능을 보여줘요.
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>• claude-sonnet-4 <Star className="inline h-3 w-3 text-amber-500" /></p>
                <p>• claude-3-5-haiku</p>
                <p>• claude-opus-4</p>
              </div>
            </div>
          </div>
        </div>

        {/* API 키 발급 방법 */}
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <p className="font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            API 키는 어떻게 받나요?
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">API 키</strong>는 AI 서비스를 이용하기 위한
              &quot;비밀번호&quot; 같은 거예요. 각 서비스 사이트에서 무료로 발급받을 수 있어요.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline"
              >
                Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground">|</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                OpenAI Platform <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground">|</span>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
              >
                Anthropic Console <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: 새 프로젝트 생성 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-500" />
          Step 2: 새 프로젝트 만들기
        </h3>

        <div className="grid gap-4">
          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold">프로젝트 이름 입력</p>
              <p className="text-sm text-muted-foreground mt-1">
                만들고 싶은 앱의 이름을 정해주세요. 예: &quot;나의 할일 관리 앱&quot;
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold">앱 유형 선택</p>
              <p className="text-sm text-muted-foreground mt-1">
                <Badge variant="outline" className="mr-1">🌐 웹앱</Badge>
                <Badge variant="outline" className="mr-1">📱 모바일앱</Badge>
                <Badge variant="outline">🌐📱 둘 다</Badge>
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold">아이디어 설명</p>
              <p className="text-sm text-muted-foreground mt-1">
                어떤 앱을 만들고 싶은지 자유롭게 설명해주세요.
                더 자세할수록 더 좋은 문서가 만들어져요! ✍️
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold flex items-center gap-2">
                문서 생성하기
                <Sparkles className="h-4 w-4 text-amber-500" />
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                &quot;문서 생성&quot; 버튼을 클릭하면 AI가 10가지 문서를 자동으로 만들어요.
                약 1~2분 정도 걸릴 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: 대시보드 사용하기 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-blue-500" />
          Step 3: 대시보드에서 문서 확인하기
        </h3>

        <p className="text-muted-foreground">
          문서가 생성되면 자동으로 대시보드로 이동해요. 여기서 모든 문서를 확인할 수 있어요!
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <p className="font-semibold">문서 미리보기</p>
            </div>
            <p className="text-sm text-muted-foreground">
              각 탭을 클릭해서 생성된 문서를 바로 확인할 수 있어요
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              <p className="font-semibold">ZIP 다운로드</p>
            </div>
            <p className="text-sm text-muted-foreground">
              모든 문서를 한번에 ZIP 파일로 다운로드해요
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-purple-500" />
              <p className="font-semibold">TODO 관리</p>
            </div>
            <p className="text-sm text-muted-foreground">
              AI가 분석한 개발 할일 목록을 체크하며 관리해요
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-amber-500" />
              <p className="font-semibold">기능 확장</p>
            </div>
            <p className="text-sm text-muted-foreground">
              새 기능이 필요하면 확장 문서를 추가로 생성해요
            </p>
          </div>
        </div>
      </div>

      {/* Step 4: 디자인 추출 (선택) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Step 4: 디자인 추출하기 (선택 사항)
        </h3>

        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
          <p className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            참고하고 싶은 디자인이 있다면 이 기능을 사용해보세요!
          </p>
        </div>

        <p className="text-muted-foreground">
          마음에 드는 웹사이트나 앱 화면을 분석해서 디자인 스펙을 추출해요.
          이 정보를 AI에게 전달하면 비슷한 느낌의 앱을 만들 수 있어요.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-blue-500" />
              <p className="font-semibold">URL로 추출</p>
            </div>
            <p className="text-sm text-muted-foreground">
              웹사이트 주소를 입력하면 해당 페이지의 디자인 요소를 분석해요.
              색상, 폰트, 레이아웃 등을 추출해요.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Image className="h-5 w-5 text-green-500" alt="" />
              <p className="font-semibold">이미지로 추출</p>
            </div>
            <p className="text-sm text-muted-foreground">
              스크린샷이나 디자인 이미지를 업로드하면 시각적 요소를 분석해요.
              드리블, 핀터레스트 등의 참고 이미지도 OK!
            </p>
          </div>
        </div>
      </div>

      {/* Step 5: AI 도구에 활용하기 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan-500" />
          Step 5: AI 코딩 도구에 문서 활용하기
        </h3>

        <p className="text-muted-foreground">
          이제 생성된 문서를 AI 코딩 도구에 전달할 차례예요!
          문서를 기반으로 실제 코드를 만들어보세요.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Claude Code
              </CardTitle>
              <CardDescription>VS Code 확장 프로그램</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              터미널에서 claude 명령어로 대화하며 코드를 작성해요
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Cursor
              </CardTitle>
              <CardDescription>AI 내장 코드 에디터</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              VS Code와 비슷하지만 AI가 내장되어 있어요
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Codex CLI
              </CardTitle>
              <CardDescription>OpenAI 터미널 도구</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              터미널에서 codex 명령어로 코드를 생성해요
            </CardContent>
          </Card>
        </div>

        <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900">
          <p className="font-semibold flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-cyan-600" />
            💡 활용 팁
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 다운로드한 문서 폴더를 프로젝트에 포함시키세요</li>
            <li>• AI에게 &quot;docs 폴더의 PRD를 읽고 구현해줘&quot;라고 요청해보세요</li>
            <li>• 한 번에 모든 걸 구현하지 말고 단계별로 진행하세요</li>
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-500" />
          자주 묻는 질문 (FAQ)
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Q. 프로그래밍을 전혀 몰라도 사용할 수 있나요?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              네! VibeDocs는 코딩 지식 없이도 사용할 수 있어요.
              다만 AI 코딩 도구(Cursor 등)를 사용하려면 기본적인 컴퓨터 사용법은 알아야 해요.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              Q. 비용이 드나요?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              VibeDocs 자체는 무료예요! 다만 AI 서비스(문서 생성)에는 각 서비스의 요금 정책이 적용돼요.
              Google Gemini는 무료 티어가 있어서 처음 시작하기 좋아요.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-green-500" />
              Q. API 키는 안전한가요?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              네, API 키는 브라우저의 로컬 저장소에만 저장되고 서버로 전송되지 않아요.
              하지만 공용 컴퓨터에서는 사용 후 API 키를 삭제하는 것이 좋아요.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Q. 생성된 문서를 수정할 수 있나요?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              네! 다운로드한 마크다운(.md) 파일은 메모장이나 VS Code로 자유롭게 수정할 수 있어요.
              필요에 맞게 내용을 추가하거나 수정해서 사용하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <div className="space-y-8">
      {/* 바이브 코딩 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          바이브 코딩(Vibe Coding)이란?
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          바이브 코딩은 <strong className="text-foreground">AI와 대화하며 코드를 작성</strong>하는
          새로운 개발 방식입니다. 복잡한 프로그래밍 지식 없이도 아이디어를 실제 애플리케이션으로 만들 수 있어요!
        </p>
      </div>

      {/* 왜 바이브 코딩인가요? */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          왜 바이브 코딩인가요?
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <div className="text-2xl">🚀</div>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">낮은 진입 장벽</p>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1 leading-relaxed">
                프로그래밍 경험 없이도 바로 시작할 수 있어요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <div className="text-2xl">⚡</div>
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">빠른 프로토타이핑</p>
              <p className="text-sm text-blue-600 dark:text-blue-500 mt-1 leading-relaxed">
                아이디어를 몇 시간 내에 구현할 수 있어요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
            <div className="text-2xl">📚</div>
            <div>
              <p className="font-semibold text-purple-700 dark:text-purple-400">학습과 개발 동시에</p>
              <p className="text-sm text-purple-600 dark:text-purple-500 mt-1 leading-relaxed">
                AI가 코드를 설명해주며 자연스럽게 배워요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
            <div className="text-2xl">🔄</div>
            <div>
              <p className="font-semibold text-orange-700 dark:text-orange-400">반복적 개선</p>
              <p className="text-sm text-orange-600 dark:text-orange-500 mt-1 leading-relaxed">
                대화를 통해 점진적으로 완성도를 높여요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VibeDocs의 역할 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          VibeDocs가 해주는 일
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          VibeDocs는 바이브 코딩을 시작할 때 필요한 <strong className="text-foreground">모든 문서를 자동으로 생성</strong>해줍니다.
          아이디어만 입력하면 다음 문서들이 자동으로 만들어져요:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { emoji: '💡', name: 'IDEA_BRIEF.md', desc: '아이디어 개요서' },
            { emoji: '👥', name: 'USER_STORIES.md', desc: '사용자 스토리' },
            { emoji: '🗺️', name: 'SCREEN_FLOW.md', desc: '화면 흐름도' },
            { emoji: '🛠️', name: 'TECH_STACK.md', desc: '기술 스택' },
            { emoji: '🗄️', name: 'DATA_MODEL.md', desc: '데이터 모델' },
            { emoji: '🔌', name: 'API_SPEC.md', desc: 'API 명세서' },
            { emoji: '✅', name: 'TODO_MASTER.md', desc: '개발 태스크 목록' },
            { emoji: '📦', name: '+ 3개 문서', desc: 'PRD, 테스트, 프롬프트' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <span className="text-xl">{doc.emoji}</span>
              <div>
                <p className="font-mono text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시작하기 */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20">
        <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Rocket className="h-5 w-5 text-primary" />
          🎯 시작하기 4단계
        </h4>
        <div className="space-y-4">
          {[
            { step: 1, icon: '📝', title: 'VibeDocs에서 새 프로젝트 생성', desc: '아이디어를 입력하면 10개 문서가 자동 생성!' },
            { step: 2, icon: '📤', title: '생성된 문서를 AI 도구에 전달', desc: 'Claude Code, Codex, Cursor 중 선택하여 문서 전달' },
            { step: 3, icon: '🔨', title: 'TODO를 하나씩 완료하며 개발', desc: '대시보드에서 진행도를 확인하며 개발' },
            { step: 4, icon: '🚀', title: '완성된 앱 배포', desc: 'Vercel, Netlify 등으로 손쉽게 배포' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {item.step}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsSection() {
  return (
    <div className="space-y-8">
      {/* 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          VibeDocs 문서 활용법
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          VibeDocs가 생성하는 <strong className="text-foreground">10개의 문서</strong>는
          AI 코딩 도구와 함께 사용할 때 최대 효과를 발휘해요.
          각 문서의 목적과 사용법을 알아볼까요?
        </p>
      </div>

      {/* 권장 순서 */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-900">
        <h4 className="font-semibold flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400">
          <List className="h-5 w-5" />
          📋 권장 문서 사용 순서
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { step: '1단계', icon: '📖', text: 'IDEA_BRIEF로 AI에게 프로젝트 맥락 전달' },
            { step: '2단계', icon: '✅', text: 'TODO_MASTER에서 구현할 작업 선택' },
            { step: '3단계', icon: '📎', text: '작업에 필요한 관련 문서 함께 제공' },
            { step: '4단계', icon: '🤖', text: 'AI에게 구현 요청 후 결과 검토' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <span className="text-xl">{item.icon}</span>
              <div>
                <Badge variant="secondary" className="text-xs">{item.step}</Badge>
                <p className="text-sm mt-1 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 핵심 문서 5개 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">📄 핵심 문서 5개</h4>

        {[
          {
            emoji: '💡',
            name: 'IDEA_BRIEF.md',
            title: '아이디어 개요서',
            desc: 'AI와 첫 대화 시 가장 먼저 전달하세요. 프로젝트의 목적, 대상 사용자, 핵심 기능을 AI가 이해해요.',
          },
          {
            emoji: '🛠️',
            name: 'TECH_STACK.md',
            title: '기술 스택',
            desc: '프로젝트 초기 설정 시 사용해요. AI가 어떤 기술로 코드를 작성해야 하는지 알 수 있어요.',
          },
          {
            emoji: '🗄️',
            name: 'DATA_MODEL.md',
            title: '데이터 모델',
            desc: 'TypeScript 타입 정의 시 사용해요. 타입 에러를 줄이고 일관된 데이터 구조를 유지해요.',
          },
          {
            emoji: '🔌',
            name: 'API_SPEC.md',
            title: 'API 명세서',
            desc: 'API 구현 시 사용해요. 프론트엔드와 백엔드가 동일한 인터페이스로 개발할 수 있어요.',
          },
          {
            emoji: '✅',
            name: 'TODO_MASTER.md',
            title: '개발 태스크',
            desc: '다음 작업을 선택할 때 사용해요. Phase별로 순서대로 완료하면 앱이 완성돼요!',
          },
        ].map((doc, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow">
            <span className="text-3xl">{doc.emoji}</span>
            <div>
              <p className="font-mono font-semibold">{doc.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{doc.title}</p>
              <p className="text-sm mt-2 leading-relaxed">{doc.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 실전 예시 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-900">
        <h4 className="font-semibold flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-400">
          <Lightbulb className="h-5 w-5" />
          💡 실전 예시: 로그인 기능 구현하기
        </h4>
        <div className="space-y-3">
          {[
            { step: '1단계', icon: '📖', text: 'IDEA_BRIEF.md 전달 → AI가 프로젝트 맥락 이해' },
            { step: '2단계', icon: '✅', text: 'TODO_MASTER.md에서 "로그인 기능 구현" 선택' },
            { step: '3단계', icon: '📎', text: 'DATA_MODEL.md (User 타입) + API_SPEC.md (로그인 API) 함께 전달' },
            { step: '4단계', icon: '🤖', text: '"위 문서들을 참고하여 로그인 기능을 구현해주세요"' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <span className="text-xl">{item.icon}</span>
              <div>
                <Badge className="mb-1 bg-amber-500">{item.step}</Badge>
                <p className="text-sm leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VSCodeSection() {
  return (
    <div className="space-y-8">
      {/* 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          VS Code란?
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          VS Code(Visual Studio Code)는 Microsoft에서 만든 <strong className="text-foreground">무료 코드 편집기</strong>에요.
          전 세계 개발자들이 가장 많이 사용하는 도구이며, 다양한 확장 기능으로 AI 코딩 도구를 사용할 수 있어요!
        </p>
      </div>

      {/* 왜 VS Code인가? */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
          <Lightbulb className="h-5 w-5" />
          💡 왜 VS Code를 사용하나요?
        </h4>
        <ul className="space-y-2">
          {[
            '✅ 완전 무료! 기업/개인 모두 무료로 사용 가능',
            '✅ Claude Code, OpenAI Codex 등 AI 도구 연동 가능',
            '✅ 수천 개의 확장 기능으로 기능 확장',
            '✅ Windows, Mac, Linux 모두 지원',
          ].map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">{item}</li>
          ))}
        </ul>
      </div>

      {/* 설치 단계 */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          📥 VS Code 설치하기 (처음부터 차근차근!)
        </h4>

        {/* Step 1 */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
            <div>
              <p className="font-semibold">VS Code 다운로드 페이지 접속</p>
              <p className="text-sm text-muted-foreground">공식 홈페이지에서 다운로드해요</p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm leading-relaxed">
              🌐 웹 브라우저(Chrome, Edge 등)를 열고 주소창에 입력하세요:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
              <span>https://code.visualstudio.com</span>
              <a href="https://code.visualstudio.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                바로가기 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
            <div>
              <p className="font-semibold">운영체제에 맞는 버전 다운로드</p>
              <p className="text-sm text-muted-foreground">자동으로 운영체제를 인식해요</p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm leading-relaxed">
              페이지에 접속하면 <strong>&quot;Download for Windows&quot;</strong> 또는 <strong>&quot;Download for Mac&quot;</strong> 버튼이 보여요.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-background rounded-lg border">
                <span className="text-2xl">🪟</span>
                <span className="text-sm">Windows: .exe 파일 다운로드</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-background rounded-lg border">
                <span className="text-2xl">🍎</span>
                <span className="text-sm">Mac: .dmg 파일 다운로드</span>
              </div>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 큰 파란색 버튼을 클릭하면 자동으로 다운로드가 시작돼요!
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
            <div>
              <p className="font-semibold">설치 파일 실행</p>
              <p className="text-sm text-muted-foreground">다운로드한 파일을 실행해요</p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">🪟 Windows:</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal list-inside leading-relaxed">
                <li>다운로드 폴더에서 <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">VSCodeUserSetup-xxx.exe</code> 더블클릭</li>
                <li>&quot;다음&quot; 버튼을 계속 클릭 (기본 설정 그대로 OK!)</li>
                <li>&quot;설치&quot; 클릭 후 완료될 때까지 기다리기</li>
              </ol>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">🍎 Mac:</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal list-inside leading-relaxed">
                <li>다운로드 폴더에서 <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">VSCode-darwin.dmg</code> 더블클릭</li>
                <li>열린 창에서 VS Code 아이콘을 Applications 폴더로 드래그</li>
                <li>Launchpad에서 Visual Studio Code 실행</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
            <div>
              <p className="font-semibold">VS Code 첫 실행</p>
              <p className="text-sm text-muted-foreground">설치 완료! 이제 시작해볼까요?</p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm leading-relaxed">
              🎉 VS Code가 실행되면 &quot;Welcome&quot; 탭이 나타나요.
            </p>
            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
                ✅ 이제 VS Code 설치가 완료되었어요! 다음 단계에서 Claude Code나 OpenAI Codex를 설치해볼까요?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 한글 설정 */}
      <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
          <Settings className="h-5 w-5" />
          🇰🇷 VS Code 한글로 바꾸기 (선택사항)
        </h4>
        <ol className="space-y-2 text-sm leading-relaxed">
          <li>1. VS Code 왼쪽에서 <strong>확장(Extensions)</strong> 아이콘 클릭 (네모 4개 모양)</li>
          <li>2. 검색창에 <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Korean</code> 입력</li>
          <li>3. &quot;Korean Language Pack for VS Code&quot; 찾아서 <strong>Install</strong> 클릭</li>
          <li>4. VS Code 재시작하면 한글로 바뀌어요!</li>
        </ol>
      </div>
    </div>
  );
}

function ClaudeCodeSection() {
  return (
    <div className="space-y-8">
      {/* 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Claude Code란?
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          Claude Code는 Anthropic에서 만든 <strong className="text-foreground">AI 코딩 어시스턴트</strong>에요.
          터미널(명령어 창)에서 실행되며, VS Code와 함께 사용하면 강력한 AI 코딩 환경을 만들 수 있어요!
        </p>
      </div>

      {/* 특징 */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { emoji: '🧠', title: '뛰어난 코드 이해력', desc: '프로젝트 전체 맥락을 이해해요' },
          { emoji: '💬', title: '자연스러운 대화', desc: '한국어로 편하게 대화할 수 있어요' },
          { emoji: '🔧', title: '코드 직접 수정', desc: '파일을 직접 생성/수정해줘요' },
          { emoji: '🔍', title: '코드 검색', desc: '프로젝트에서 필요한 코드를 찾아줘요' },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-muted/50">
            <span className="text-2xl">{item.emoji}</span>
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 사전 준비 */}
      <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          ⚠️ 시작하기 전 확인사항
        </h4>
        <ul className="space-y-2 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>VS Code가 설치되어 있어야 해요 (이전 단계 참고)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Node.js가 필요해요 (아래에서 설치 방법 설명)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Anthropic API 키가 필요해요 (무료 체험 가능)</span>
          </li>
        </ul>
      </div>

      {/* Node.js 설치 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-green-500" />
          📦 Step 1: Node.js 설치하기
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Node.js는 JavaScript를 실행하는 프로그램이에요. Claude Code를 설치하려면 필요해요!
        </p>

        <div className="border rounded-xl p-5 space-y-4">
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">1</span>
              <div className="space-y-2">
                <p className="font-medium">Node.js 공식 사이트 접속</p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                  <span>https://nodejs.org</span>
                  <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                    바로가기 <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">2</span>
              <div>
                <p className="font-medium">LTS 버전 다운로드 (왼쪽 버튼)</p>
                <p className="text-sm text-muted-foreground mt-1">LTS = Long Term Support, 안정적인 버전이에요</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">3</span>
              <div>
                <p className="font-medium">설치 파일 실행 → &quot;다음&quot; 계속 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">기본 설정 그대로 설치하면 돼요</p>
              </div>
            </li>
          </ol>
        </div>

        {/* 설치 확인 */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">✅ 설치 확인하기</p>
          <p className="text-sm text-muted-foreground mb-2">VS Code에서 터미널을 열고 (Ctrl + `) 다음 명령어를 입력해요:</p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
            node --version
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            v18.x.x 또는 v20.x.x 같은 버전이 나오면 성공!
          </p>
        </div>
      </div>

      {/* Claude Code 설치 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          🤖 Step 2: Claude Code 설치하기
        </h4>

        <div className="border rounded-xl p-5 space-y-4">
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
              <div className="space-y-2 flex-1">
                <p className="font-medium">VS Code에서 터미널 열기</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Keyboard className="h-4 w-4" />
                  <span>단축키: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Ctrl + `</code> (백틱, 숫자 1 왼쪽 키)</span>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
              <div className="space-y-2 flex-1">
                <p className="font-medium">Claude Code 설치 명령어 입력</p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
                  npm install -g @anthropic-ai/claude-code
                </div>
                <p className="text-xs text-muted-foreground">잠시 기다리면 설치가 완료돼요</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">3</span>
              <div className="space-y-2 flex-1">
                <p className="font-medium">API 키 설정</p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm space-y-1">
                  <p className="text-green-400"># Windows</p>
                  <p>set ANTHROPIC_API_KEY=your-api-key-here</p>
                  <p className="text-green-400 mt-2"># Mac/Linux</p>
                  <p>export ANTHROPIC_API_KEY=your-api-key-here</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  API 키는 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com</a>에서 발급받을 수 있어요
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* 사용법 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          💬 Step 3: Claude Code 사용하기
        </h4>

        <div className="space-y-4">
          {/* 시작하기 */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="font-medium flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Claude Code 시작하기
            </p>
            <p className="text-sm text-muted-foreground">프로젝트 폴더에서 터미널을 열고:</p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
              claude
            </div>
            <p className="text-sm text-muted-foreground">
              이제 AI와 대화하며 코딩을 시작할 수 있어요!
            </p>
          </div>

          {/* 예시 대화 */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="font-medium">📝 예시: VibeDocs 문서로 개발 시작하기</p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm leading-loose space-y-3">
              <p className="text-gray-400"># Claude Code에서 이렇게 말해보세요:</p>
              <p className="text-green-400">&gt; 안녕하세요! 다음 프로젝트를 개발하려고 합니다.</p>
              <p className="text-green-400">&gt; IDEA_BRIEF.md 파일을 읽고 프로젝트 구조를 잡아주세요.</p>
              <p className="text-gray-400 mt-4"># Claude가 파일을 읽고 프로젝트 구조를 제안해줘요!</p>
            </div>
          </div>

          {/* 유용한 명령어 */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="font-medium">⌨️ 유용한 명령어</p>
            <div className="grid gap-2">
              {[
                { cmd: '/help', desc: '도움말 보기' },
                { cmd: '/clear', desc: '대화 내용 지우기' },
                { cmd: '/cost', desc: '사용한 토큰/비용 확인' },
                { cmd: 'Ctrl + C', desc: 'Claude Code 종료' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-sm font-mono">{item.cmd}</code>
                  <span className="text-sm">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 팁 */}
      <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-2xl border border-green-200 dark:border-green-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-700 dark:text-green-400">
          <Lightbulb className="h-5 w-5" />
          💡 Claude Code 활용 팁
        </h4>
        <ul className="space-y-2 text-sm leading-relaxed">
          <li>✅ VibeDocs 문서를 프로젝트 폴더에 저장하고 &quot;IDEA_BRIEF.md를 읽어줘&quot;라고 요청하세요</li>
          <li>✅ TODO_MASTER.md에서 한 번에 하나의 TODO만 요청하세요</li>
          <li>✅ 에러가 나면 에러 메시지를 그대로 붙여넣고 &quot;이 에러를 해결해줘&quot;라고 요청하세요</li>
          <li>✅ 코드가 마음에 안 들면 &quot;다르게 해줘&quot; 또는 &quot;더 간단하게 해줘&quot;라고 말하세요</li>
        </ul>
      </div>
    </div>
  );
}

function CodexSection() {
  return (
    <div className="space-y-8">
      {/* 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          OpenAI Codex CLI란?
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          OpenAI Codex CLI는 OpenAI에서 만든 <strong className="text-foreground">터미널 기반 AI 코딩 도구</strong>에요.
          GPT-4 모델을 사용하여 코드를 생성하고, VS Code와 함께 사용할 수 있어요!
        </p>
      </div>

      {/* 특징 */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { emoji: '🚀', title: 'GPT-4 기반', desc: '최신 AI 모델로 정확한 코드 생성' },
          { emoji: '🔄', title: '자동 수정', desc: '코드를 직접 파일에 적용해줘요' },
          { emoji: '🛡️', title: '안전 모드', desc: '위험한 명령어 실행 전 확인' },
          { emoji: '📁', title: '프로젝트 이해', desc: '전체 코드베이스를 분석해요' },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-muted/50">
            <span className="text-2xl">{item.emoji}</span>
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 사전 준비 */}
      <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          ⚠️ 시작하기 전 확인사항
        </h4>
        <ul className="space-y-2 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>VS Code가 설치되어 있어야 해요</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Node.js v22 이상이 필요해요</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>OpenAI API 키가 필요해요</span>
          </li>
        </ul>
      </div>

      {/* 설치 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          📥 OpenAI Codex CLI 설치하기
        </h4>

        <div className="border rounded-xl p-5 space-y-4">
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
              <div className="space-y-2 flex-1">
                <p className="font-medium">VS Code 터미널 열기</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Keyboard className="h-4 w-4" />
                  <span>단축키: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Ctrl + `</code></span>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
              <div className="space-y-2 flex-1">
                <p className="font-medium">Codex CLI 설치</p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
                  npm install -g @openai/codex
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">3</span>
              <div className="space-y-2 flex-1">
                <p className="font-medium">API 키 설정</p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm space-y-1">
                  <p className="text-green-400"># Windows</p>
                  <p>set OPENAI_API_KEY=your-api-key-here</p>
                  <p className="text-green-400 mt-2"># Mac/Linux</p>
                  <p>export OPENAI_API_KEY=your-api-key-here</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  API 키는 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a>에서 발급받을 수 있어요
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* 사용법 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          💬 Codex CLI 사용하기
        </h4>

        <div className="space-y-4">
          {/* 시작하기 */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="font-medium flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Codex 시작하기
            </p>
            <p className="text-sm text-muted-foreground">프로젝트 폴더에서:</p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
              codex
            </div>
            <p className="text-sm text-muted-foreground">
              또는 바로 질문하기:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
              codex &quot;로그인 폼 컴포넌트를 만들어줘&quot;
            </div>
          </div>

          {/* 실행 모드 */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="font-medium">🔒 실행 모드 설명</p>
            <div className="grid gap-3">
              {[
                { mode: 'suggest', emoji: '💡', desc: '코드 제안만 해요 (가장 안전)' },
                { mode: 'auto-edit', emoji: '✏️', desc: '파일 수정을 자동으로 해요' },
                { mode: 'full-auto', emoji: '🚀', desc: '명령어까지 자동 실행 (주의!)' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <code className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-sm">--{item.mode}</code>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm">
              codex --approval-mode suggest &quot;React 컴포넌트 만들어줘&quot;
            </div>
          </div>

          {/* VibeDocs 활용 */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="font-medium">📄 VibeDocs 문서와 함께 사용하기</p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm leading-loose space-y-2">
              <p className="text-gray-400"># 프로젝트 맥락 전달</p>
              <p className="text-green-400">codex &quot;IDEA_BRIEF.md를 읽고 프로젝트 구조를 잡아줘&quot;</p>
              <p className="text-gray-400 mt-3"># TODO 구현 요청</p>
              <p className="text-green-400">codex &quot;TODO_MASTER.md의 첫 번째 태스크를 구현해줘&quot;</p>
              <p className="text-gray-400 mt-3"># 특정 파일 참조</p>
              <p className="text-green-400">codex &quot;DATA_MODEL.md의 User 타입에 맞게 로그인 API 만들어줘&quot;</p>
            </div>
          </div>
        </div>
      </div>

      {/* 팁 */}
      <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-2xl border border-green-200 dark:border-green-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-700 dark:text-green-400">
          <Lightbulb className="h-5 w-5" />
          💡 Codex CLI 활용 팁
        </h4>
        <ul className="space-y-2 text-sm leading-relaxed">
          <li>✅ 처음에는 <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">--approval-mode suggest</code>로 시작하세요</li>
          <li>✅ 익숙해지면 <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">auto-edit</code>로 생산성을 높이세요</li>
          <li>✅ VibeDocs 문서 파일명을 정확히 말하면 더 정확한 결과를 얻어요</li>
          <li>✅ &quot;테스트 코드도 함께 만들어줘&quot;라고 추가하면 테스트도 생성해줘요</li>
        </ul>
      </div>
    </div>
  );
}

function CursorSection() {
  return (
    <div className="space-y-8">
      {/* 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MousePointer className="h-5 w-5 text-primary" />
          Cursor란?
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          Cursor는 <strong className="text-foreground">AI가 처음부터 내장된 코드 에디터</strong>에요.
          VS Code와 거의 똑같이 생겼지만, AI 기능이 기본으로 들어있어서 별도 설정 없이 바로 AI 코딩을 시작할 수 있어요!
        </p>
      </div>

      {/* VS Code vs Cursor */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
          <Lightbulb className="h-5 w-5" />
          🤔 VS Code vs Cursor, 뭘 써야 할까요?
        </h4>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-white dark:bg-background rounded-lg border">
            <p className="font-semibold mb-2">💻 VS Code + AI 도구</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 이미 VS Code를 쓰고 있다면</li>
              <li>• API 키를 직접 관리하고 싶다면</li>
              <li>• 여러 AI 도구를 비교하고 싶다면</li>
            </ul>
          </div>
          <div className="p-4 bg-white dark:bg-background rounded-lg border">
            <p className="font-semibold mb-2">🖱️ Cursor</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 처음 시작하는 초보자라면</li>
              <li>• 설정 없이 바로 쓰고 싶다면</li>
              <li>• 올인원 솔루션을 원한다면</li>
            </ul>
          </div>
        </div>
        <p className="text-sm mt-4 text-blue-600 dark:text-blue-400">
          💡 둘 다 좋은 선택이에요! 편한 걸로 시작하세요.
        </p>
      </div>

      {/* 설치 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          📥 Cursor 설치하기
        </h4>

        <div className="border rounded-xl p-5 space-y-4">
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">1</span>
              <div className="space-y-2">
                <p className="font-medium">Cursor 공식 사이트 접속</p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                  <span>https://cursor.so</span>
                  <a href="https://cursor.so" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                    바로가기 <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">2</span>
              <div>
                <p className="font-medium">&quot;Download&quot; 버튼 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">운영체제에 맞는 버전이 자동으로 다운로드돼요</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">3</span>
              <div>
                <p className="font-medium">설치 파일 실행</p>
                <p className="text-sm text-muted-foreground mt-1">VS Code와 똑같이 &quot;다음&quot; 버튼만 계속 클릭하면 끝!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">4</span>
              <div>
                <p className="font-medium">계정 생성 (무료)</p>
                <p className="text-sm text-muted-foreground mt-1">이메일 또는 GitHub 계정으로 로그인하면 바로 사용 가능!</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* 주요 기능 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          ⚡ Cursor 핵심 기능 3가지
        </h4>

        <div className="space-y-4">
          {/* Cmd+K */}
          <div className="border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">Cmd+K</Badge>
              <span className="font-semibold">코드 생성/수정 (가장 많이 쓰는 기능!)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              코드를 선택하고 Cmd+K (Windows: Ctrl+K)를 누르면 AI에게 수정을 요청할 수 있어요.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">🎯 사용 예시:</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal list-inside leading-relaxed">
                <li>수정하고 싶은 코드를 마우스로 드래그해서 선택</li>
                <li>Cmd+K (또는 Ctrl+K) 누르기</li>
                <li>&quot;이 함수를 async로 바꿔줘&quot; 입력</li>
                <li>Enter 누르면 AI가 코드를 수정해줘요!</li>
              </ol>
            </div>
          </div>

          {/* Cmd+L */}
          <div className="border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">Cmd+L</Badge>
              <span className="font-semibold">AI 채팅</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              오른쪽에 채팅창이 열려요. VibeDocs 문서를 붙여넣고 AI와 대화하며 개발하세요!
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">🎯 사용 예시:</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal list-inside leading-relaxed">
                <li>Cmd+L로 채팅창 열기</li>
                <li>IDEA_BRIEF.md 내용 복사해서 붙여넣기</li>
                <li>&quot;이 프로젝트의 폴더 구조를 만들어줘&quot; 입력</li>
                <li>AI가 구조를 제안해줘요!</li>
              </ol>
            </div>
          </div>

          {/* Tab */}
          <div className="border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">Tab</Badge>
              <span className="font-semibold">자동완성</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              코드를 작성하다 보면 AI가 다음에 올 코드를 회색으로 미리 보여줘요. Tab을 누르면 적용!
            </p>
            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
                💡 자동완성이 마음에 안 들면 그냥 계속 타이핑하세요. 무시됩니다!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VibeDocs와 함께 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          📂 VibeDocs 문서와 함께 사용하기
        </h4>

        <div className="border rounded-xl p-5 space-y-4">
          <ol className="space-y-4">
            {[
              { num: 1, icon: '📁', text: '프로젝트 폴더에 VIBEDOCS 폴더 만들기' },
              { num: 2, icon: '💾', text: 'VibeDocs에서 다운로드한 문서들을 VIBEDOCS 폴더에 저장' },
              { num: 3, icon: '💬', text: 'Cursor 채팅(Cmd+L)에서 @를 입력하면 파일을 참조할 수 있어요' },
              { num: 4, icon: '📎', text: '@VIBEDOCS/IDEA_BRIEF.md 이렇게 입력하면 문서를 읽어요' },
            ].map((item) => (
              <li key={item.num} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-sm">
                  {item.num}
                </div>
                <span className="text-lg">{item.icon}</span>
                <span className="leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm leading-loose">
          <p className="text-gray-400"># Cursor 채팅에서 이렇게 입력하세요:</p>
          <p className="mt-2 text-green-400">@VIBEDOCS/IDEA_BRIEF.md 를 읽고</p>
          <p className="text-green-400">@VIBEDOCS/TODO_MASTER.md 의 Phase 1을 구현해줘</p>
        </div>
      </div>

      {/* 팁 */}
      <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-2xl border border-green-200 dark:border-green-900">
        <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-700 dark:text-green-400">
          <Lightbulb className="h-5 w-5" />
          💡 Cursor 활용 팁
        </h4>
        <ul className="space-y-2 text-sm leading-relaxed">
          <li>✅ @ 기호로 파일을 참조하면 AI가 그 파일 내용을 알고 답해요</li>
          <li>✅ 여러 파일을 동시에 참조할 수 있어요 (@file1 @file2)</li>
          <li>✅ &quot;전체 프로젝트를 이해하고&quot;라고 하면 모든 파일을 분석해요</li>
          <li>✅ 무료 버전도 하루 일정 횟수까지 사용 가능해요</li>
        </ul>
      </div>
    </div>
  );
}

function TipsSection() {
  return (
    <div className="space-y-8">
      {/* 소개 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          효과적인 프롬프트 작성법
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          AI와의 소통에서 가장 중요한 것은 <strong className="text-foreground">명확한 요청</strong>이에요.
          다음 팁들을 참고해서 더 좋은 결과를 얻어보세요!
        </p>
      </div>

      {/* 팁 1: 컨텍스트 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
          📝 컨텍스트 제공하기
        </h4>
        <div className="grid gap-4">
          <div className="p-4 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <Badge variant="destructive" className="mb-3">❌ 나쁜 예</Badge>
            <p className="font-mono text-sm">로그인 기능 만들어줘</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
            <Badge className="mb-3 bg-green-600">✅ 좋은 예</Badge>
            <p className="text-sm leading-loose">
              Next.js 14 프로젝트에 이메일/비밀번호 로그인 기능을 추가하려고 합니다.<br />
              NextAuth.js를 사용하고, 로그인 폼은 shadcn/ui 컴포넌트로 만들어주세요.<br />
              DATA_MODEL.md의 User 타입을 참고해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 팁 2: 단계별 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
          📊 단계별 요청하기
        </h4>
        <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <p className="text-sm leading-relaxed mb-3">
            큰 기능은 <strong>작은 단위로 나눠서</strong> 요청하세요.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">Phase 1</Badge>
            <ArrowRight className="h-4 w-4" />
            <Badge variant="outline">Phase 2</Badge>
            <ArrowRight className="h-4 w-4" />
            <Badge variant="outline">Phase 3</Badge>
            <ArrowRight className="h-4 w-4" />
            <Badge className="bg-green-500">완성!</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 VibeDocs의 TODO가 이미 단계별로 나눠져 있어요!
          </p>
        </div>
      </div>

      {/* 팁 3: 예시 제공 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
          💡 예시 제공하기
        </h4>
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm leading-loose">
          <p className="text-green-400">{`// 구체적인 예시와 함께 요청`}</p>
          <p className="mt-3">카드 컴포넌트를 만들어주세요.</p>
          <p className="mt-3 text-cyan-400">예시:</p>
          <p className="text-yellow-300">• 이미지, 제목, 설명, 가격 표시</p>
          <p className="text-yellow-300">• 호버 시 그림자 효과</p>
          <p className="text-yellow-300">• 클릭 시 상세 페이지로 이동</p>
        </div>
      </div>

      {/* 팁 4: 출력 형식 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">4</span>
          📋 출력 형식 지정하기
        </h4>
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm leading-loose">
          <p className="text-green-400">{`// 원하는 형식을 명확히`}</p>
          <p className="mt-3 text-yellow-300">TypeScript 인터페이스로 작성해주세요.</p>
          <p className="text-yellow-300">주석도 추가해주세요.</p>
          <p className="text-yellow-300">파일 경로: src/types/user.ts</p>
        </div>
      </div>

      {/* 팁 5: 피드백 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">5</span>
          🔄 피드백 주기
        </h4>
        <div className="grid gap-3">
          {[
            { icon: '🎯', text: '원하는 결과가 아니면 구체적으로 수정 요청' },
            { icon: '✅', text: '잘 된 부분은 "이 부분은 유지하고..."로 명시' },
            { icon: '🐛', text: '에러가 나면 에러 메시지를 그대로 붙여넣기' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm leading-relaxed pt-0.5">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 핵심 원칙 */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          ⭐ 핵심 원칙
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '🎯', title: '명확하게', desc: '무엇을 원하는지 구체적으로' },
            { icon: '📖', title: '맥락과 함께', desc: '프로젝트 상황 설명' },
            { icon: '📦', title: '작게 나눠서', desc: '한 번에 하나씩' },
            { icon: '🔄', title: '반복하며', desc: '점진적으로 개선' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GitHubSection() {
  return (
    <div className="space-y-8">
      {/* GitHub 소개 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-gray-900/10 to-purple-500/10 border border-gray-500/20 dark:from-gray-800/30 dark:to-purple-900/30">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐙</div>
          <div>
            <p className="font-semibold text-lg">GitHub - 코드의 안전한 집!</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              GitHub는 여러분이 만든 코드를 <strong className="text-foreground">인터넷에 안전하게 저장</strong>하는 곳이에요.
              마치 구글 드라이브처럼, 코드 파일들을 백업하고 관리할 수 있답니다!
            </p>
          </div>
        </div>
      </div>

      {/* 왜 필요한가요? */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-500" />
          왜 GitHub가 필요한가요?
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <CloudUpload className="h-6 w-6 text-blue-500 shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">☁️ 클라우드 백업</p>
              <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                컴퓨터가 고장나도 코드는 안전해요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <History className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">⏰ 버전 관리</p>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                실수해도 이전 상태로 돌아갈 수 있어요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
            <Users className="h-6 w-6 text-purple-500 shrink-0" />
            <div>
              <p className="font-semibold text-purple-700 dark:text-purple-400">👥 협업</p>
              <p className="text-sm text-purple-600 dark:text-purple-500 mt-1">
                다른 사람과 함께 작업할 수 있어요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <Globe className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">🌐 어디서나 접근</p>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                집, 회사 어디서든 코드에 접근해요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 용어 설명 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          알아두면 좋은 용어
        </h3>
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Git</Badge>
            <p className="text-sm text-muted-foreground">
              코드의 변경 내역을 기록하는 <strong className="text-foreground">버전 관리 프로그램</strong>이에요.
              컴퓨터에 설치해서 사용해요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">GitHub</Badge>
            <p className="text-sm text-muted-foreground">
              Git으로 관리하는 코드를 <strong className="text-foreground">인터넷에 저장</strong>하는 서비스예요.
              웹사이트(github.com)에서 사용해요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Repository (저장소)</Badge>
            <p className="text-sm text-muted-foreground">
              하나의 프로젝트를 담는 <strong className="text-foreground">폴더</strong> 같은 거예요.
              줄여서 &quot;repo(레포)&quot;라고 불러요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Commit (커밋)</Badge>
            <p className="text-sm text-muted-foreground">
              코드 변경사항을 <strong className="text-foreground">저장</strong>하는 거예요.
              게임의 &quot;세이브 포인트&quot;와 비슷해요!
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Push (푸시)</Badge>
            <p className="text-sm text-muted-foreground">
              내 컴퓨터의 코드를 <strong className="text-foreground">GitHub에 업로드</strong>하는 거예요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Pull (풀)</Badge>
            <p className="text-sm text-muted-foreground">
              GitHub의 코드를 <strong className="text-foreground">내 컴퓨터로 다운로드</strong>하는 거예요.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: 계정 만들기 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
          GitHub 계정 만들기
        </h3>
        <div className="grid gap-3">
          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold">GitHub 웹사이트 방문</p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
              >
                github.com 바로가기 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold">&quot;Sign up&quot; 버튼 클릭</p>
              <p className="text-sm text-muted-foreground mt-1">
                오른쪽 상단의 초록색 버튼이에요
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold">이메일, 비밀번호, 사용자명 입력</p>
              <p className="text-sm text-muted-foreground mt-1">
                사용자명(username)은 영문으로 짧고 기억하기 쉽게!
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold">이메일 인증 완료</p>
              <p className="text-sm text-muted-foreground mt-1">
                받은 이메일에서 인증 링크를 클릭하면 끝!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Git 설치 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
          Git 설치하기
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Windows */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Windows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="https://git-scm.com/download/win"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Git 다운로드 <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs text-muted-foreground">
                다운로드 후 &quot;Next&quot;만 계속 클릭해서 설치하세요
              </p>
            </CardContent>
          </Card>

          {/* Mac */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Mac
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">터미널에서 실행:</p>
              <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono">
                xcode-select --install
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <p className="text-green-700 dark:text-green-400 flex items-center gap-2 text-sm">
            <Check className="h-4 w-4" />
            <span><strong>설치 확인:</strong> 터미널/명령 프롬프트에서 <code className="bg-green-100 dark:bg-green-900 px-1 rounded">git --version</code> 입력</span>
          </p>
        </div>
      </div>

      {/* Step 3: VS Code에서 사용하기 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
          VS Code에서 GitHub 사용하기
        </h3>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <p className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>명령어를 외울 필요 없어요! VS Code에서 <strong>버튼 클릭</strong>으로 다 할 수 있어요.</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* GitHub 로그인 */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <p className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              GitHub 계정 연결하기
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. VS Code 왼쪽 하단의 <strong className="text-foreground">👤 사람 아이콘</strong> 클릭</p>
              <p>2. &quot;Sign in to GitHub&quot; 선택</p>
              <p>3. 브라우저가 열리면 &quot;Authorize&quot; 클릭</p>
              <p>4. 완료! 이제 VS Code와 GitHub가 연결됐어요 ✅</p>
            </div>
          </div>

          {/* 저장소 만들기 */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <p className="font-semibold flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-green-500" />
              새 저장소(Repository) 만들기
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. VS Code에서 프로젝트 폴더 열기</p>
              <p>2. 왼쪽 사이드바에서 <strong className="text-foreground">Source Control (가지 모양 아이콘)</strong> 클릭</p>
              <p>3. &quot;Initialize Repository&quot; 버튼 클릭</p>
              <p>4. &quot;Publish to GitHub&quot; 버튼 클릭</p>
              <p>5. Public(공개) 또는 Private(비공개) 선택</p>
              <p>6. 완료! GitHub에 저장소가 생겼어요 🎉</p>
            </div>
          </div>

          {/* 변경사항 저장 */}
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <p className="font-semibold flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-purple-500" />
              코드 변경사항 저장하기 (Commit & Push)
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. 코드를 수정/추가하면 파일명 옆에 <strong className="text-foreground">M</strong> 또는 <strong className="text-foreground">U</strong> 표시가 나타나요</p>
              <p>2. Source Control 탭으로 이동</p>
              <p>3. 변경된 파일들 옆의 <strong className="text-foreground">+</strong> 버튼 클릭 (Stage Changes)</p>
              <p>4. 상단 입력창에 <strong className="text-foreground">변경 내용 설명</strong> 작성 (예: &quot;로그인 기능 추가&quot;)</p>
              <p>5. <strong className="text-foreground">✓ Commit</strong> 버튼 클릭</p>
              <p>6. <strong className="text-foreground">Sync Changes</strong> 또는 <strong className="text-foreground">Push</strong> 버튼 클릭</p>
              <p>7. GitHub에 업로드 완료! ☁️</p>
            </div>
          </div>
        </div>
      </div>

      {/* 기본 명령어 (참고용) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="h-5 w-5 text-gray-500" />
          참고: Git 명령어 (터미널용)
        </h3>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border">
          <p className="text-sm text-muted-foreground mb-3">
            VS Code GUI로도 충분하지만, 터미널 명령어를 알아두면 더 빠르게 작업할 수 있어요!
          </p>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-start gap-3">
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">git init</code>
              <span className="text-muted-foreground text-xs">새 저장소 시작</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">git add .</code>
              <span className="text-muted-foreground text-xs">모든 변경 파일 선택</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">git commit -m &quot;메시지&quot;</code>
              <span className="text-muted-foreground text-xs">변경사항 저장</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">git push</code>
              <span className="text-muted-foreground text-xs">GitHub에 업로드</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">git pull</code>
              <span className="text-muted-foreground text-xs">GitHub에서 다운로드</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">git status</code>
              <span className="text-muted-foreground text-xs">현재 상태 확인</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-500" />
          자주 묻는 질문
        </h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Q. Git과 GitHub는 다른 건가요?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              네! <strong>Git</strong>은 내 컴퓨터에서 코드 변경을 관리하는 프로그램이고,
              <strong>GitHub</strong>는 그 코드를 인터넷에 저장하는 웹 서비스예요.
              Git은 도구, GitHub는 저장소라고 생각하면 돼요.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Q. Public과 Private 저장소의 차이는?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Public</strong>: 누구나 볼 수 있어요 (오픈소스 프로젝트에 적합)<br/>
              <strong>Private</strong>: 나만 볼 수 있어요 (개인 프로젝트, 회사 코드에 적합)
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Q. 실수로 잘못된 코드를 push했어요!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              걱정 마세요! Git은 모든 변경 기록을 저장하기 때문에
              이전 버전으로 돌아갈 수 있어요. VS Code의 Source Control에서
              &quot;Timeline&quot;을 확인하거나, GitHub 웹사이트에서 이전 커밋을 볼 수 있어요.
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <p className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Q. .gitignore 파일은 뭔가요?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              GitHub에 올리면 안 되는 파일들을 적어두는 목록이에요.
              예: API 키가 들어있는 <code className="bg-muted px-1 rounded">.env</code> 파일,
              <code className="bg-muted px-1 rounded">node_modules</code> 폴더 등
            </p>
          </div>
        </div>
      </div>

      {/* 마무리 팁 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-900">
        <p className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
          <Lightbulb className="h-4 w-4" />
          💡 꿀팁
        </p>
        <ul className="text-sm text-green-600 dark:text-green-500 space-y-1">
          <li>• 작업할 때마다 <strong>자주 커밋</strong>하세요 (하루에 여러 번!)</li>
          <li>• 커밋 메시지는 <strong>무엇을 했는지</strong> 알 수 있게 적어요</li>
          <li>• 퇴근/잠자기 전에 <strong>push</strong>하는 습관을 들이세요</li>
          <li>• 처음엔 어려워도 며칠만 사용하면 자연스러워져요! 💪</li>
        </ul>
      </div>
    </div>
  );
}

function SupabaseSection() {
  return (
    <div className="space-y-8">
      {/* Supabase 소개 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 dark:from-emerald-900/30 dark:to-green-900/30">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🗄️</div>
          <div>
            <p className="font-semibold text-lg">Supabase - 쉽고 강력한 클라우드 데이터베이스!</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              Supabase는 <strong className="text-foreground">PostgreSQL 기반의 클라우드 데이터베이스</strong> 서비스예요.
              Firebase의 오픈소스 대안으로, 무료로 시작할 수 있고 사용하기 정말 쉬워요!
            </p>
          </div>
        </div>
      </div>

      {/* 왜 필요한가요? */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          왜 데이터베이스가 필요한가요?
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
            <Database className="h-6 w-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">💾 데이터 저장</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                회원 정보, 게시글 등 데이터를 안전하게 보관해요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <Lock className="h-6 w-6 text-blue-500 shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">🔐 인증 시스템</p>
              <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                로그인/회원가입 기능을 쉽게 구현해요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
            <Zap className="h-6 w-6 text-purple-500 shrink-0" />
            <div>
              <p className="font-semibold text-purple-700 dark:text-purple-400">⚡ 실시간 기능</p>
              <p className="text-sm text-purple-600 dark:text-purple-500 mt-1">
                채팅, 알림 같은 실시간 기능을 구현해요
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <Coins className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">🆓 무료 시작</p>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                개인 프로젝트는 무료로 충분해요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 용어 설명 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          알아두면 좋은 용어
        </h3>
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">데이터베이스</Badge>
            <p className="text-sm text-muted-foreground">
              데이터를 체계적으로 저장하는 <strong className="text-foreground">디지털 창고</strong>예요.
              엑셀 시트처럼 데이터를 행과 열로 정리해요.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">테이블 (Table)</Badge>
            <p className="text-sm text-muted-foreground">
              데이터를 담는 <strong className="text-foreground">표</strong>예요.
              예: 회원 테이블, 상품 테이블, 주문 테이블
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Row (행)</Badge>
            <p className="text-sm text-muted-foreground">
              테이블의 <strong className="text-foreground">한 줄 데이터</strong>예요.
              예: 회원 테이블의 &quot;홍길동&quot; 회원 정보 1줄
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">Column (열)</Badge>
            <p className="text-sm text-muted-foreground">
              데이터의 <strong className="text-foreground">속성/항목</strong>이에요.
              예: 이름, 이메일, 가입일
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 mt-0.5">API Key</Badge>
            <p className="text-sm text-muted-foreground">
              내 데이터베이스에 접근하기 위한 <strong className="text-foreground">비밀 열쇠</strong>예요.
              절대 다른 사람에게 공유하면 안 돼요!
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: 계정 만들기 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-bold">1</div>
          Supabase 계정 만들기
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">supabase.com 접속</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
                    supabase.com <ExternalLink className="h-3 w-3" />
                  </a> 에 접속해주세요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">&quot;Start your project&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  초록색 버튼을 클릭해서 시작해요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">GitHub로 로그인</p>
                <p className="text-sm text-muted-foreground mt-1">
                  GitHub 계정으로 로그인하면 편해요 (없다면 이메일로 가입)
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                💡 <strong>Tip:</strong> GitHub 계정이 있으면 한 번의 클릭으로 가입 완료!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 2: 프로젝트 생성 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-bold">2</div>
          새 프로젝트 만들기
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">&quot;New Project&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  대시보드에서 새 프로젝트 버튼을 클릭해요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">프로젝트 정보 입력</p>
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  <p>• <strong>Name:</strong> 프로젝트 이름 (예: my-todo-app)</p>
                  <p>• <strong>Database Password:</strong> 비밀번호 설정 (메모해두세요!)</p>
                  <p>• <strong>Region:</strong> Northeast Asia (Seoul) 선택 🇰🇷</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">&quot;Create new project&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  약 1-2분 후 프로젝트가 생성돼요 ☕
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ <strong>중요:</strong> 데이터베이스 비밀번호는 안전한 곳에 메모해두세요!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 3: 테이블 만들기 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-bold">3</div>
          테이블 만들기 (Table Editor)
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">왼쪽 메뉴에서 &quot;Table Editor&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Table2 className="h-4 w-4 inline-block mr-1" />
                  테이블 아이콘을 찾아 클릭해요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">&quot;Create a new table&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  새 테이블을 만들어 볼게요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">테이블 설정</p>
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  <p>• <strong>Name:</strong> todos (테이블 이름)</p>
                  <p>• <strong>Enable RLS:</strong> 체크 (보안 설정)</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">4</div>
              <div>
                <p className="font-medium">컬럼(열) 추가하기</p>
                <div className="text-sm text-muted-foreground mt-1">
                  <p className="mb-2">&quot;Add column&quot; 버튼으로 필요한 열을 추가해요:</p>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1">
                    <p>• id (자동 생성됨) - uuid</p>
                    <p>• title - text (할 일 제목)</p>
                    <p>• is_complete - bool (완료 여부)</p>
                    <p>• created_at - timestamptz (생성일)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">5</div>
              <div>
                <p className="font-medium">&quot;Save&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  테이블이 생성되었어요! 🎉
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 4: API 키 확인 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-bold">4</div>
          API 키 확인하기
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">왼쪽 메뉴 하단 &quot;Project Settings&quot; 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Settings className="h-4 w-4 inline-block mr-1" />
                  톱니바퀴 아이콘을 찾아요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">&quot;API&quot; 메뉴 클릭</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Data API 설정 페이지로 이동해요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">필요한 정보 복사</p>
                <div className="text-sm text-muted-foreground mt-1 space-y-2">
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400">• Project URL</p>
                    <p className="text-muted-foreground">https://xxxxxx.supabase.co</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400">• anon/public key</p>
                    <p className="text-muted-foreground">eyJhbGciOiJIUzI1NiIs...</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                🔒 <strong>보안 주의:</strong> service_role key는 절대 프론트엔드 코드에 넣지 마세요!
                anon key만 사용하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 5: Next.js 연동 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-bold">5</div>
          Next.js에서 연동하기
        </h3>

        {/* 패키지 설치 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              1. 패키지 설치
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
              <code>npm install @supabase/supabase-js</code>
            </div>
          </CardContent>
        </Card>

        {/* 환경변수 설정 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              2. 환경변수 설정 (.env.local)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              프로젝트 루트에 <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> 파일을 만들고:
            </p>
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}</pre>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ <strong>.env.local</strong> 파일은 .gitignore에 포함되어 GitHub에 올라가지 않아요 (안전!)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supabase 클라이언트 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              3. Supabase 클라이언트 만들기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <code className="bg-muted px-1 py-0.5 rounded">lib/supabase.ts</code> 파일 생성:
            </p>
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{`import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* CRUD 예시 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              4. 데이터 CRUD 예시
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 조회 */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                데이터 조회 (Read)
              </p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{`// 모든 할 일 가져오기
const { data, error } = await supabase
  .from('todos')
  .select('*')

// 완료된 것만 가져오기
const { data } = await supabase
  .from('todos')
  .select('*')
  .eq('is_complete', true)`}</pre>
              </div>
            </div>

            {/* 추가 */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-500" />
                데이터 추가 (Create)
              </p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{`const { data, error } = await supabase
  .from('todos')
  .insert([
    { title: '장보기', is_complete: false }
  ])
  .select()`}</pre>
              </div>
            </div>

            {/* 수정 */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <PenTool className="h-4 w-4 text-amber-500" />
                데이터 수정 (Update)
              </p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{`const { data, error } = await supabase
  .from('todos')
  .update({ is_complete: true })
  .eq('id', '할일-id')
  .select()`}</pre>
              </div>
            </div>

            {/* 삭제 */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                데이터 삭제 (Delete)
              </p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{`const { error } = await supabase
  .from('todos')
  .delete()
  .eq('id', '할일-id')`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          자주 묻는 질문
        </h3>
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                무료 플랜으로 충분한가요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                네! 무료 플랜으로 500MB 데이터베이스, 1GB 파일 저장소, 50,000 월간 활성 사용자를 지원해요.
                개인 프로젝트나 사이드 프로젝트에 충분합니다! 😊
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                RLS (Row Level Security)가 뭔가요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                RLS는 &quot;누가 어떤 데이터에 접근할 수 있는지&quot; 규칙을 정하는 보안 기능이에요.
                예를 들어 &quot;자기가 작성한 글만 볼 수 있음&quot; 같은 규칙을 설정할 수 있어요.
                처음에는 어려우니, AI에게 &quot;RLS 정책 만들어줘&quot;라고 요청해보세요!
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CloudUpload className="h-4 w-4 text-emerald-500" />
                데이터 백업은 어떻게 하나요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Supabase가 자동으로 매일 백업해줘요! Pro 플랜부터는 Point-in-Time Recovery(특정 시점 복구)도
                지원해요. 무료 플랜에서도 수동으로 SQL 덤프를 다운로드할 수 있어요.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-500" />
                인증(로그인) 기능도 있나요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                네! Supabase Auth를 사용하면 이메일/비밀번호, Google, GitHub 등 다양한 로그인 방식을
                쉽게 구현할 수 있어요. 대시보드의 &quot;Authentication&quot; 메뉴에서 설정하세요!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 팁 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-100/50 to-green-100/50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-800">
        <p className="font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          💡 유용한 팁
        </p>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• <strong>Table Editor</strong>에서 직접 데이터를 추가/수정할 수 있어요 (엑셀처럼!)</li>
          <li>• <strong>SQL Editor</strong>에서 직접 SQL 쿼리를 실행해볼 수 있어요</li>
          <li>• <strong>Supabase 공식 문서</strong>가 잘 되어있어요 - AI에게 &quot;Supabase 사용법 알려줘&quot;라고 해보세요!</li>
          <li>• 처음에는 <strong>Table Editor GUI</strong>로 시작하고, 익숙해지면 코드로 제어해보세요</li>
          <li>• <strong>Storage</strong> 기능으로 이미지, 파일도 저장할 수 있어요! 📁</li>
        </ul>
      </div>
    </div>
  );
}
