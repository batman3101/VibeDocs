'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ListChecks,
  LayoutGrid,
  Calendar,
  Plus,
  FileText,
  Download,
  Rocket,
  FolderOpen,
  Layers,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChecklistView, KanbanView, TimelineView, ProgressAnalysisModal } from '@/components/todo';
import { DeployTab } from '@/components/dashboard';
import { ProjectList } from '@/components/project';
import { useProjectStore } from '@/stores';
import { DOCUMENT_NAMES, type CoreDocuments } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const {
    project,
    projects,
    loadProject,
    updateProjectInfo,
    deleteProject,
    duplicateProject,
  } = useProjectStore();
  const [mainTab, setMainTab] = useState<'current' | 'all'>(project ? 'current' : 'all');
  const [viewTab, setViewTab] = useState('checklist');

  const handleDownloadDocs = async () => {
    if (!project) return;

    const zip = new JSZip();
    const folder = zip.folder('VIBEDOCS');

    if (folder) {
      Object.entries(project.coreDocs).forEach(([key, content]) => {
        const filename = DOCUMENT_NAMES[key as keyof CoreDocuments];
        folder.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${project.name.slice(0, 20)}_VIBEDOCS.zip`);
      toast.success('문서가 다운로드되었습니다');
    }
  };

  const handleSelectProject = (id: string) => {
    loadProject(id);
    setMainTab('current');
    toast.success('프로젝트가 선택되었습니다');
  };

  const handleEditProject = (id: string, updates: { name?: string; description?: string }) => {
    updateProjectInfo(id, updates);
    toast.success('프로젝트가 수정되었습니다');
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    toast.success('프로젝트가 삭제되었습니다');
    if (projects.length <= 1) {
      setMainTab('all');
    }
  };

  const handleDuplicateProject = (id: string) => {
    duplicateProject(id);
    toast.success('프로젝트가 복제되었습니다');
  };

  const handleCreateNew = () => {
    router.push('/new');
  };

  // Empty state when no projects exist
  if (projects.length === 0 && !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">프로젝트가 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            새 프로젝트를 생성하여 문서와 TODO를 관리해보세요
          </p>
          <Button asChild size="lg">
            <Link href="/new">
              <Plus className="h-5 w-5 mr-2" />
              새 프로젝트 시작
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Tabs: 현재 프로젝트 / 전체 프로젝트 */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'current' | 'all')}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <TabsList className="w-fit">
            <TabsTrigger value="current" className="flex items-center gap-2" disabled={!project}>
              <FolderOpen className="h-4 w-4" />
              현재 프로젝트
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              전체 프로젝트 ({projects.length})
            </TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link href="/new">
              <Plus className="h-4 w-4 mr-2" />
              새 프로젝트
            </Link>
          </Button>
        </div>

        {/* 현재 프로젝트 탭 */}
        <TabsContent value="current" className="mt-0">
          {project ? (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold">TODO 대시보드</h1>
                  <p className="text-muted-foreground mt-1">
                    {project.name.slice(0, 50)}
                    {project.name.length > 50 && '...'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <ProgressAnalysisModal />
                  <Button variant="outline" onClick={handleDownloadDocs}>
                    <Download className="h-4 w-4 mr-2" />
                    문서 다운로드
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">전체</div>
                  <div className="text-2xl font-bold">{project.progress.total}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">완료</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {project.progress.done}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">진행중</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {project.progress.inProgress}
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                  <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">예상 잔여 시간</div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {project.progress.remainingHours}h
                  </div>
                </div>
              </div>

              {/* View Tabs */}
              <Tabs value={viewTab} onValueChange={setViewTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="checklist" className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    체크리스트
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    칸반
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    타임라인
                  </TabsTrigger>
                  <TabsTrigger value="deploy" className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    배포 준비
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="checklist">
                  <ChecklistView />
                </TabsContent>

                <TabsContent value="kanban">
                  <KanbanView />
                </TabsContent>

                <TabsContent value="timeline">
                  <TimelineView />
                </TabsContent>

                <TabsContent value="deploy">
                  <DeployTab />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                현재 선택된 프로젝트가 없습니다
              </p>
              <Button variant="outline" onClick={() => setMainTab('all')}>
                프로젝트 목록 보기
              </Button>
            </div>
          )}
        </TabsContent>

        {/* 전체 프로젝트 탭 */}
        <TabsContent value="all" className="mt-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">전체 프로젝트</h1>
            <p className="text-muted-foreground mt-1">
              모든 프로젝트를 관리하고 전환할 수 있습니다
            </p>
          </div>
          <ProjectList
            projects={projects}
            currentProjectId={project?.id}
            onSelect={handleSelectProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onDuplicate={handleDuplicateProject}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
