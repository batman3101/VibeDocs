'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  ExternalLink,
  Rocket,
  Shield,
  Settings,
  TestTube,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useWorkflowStore } from '@/stores';
import { DEPLOYMENT_PLATFORMS } from '@/constants/workflow';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  CheckCircle: <CheckCircle className="h-5 w-5" />,
  TestTube: <TestTube className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
};

export function DeployTab() {
  const {
    deploymentChecklist,
    toggleDeploymentItem,
    resetDeploymentChecklist,
  } = useWorkflowStore();

  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set([0, 1, 2])
  );

  // Calculate progress
  const totalItems = deploymentChecklist.reduce(
    (sum, category) => sum + category.items.length,
    0
  );
  const checkedItems = deploymentChecklist.reduce(
    (sum, category) => sum + category.items.filter((item) => item.checked).length,
    0
  );
  const requiredItems = deploymentChecklist.reduce(
    (sum, category) => sum + category.items.filter((item) => item.isRequired).length,
    0
  );
  const checkedRequiredItems = deploymentChecklist.reduce(
    (sum, category) =>
      sum + category.items.filter((item) => item.isRequired && item.checked).length,
    0
  );
  const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  const isReadyToDeploy = checkedRequiredItems === requiredItems;

  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                배포 준비 현황
              </CardTitle>
              <CardDescription className="mt-1">
                배포 전 체크리스트를 완료하세요
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetDeploymentChecklist}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              초기화
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>전체 진행률</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {checkedItems}/{totalItems} 항목 완료
              </span>
              <span>
                필수: {checkedRequiredItems}/{requiredItems}
              </span>
            </div>
          </div>

          {isReadyToDeploy && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">배포 준비 완료!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                모든 필수 항목이 완료되었습니다. 아래 플랫폼 중 하나를 선택하여 배포하세요.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="space-y-3">
        {deploymentChecklist.map((category, categoryIndex) => {
          const categoryChecked = category.items.filter((item) => item.checked).length;
          const categoryTotal = category.items.length;
          const isExpanded = expandedCategories.has(categoryIndex);

          return (
            <Collapsible
              key={category.category}
              open={isExpanded}
              onOpenChange={() => toggleCategory(categoryIndex)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                          {CATEGORY_ICONS[category.icon]}
                        </div>
                        <div>
                          <CardTitle className="text-base">{category.category}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {categoryChecked}/{categoryTotal} 완료
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {categoryChecked === categoryTotal && (
                          <Badge className="bg-green-500">완료</Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                            item.checked
                              ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <Checkbox
                            id={item.id}
                            checked={item.checked}
                            onCheckedChange={() =>
                              toggleDeploymentItem(categoryIndex, item.id)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={item.id}
                                className={cn(
                                  'font-medium cursor-pointer text-sm',
                                  item.checked && 'line-through text-muted-foreground'
                                )}
                              >
                                {item.title}
                              </label>
                              {item.isRequired && (
                                <Badge variant="outline" className="text-xs">
                                  필수
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          {item.checked && (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Deployment Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>배포 플랫폼 선택</CardTitle>
          <CardDescription>
            원하는 플랫폼을 선택하여 배포를 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEPLOYMENT_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{platform.name}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      문서
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {platform.description}
                </p>
                <div className="space-y-1">
                  {platform.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
