import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Loader2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { WorkflowCard } from '../components/workflow/WorkflowCard';
import { subscribeToWorkflows } from '../services/firestoreService';
import type { Workflow } from '../types';

type FilterStatus = 'all' | 'running' | 'paused' | 'completed' | 'failed';

export function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToWorkflows((data) => {
      setWorkflows(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesStatus =
      filterStatus === 'all' || workflow.status === filterStatus;
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.researchTopic?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: workflows.length,
    running: workflows.filter((w) => w.status === 'running').length,
    paused: workflows.filter((w) => w.status === 'paused').length,
    completed: workflows.filter((w) => w.status === 'completed').length,
    failed: workflows.filter((w) => w.status === 'failed').length,
  };

  if (isLoading) {
    return (
      <div>
        <Header title="워크플로우" subtitle="연구 워크플로우 관리" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="워크플로우" subtitle="연구 워크플로우 관리" />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="워크플로우 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* New Workflow Button */}
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate('/new')}
          >
            새 연구
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'running', 'paused', 'completed', 'failed'] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all' && '전체'}
                {status === 'running' && '실행 중'}
                {status === 'paused' && '일시정지'}
                {status === 'completed' && '완료'}
                {status === 'failed' && '실패'}
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                  {statusCounts[status]}
                </span>
              </button>
            )
          )}
        </div>

        {/* Workflow Grid */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Filter size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              워크플로우를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery
                ? '검색 조건을 변경해 보세요'
                : '새 연구를 시작해 보세요'}
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
