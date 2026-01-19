import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { subscribeToApprovals } from '../services/firestoreService';
import type { Approval } from '../types';

export function Approvals() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = subscribeToApprovals((data) => {
      const pendingApprovals = data.filter(a => a.status === 'pending');
      setApprovals(pendingApprovals);
      if (pendingApprovals.length > 0 && !expandedId) {
        setExpandedId(pendingApprovals[0].id);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = (id: string) => {
    console.log('Approved:', id, feedback[id]);
    // API call would go here
  };

  const handleReject = (id: string) => {
    console.log('Rejected:', id, feedback[id]);
    // API call would go here
  };

  const handleRequestModification = (id: string) => {
    console.log('Modification requested:', id, feedback[id]);
    // API call would go here
  };

  const formatWaitTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간`;
    return `${Math.floor(diff / 1440)}일`;
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'medium': return '보통';
      default: return '낮음';
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="승인 대기" subtitle="로딩 중..." />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="승인 대기"
        subtitle={`${approvals.length}건의 항목이 승인을 기다리고 있습니다`}
      />

      <div className="p-6">
        {approvals.length > 0 ? (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                isExpanded={expandedId === approval.id}
                onToggle={() => setExpandedId(expandedId === approval.id ? null : approval.id)}
                feedback={feedback[approval.id] || ''}
                onFeedbackChange={(value) => setFeedback({ ...feedback, [approval.id]: value })}
                onApprove={() => handleApprove(approval.id)}
                onReject={() => handleReject(approval.id)}
                onRequestModification={() => handleRequestModification(approval.id)}
                formatWaitTime={formatWaitTime}
                getPriorityStyle={getPriorityStyle}
                getPriorityLabel={getPriorityLabel}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              모든 항목이 처리되었습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              승인 대기 중인 항목이 없습니다
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              대시보드로 이동
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

interface ApprovalCardProps {
  approval: Approval;
  isExpanded: boolean;
  onToggle: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestModification: () => void;
  formatWaitTime: (date: string) => string;
  getPriorityStyle: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
}

function ApprovalCard({
  approval,
  isExpanded,
  onToggle,
  feedback,
  onFeedbackChange,
  onApprove,
  onReject,
  onRequestModification,
  formatWaitTime,
  getPriorityStyle,
  getPriorityLabel,
}: ApprovalCardProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg border ${getPriorityStyle(approval.priority)}`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {approval.agentName} 승인 필요
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(approval.priority)}`}>
                  {getPriorityLabel(approval.priority)}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {approval.workflowName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={14} />
                대기 {formatWaitTime(approval.createdAt)}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Output Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              출력 미리보기
            </h4>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {approval.outputPreview}
              </pre>
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                피드백 (선택)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                placeholder="승인/거절 사유나 수정 요청 사항을 입력하세요..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="danger"
                leftIcon={<XCircle size={18} />}
                onClick={onReject}
              >
                거절
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Edit3 size={18} />}
                onClick={onRequestModification}
              >
                수정 요청
              </Button>
              <Button
                variant="success"
                leftIcon={<CheckCircle size={18} />}
                onClick={onApprove}
              >
                승인
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
