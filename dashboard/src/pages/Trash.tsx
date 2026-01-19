import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import {
  getTrashWorkflows,
  restoreWorkflow,
  permanentDeleteWorkflow,
  emptyTrash,
} from '../services/firestoreService';
import type { Workflow } from '../types';

export function Trash() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const loadTrash = async () => {
    setIsLoading(true);
    const data = await getTrashWorkflows();
    setWorkflows(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    const success = await restoreWorkflow(id);
    if (success) {
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    }
    setActionLoading(null);
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('이 연구를 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    setActionLoading(id);
    const success = await permanentDeleteWorkflow(id);
    if (success) {
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    }
    setActionLoading(null);
  };

  const handleEmptyTrash = async () => {
    setShowEmptyConfirm(false);
    setActionLoading('empty');
    await emptyTrash();
    setWorkflows([]);
    setActionLoading(null);
  };

  // 남은 일수 계산
  const getDaysRemaining = (permanentDeleteAt: string | undefined): number => {
    if (!permanentDeleteAt) return 30;
    const deleteDate = new Date(permanentDeleteAt);
    const now = new Date();
    const diff = deleteDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return (
      <div>
        <Header title="휴지통" subtitle="삭제된 연구 관리" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="휴지통" subtitle="삭제된 연구 관리" />

      <div className="p-6">
        {/* Info Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                휴지통 안내
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                휴지통의 항목은 삭제 후 30일이 지나면 자동으로 영구 삭제됩니다.
                복원하려면 "복원" 버튼을 클릭하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {workflows.length > 0 && (
          <div className="flex justify-end mb-4">
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowEmptyConfirm(true)}
              disabled={actionLoading === 'empty'}
            >
              {actionLoading === 'empty' ? '처리 중...' : '휴지통 비우기'}
            </Button>
          </div>
        )}

        {/* Empty Trash Confirmation Modal */}
        {showEmptyConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    휴지통 비우기
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  휴지통의 모든 항목({workflows.length}개)을 영구 삭제하시겠습니까?
                  <br />
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    이 작업은 되돌릴 수 없습니다.
                  </span>
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowEmptyConfirm(false)}>
                    취소
                  </Button>
                  <Button variant="danger" onClick={handleEmptyTrash}>
                    영구 삭제
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trash List */}
        {workflows.length > 0 ? (
          <div className="space-y-3">
            {workflows.map((workflow) => {
              const daysRemaining = getDaysRemaining(workflow.permanentDeleteAt);
              const isUrgent = daysRemaining <= 7;

              return (
                <Card key={workflow.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {workflow.name}
                        </h3>
                        <StatusBadge status={workflow.status} />
                      </div>
                      {workflow.researchTopic && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {workflow.researchTopic}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          삭제일: {workflow.deletedAt ? new Date(workflow.deletedAt).toLocaleDateString('ko-KR') : '-'}
                        </span>
                        <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-600 dark:text-red-400' : ''}`}>
                          <Clock size={12} />
                          {daysRemaining}일 후 영구 삭제
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RotateCcw size={14} />}
                        onClick={() => handleRestore(workflow.id)}
                        disabled={actionLoading === workflow.id}
                      >
                        {actionLoading === workflow.id ? '...' : '복원'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => handlePermanentDelete(workflow.id)}
                        disabled={actionLoading === workflow.id}
                      >
                        {actionLoading === workflow.id ? '...' : '삭제'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Trash2 size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              휴지통이 비어있습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              삭제된 연구가 없습니다.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
