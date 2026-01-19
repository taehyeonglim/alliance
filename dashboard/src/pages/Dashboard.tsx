import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  GitBranch,
  CheckCircle,
  TrendingUp,
  Bot,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { WorkflowCard } from '../components/workflow/WorkflowCard';
import {
  getWorkflows,
  getApprovals,
  getStats,
  subscribeToWorkflows,
  subscribeToApprovals,
} from '../services/firestoreService';
import type { Workflow, Approval } from '../types';

export function Dashboard() {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [stats, setStats] = useState({
    activeWorkflows: 0,
    pendingApprovals: 0,
    completedToday: 0,
    totalAgents: 6,
    totalWorkflows: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 실시간 데이터 구독
  useEffect(() => {
    setIsLoading(true);

    // 초기 데이터 로드
    Promise.all([getWorkflows(), getApprovals(), getStats()])
      .then(([wf, apr, st]) => {
        setWorkflows(wf);
        setApprovals(apr);
        setStats(st);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('데이터 로드 실패:', err);
        setIsLoading(false);
      });

    // 실시간 구독
    const unsubWorkflows = subscribeToWorkflows(setWorkflows);
    const unsubApprovals = subscribeToApprovals(setApprovals);

    return () => {
      unsubWorkflows();
      unsubApprovals();
    };
  }, []);

  // stats 업데이트
  useEffect(() => {
    const today = new Date().toDateString();
    setStats({
      activeWorkflows: workflows.filter(w =>
        w.status === 'running' || w.status === 'paused' || w.status === 'pending'
      ).length,
      pendingApprovals: approvals.filter(a => a.status === 'pending').length,
      completedToday: workflows.filter(w =>
        w.status === 'completed' &&
        new Date(w.updatedAt).toDateString() === today
      ).length,
      totalAgents: 6,
      totalWorkflows: workflows.length,
    });
  }, [workflows, approvals]);

  const activeWorkflows = workflows.filter(
    (w) => w.status === 'running' || w.status === 'paused' || w.status === 'pending'
  );
  const recentCompleted = workflows.filter(
    (w) => w.status === 'completed'
  ).slice(0, 3);

  if (isLoading) {
    return (
      <div>
        <Header title="대시보드" subtitle="Alliance AI Co-Scientist" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="대시보드" subtitle="Alliance AI Co-Scientist" />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<GitBranch className="text-primary-600" />}
            label="진행 중인 연구"
            value={stats.activeWorkflows}
            trend={`총 ${stats.totalWorkflows}개 연구`}
            bgColor="bg-primary-50 dark:bg-primary-900/20"
          />
          <StatCard
            icon={<CheckCircle className="text-yellow-600" />}
            label="승인 대기"
            value={stats.pendingApprovals}
            trend={stats.pendingApprovals > 0 ? "즉시 확인 필요" : ""}
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            onClick={() => navigate('/approvals')}
          />
          <StatCard
            icon={<TrendingUp className="text-green-600" />}
            label="오늘 완료"
            value={stats.completedToday}
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            icon={<Bot className="text-purple-600" />}
            label="활성 에이전트"
            value={stats.totalAgents}
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>

        {/* Quick Start */}
        <Card className="mb-8 bg-gradient-to-r from-primary-600 to-primary-700 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">새로운 연구를 시작하세요</h2>
              <p className="text-primary-100">
                AI 에이전트들이 연구의 전체 과정을 함께합니다
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Plus size={20} />}
              onClick={() => navigate('/new')}
              className="bg-white text-primary-700 hover:bg-gray-100"
            >
              새 연구 시작
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Workflows */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>
                  전체 보기
                </Button>
              }>
                현재 진행 중
              </CardHeader>
              <CardContent>
                {activeWorkflows.length > 0 ? (
                  <div className="space-y-4">
                    {activeWorkflows.map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                    <p>진행 중인 연구가 없습니다</p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/new')}
                    >
                      새 연구 시작
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <div>
            <Card>
              <CardHeader action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/approvals')}>
                  전체 보기
                </Button>
              }>
                승인 대기 중
              </CardHeader>
              <CardContent>
                {approvals.filter(a => a.status === 'pending').length > 0 ? (
                  <div className="space-y-3">
                    {approvals.filter(a => a.status === 'pending').slice(0, 3).map((approval) => (
                      <ApprovalItem key={approval.id} approval={approval} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>승인 대기 중인 항목이 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Completed */}
            <Card className="mt-6">
              <CardHeader>최근 완료된 연구</CardHeader>
              <CardContent>
                {recentCompleted.length > 0 ? (
                  <div className="space-y-3">
                    {recentCompleted.map((workflow) => (
                      <div
                        key={workflow.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/workflow/${workflow.id}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {workflow.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(workflow.updatedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    완료된 연구가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: string;
  bgColor: string;
  onClick?: () => void;
}

function StatCard({ icon, label, value, trend, bgColor, onClick }: StatCardProps) {
  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface ApprovalItemProps {
  approval: Approval;
}

function ApprovalItem({ approval }: ApprovalItemProps) {
  const navigate = useNavigate();

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors"
      onClick={() => navigate('/approvals')}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {approval.agentName}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[approval.priority]}`}>
          {approval.priority === 'urgent' ? '긴급' : approval.priority === 'high' ? '높음' : '보통'}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {approval.workflowName}
      </p>
    </div>
  );
}
