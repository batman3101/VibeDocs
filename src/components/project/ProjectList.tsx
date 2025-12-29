'use client';

import { useState } from 'react';
import { LayoutGrid, List, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit2, Copy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types';

type ViewMode = 'card' | 'table';

interface ProjectListProps {
  projects: Project[];
  currentProjectId?: string;
  onSelect: (id: string) => void;
  onEdit: (id: string, updates: { name?: string; description?: string }) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCreateNew?: () => void;
}

export function ProjectList({
  projects,
  currentProjectId,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateNew,
}: ProjectListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleEditClick = (project: Project) => {
    setEditTarget(project);
    setEditName(project.name);
    setEditDescription(project.description);
  };

  const handleEditSave = () => {
    if (editTarget) {
      onEdit(editTarget.id, { name: editName, description: editDescription });
      setEditTarget(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (project: Project) => {
    const { percentage } = project.progress;
    if (percentage === 100) {
      return <Badge variant="default" className="bg-green-500">완료</Badge>;
    }
    if (percentage > 0) {
      return <Badge variant="secondary">진행중</Badge>;
    }
    return <Badge variant="outline">대기</Badge>;
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h3>
        <p className="text-muted-foreground mb-6">
          새 프로젝트를 생성하여 시작하세요
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            새 프로젝트 만들기
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {projects.length}개의 프로젝트
        </p>
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Toggle
            pressed={viewMode === 'card'}
            onPressedChange={() => setViewMode('card')}
            size="sm"
            aria-label="카드 뷰"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === 'table'}
            onPressedChange={() => setViewMode('table')}
            size="sm"
            aria-label="테이블 뷰"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isCurrentProject={project.id === currentProjectId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">프로젝트명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>진행률</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="w-[80px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className={`cursor-pointer ${
                    project.id === currentProjectId ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => onSelect(project.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{project.name}</span>
                      {project.id === currentProjectId && (
                        <Badge variant="outline" className="text-xs">현재</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                      {project.description}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(project)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={project.progress.percentage} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground w-10">
                        {project.progress.percentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(project.id); }}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          열기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(project); }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(project.id); }}>
                          <Copy className="h-4 w-4 mr-2" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Dialog (for table view) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.name}&quot; 프로젝트를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog (for table view) */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 편집</DialogTitle>
            <DialogDescription>
              프로젝트 이름과 설명을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">프로젝트 이름</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              취소
            </Button>
            <Button onClick={handleEditSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
