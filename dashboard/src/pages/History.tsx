import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { subscribeToWorkflows } from '../services/firestoreService';
import type { Workflow } from '../types';

export function History() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToWorkflows((data) => {
      setWorkflows(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter to completed/failed workflows
  const historyWorkflows = workflows.filter(
    (w) => w.status === 'completed' || w.status === 'failed'
  );

  const filteredWorkflows = historyWorkflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.researchTopic?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60);

    if (diff < 60) return `${diff}분`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 ${diff % 60}분`;
    return `${Math.floor(diff / 1440)}일`;
  };

  if (isLoading) {
    return (
      <div>
        <Header title="실행 이력" subtitle="과거 연구 워크플로우 기록" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="실행 이력" subtitle="과거 연구 워크플로우 기록" />

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="연구 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체 기간</option>
            <option value="today">오늘</option>
            <option value="week">이번 주</option>
            <option value="month">이번 달</option>
          </select>
        </div>

        {/* History List */}
        {filteredWorkflows.length > 0 ? (
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                hover
                onClick={() => navigate(`/workflow/${workflow.id}`)}
                className="group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        workflow.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      {workflow.status === 'completed' ? (
                        <CheckCircle size={24} className="text-green-600" />
                      ) : (
                        <XCircle size={24} className="text-red-600" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {workflow.name}
                      </h3>
                      {workflow.researchTopic && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {workflow.researchTopic}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(workflow.updatedAt)}
                        </span>
                        <span>
                          소요 시간: {getDuration(workflow.createdAt, workflow.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={workflow.status as any} />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Download size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Download:', workflow.id);
                      }}
                    >
                      내보내기
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<RefreshCw size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Restart:', workflow.id);
                      }}
                    >
                      다시 실행
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Filter size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              실행 이력이 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              완료된 연구 워크플로우가 여기에 표시됩니다
            </p>
            <Button variant="primary" onClick={() => navigate('/new')}>
              새 연구 시작
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
