'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DOCUMENT_TITLES } from '@/types';
import type { CoreDocuments } from '@/types';

interface GenerationProgressProps {
  onComplete: () => void;
}

const DOCUMENT_KEYS = Object.keys(DOCUMENT_TITLES) as (keyof CoreDocuments)[];

export function GenerationProgress({ onComplete }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const totalSteps = DOCUMENT_KEYS.length;

  useEffect(() => {
    // Simulate document generation
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800); // 각 문서당 0.8초

    return () => clearInterval(interval);
  }, [totalSteps, onComplete]);

  useEffect(() => {
    setProgress(Math.round(((currentStep + 1) / totalSteps) * 100));
  }, [currentStep, totalSteps]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold">문서 생성 중...</h2>
        <p className="text-muted-foreground">
          AI가 프로젝트에 필요한 문서를 생성하고 있습니다
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {DOCUMENT_KEYS.map((key, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : isCurrent
                  ? 'bg-primary/5 ring-1 ring-primary'
                  : 'bg-muted/50'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    isCompleted
                      ? 'text-green-700 dark:text-green-400'
                      : isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {DOCUMENT_TITLES[key]}
                </span>
              </div>
              {isCompleted && (
                <span className="text-xs text-green-600 dark:text-green-400">완료</span>
              )}
              {isCurrent && (
                <span className="text-xs text-primary">생성 중...</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
