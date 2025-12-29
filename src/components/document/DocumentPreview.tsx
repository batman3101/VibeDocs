'use client';

import { useState } from 'react';
import { FileText, Download, Copy, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DOCUMENT_TITLES, DOCUMENT_NAMES, type CoreDocuments } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface DocumentPreviewProps {
  documents: CoreDocuments;
  onDownload?: (key: keyof CoreDocuments) => void;
  onDownloadAll?: () => void;
  onContinue?: () => void;
}

type DocKey = keyof CoreDocuments;
const DOCUMENT_KEYS = Object.keys(DOCUMENT_TITLES) as DocKey[];

export function DocumentPreview({
  documents,
  onDownload,
  onDownloadAll,
  onContinue,
}: DocumentPreviewProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocKey>('ideaBrief');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documents[selectedDoc]);
      setCopied(true);
      toast.success('클립보드에 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleDownload = () => {
    const content = documents[selectedDoc];
    const filename = DOCUMENT_NAMES[selectedDoc];
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} 다운로드 완료`);
    onDownload?.(selectedDoc);
  };

  return (
    <div className="space-y-4">
      {/* Document Viewer */}
      <div className="flex gap-4">
        {/* Sidebar - Document List */}
        <div className="w-64 shrink-0 border rounded-lg overflow-hidden">
          <div className="p-3 bg-muted/50 border-b">
            <h3 className="font-semibold text-sm">생성된 문서 (10개)</h3>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-2 space-y-1">
              {DOCUMENT_KEYS.map((key, index) => (
                <button
                  key={key}
                  onClick={() => setSelectedDoc(key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                    selectedDoc === key
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className={`flex items-center justify-center w-5 h-5 rounded text-xs font-medium ${
                    selectedDoc === key
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm truncate">{DOCUMENT_TITLES[key]}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content - Document Viewer */}
        <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{DOCUMENT_NAMES[selectedDoc]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    복사
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                다운로드
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-[500px] p-6">
            <div className="markdown-body max-w-none prose prose-sm dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {documents[selectedDoc]}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Action Buttons - Always visible at bottom */}
      <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg">
        <Button variant="outline" onClick={onDownloadAll}>
          <Download className="h-4 w-4 mr-2" />
          전체 다운로드 (ZIP)
        </Button>
        <Button onClick={onContinue} size="lg">
          프로젝트 저장 및 대시보드로 이동
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
