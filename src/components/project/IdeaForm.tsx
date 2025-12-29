'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Smartphone, Monitor, MonitorSmartphone, FolderOpen } from 'lucide-react';
import type { AppType, TemplateType } from '@/types';
import { TEMPLATES, type Template } from '@/constants/templates';

interface IdeaFormProps {
  onSubmit: (idea: string, appType: AppType, template?: TemplateType, projectName?: string) => void;
  isLoading?: boolean;
}

export function IdeaForm({ onSubmit, isLoading }: IdeaFormProps) {
  const [projectName, setProjectName] = useState('');
  const [idea, setIdea] = useState('');
  const [appType, setAppType] = useState<AppType>('web');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);

  const MIN_LENGTH = 50;
  const charCount = idea.length;
  const isValid = charCount >= MIN_LENGTH && projectName.trim().length > 0;

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    if (template.example) {
      setIdea(template.example);
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(idea, appType, selectedTemplate || undefined, projectName.trim());
  };

  return (
    <div className="space-y-8">
      {/* Project Name */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-blue-500" />
          프로젝트 이름
        </label>
        <Input
          placeholder="예: 패션몰 이커머스 앱"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          maxLength={50}
        />
        {projectName.trim().length === 0 && (
          <p className="text-xs text-muted-foreground">
            프로젝트를 식별할 수 있는 이름을 입력해주세요.
          </p>
        )}
      </div>

      {/* App Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">앱 유형</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'web', label: '웹앱', icon: Monitor },
            { value: 'mobile', label: '모바일앱', icon: Smartphone },
            { value: 'both', label: '웹 + 모바일', icon: MonitorSmartphone },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAppType(option.value as AppType)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                appType === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <option.icon className={`h-6 w-6 ${appType === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${appType === option.value ? 'text-primary' : ''}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Template Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">템플릿 선택 (선택사항)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className="text-xs">
                  {template.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Idea Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            아이디어 설명
          </label>
          <Badge variant={isValid ? 'default' : 'secondary'}>
            {charCount} / {MIN_LENGTH}자 이상
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          개발 워크플로우 페이지의 [Step 1] 아이디어 정리 항목의 체크리스트를 참고하여 최대한 원하는 사항을 기술하세요.
        </p>
        <Textarea
          placeholder="예: 패션 브랜드 의류를 판매하는 이커머스 앱. 사용자는 상품 검색, 장바구니, 결제를 할 수 있고, 관리자는 상품과 주문을 관리할 수 있다."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="min-h-[150px] resize-none"
        />
        {charCount > 0 && !isValid && (
          <p className="text-sm text-muted-foreground">
            최소 {MIN_LENGTH}자 이상 입력해주세요. (현재 {charCount}자)
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
      >
        {isLoading ? '문서 생성 중...' : '문서 생성하기'}
      </Button>
    </div>
  );
}
