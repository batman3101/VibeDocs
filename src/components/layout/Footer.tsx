import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
                V
              </div>
              <span className="font-semibold">VibeDocs</span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              AI 바이브 코딩을 위한 문서 자동 생성 도구
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/guide" className="hover:text-foreground transition-colors">
              사용 가이드
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with batman</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
