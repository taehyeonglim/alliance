import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Trash2, MoreVertical } from 'lucide-react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { trashWorkflow } from '../../services/firestoreService';
import type { Workflow } from '../../types';

interface WorkflowCardProps {
  workflow: Workflow;
  onDeleted?: () => void;
}

export function WorkflowCard({ workflow, onDeleted }: WorkflowCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${workflow.name}" 연구를 휴지통으로 이동하시겠습니까?`)) {
      return;
    }
    setIsDeleting(true);
    const success = await trashWorkflow(workflow.id);
    if (success && onDeleted) {
      onDeleted();
    }
    setIsDeleting(false);
    setShowMenu(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressColor = () => {
    if (workflow.status === 'completed') return 'success';
    if (workflow.status === 'failed') return 'danger';
    if (workflow.status === 'paused') return 'warning';
    return 'primary';
  };

  return (
    <Card
      hover
      onClick={() => navigate(`/workflow/${workflow.id}`)}
      className="group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {workflow.name}
          </h3>
          {workflow.researchTopic && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {workflow.researchTopic}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={workflow.status as any} />
          {/* More Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ProgressBar
        progress={workflow.progress}
        size="sm"
        color={getProgressColor()}
        className="mb-3"
      />

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(workflow.updatedAt)}</span>
        </div>
        {workflow.currentAgent && workflow.status === 'running' && (
          <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
            <span className="animate-pulse-slow">실행 중</span>
            <ArrowRight size={14} />
          </div>
        )}
      </div>
    </Card>
  );
}
