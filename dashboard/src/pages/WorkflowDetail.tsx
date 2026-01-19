import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pause,
  Play,
  StopCircle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { WorkflowVisualizer } from '../components/workflow/WorkflowVisualizer';
import {
  subscribeToWorkflow,
  subscribeToWorkflowLogs,
  restartWorkflow,
} from '../services/firestoreService';
import { mockAgents } from '../data/mockData';
import type { Workflow, LogEntry } from '../types';

export function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('0분 0초');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 실시간 워크플로우 구독
  useEffect(() => {
    if (!id) return;

    const unsubscribeWorkflow = subscribeToWorkflow(id, (wf) => {
      setWorkflow(wf);
      setIsLoading(false);
    });

    const unsubscribeLogs = subscribeToWorkflowLogs(id, (logData) => {
      setLogs(logData.reverse()); // 시간순 정렬
    });

    return () => {
      unsubscribeWorkflow();
      unsubscribeLogs();
    };
  }, [id]);

  // 경과 시간 업데이트 (1초마다)
  useEffect(() => {
    if (!workflow) return;

    const updateElapsedTime = () => {
      // startedAt이 있으면 실행 시작 시간부터, 없으면 생성 시간부터
      const startTime = workflow.startedAt || workflow.createdAt;
      const start = new Date(startTime);

      // 완료된 경우 completedAt까지의 시간 계산
      const end = workflow.completedAt
        ? new Date(workflow.completedAt)
        : new Date();

      // 아직 시작 안됨 (pending 상태)
      if (workflow.status === 'pending' && !workflow.startedAt) {
        setElapsedTime('대기 중');
        return;
      }

      const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
      if (diff < 0) {
        setElapsedTime('0분 0초');
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (hours > 0) {
        setElapsedTime(`${hours}시간 ${minutes}분 ${seconds}초`);
      } else {
        setElapsedTime(`${minutes}분 ${seconds}초`);
      }
    };

    updateElapsedTime();

    // 실행 중이거나 승인 대기 중일 때만 타이머 실행
    if (workflow.status === 'running' || workflow.status === 'pending_approval') {
      const interval = setInterval(updateElapsedTime, 1000);
      return () => clearInterval(interval);
    }
  }, [workflow]);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleRestart = async () => {
    if (!id) return;
    try {
      await restartWorkflow(id);
    } catch (error) {
      console.error('Failed to restart workflow:', error);
      alert('워크플로우 재시작에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="워크플로우 상세" subtitle="로딩 중..." />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div>
        <Header title="워크플로우 상세" subtitle="오류" />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <StopCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            워크플로우를 찾을 수 없습니다
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            요청하신 워크플로우가 존재하지 않거나 삭제되었습니다.
          </p>
          <Button
            variant="primary"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/workflows')}
          >
            워크플로우 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const currentAgent = mockAgents.find((a) => a.id === workflow.currentAgent);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div>
      <Header
        title={workflow.name}
        subtitle={workflow.researchTopic}
      />

      <div className="p-6">
        {/* Back & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/workflows')}
          >
            목록으로
          </Button>

          <div className="flex items-center gap-2">
            {workflow.status === 'running' && (
              <>
                <Button variant="secondary" leftIcon={<Pause size={18} />}>
                  일시정지
                </Button>
                <Button variant="danger" leftIcon={<StopCircle size={18} />}>
                  중지
                </Button>
              </>
            )}
            {(workflow.status === 'paused' || workflow.status === 'error') && (
              <Button
                variant="primary"
                leftIcon={<Play size={18} />}
                onClick={handleRestart}
              >
                재개
              </Button>
            )}
            {workflow.status === 'completed' && (
              <Button
                variant="secondary"
                leftIcon={<RefreshCw size={18} />}
                onClick={handleRestart}
              >
                다시 실행
              </Button>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">상태</p>
                <StatusBadge status={workflow.status} size="md" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">진행률</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {workflow.progress}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">경과 시간</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Clock size={16} />
                  {elapsedTime}
                </p>
              </div>
            </div>
            <ProgressBar progress={workflow.progress} size="lg" className="w-64" />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>워크플로우 진행 상황</CardHeader>
              <CardContent>
                <WorkflowVisualizer workflow={workflow} />
              </CardContent>
            </Card>

            {/* Current Agent Status */}
            {currentAgent && (workflow.status === 'running' || workflow.status === 'pending_approval') && (
              <Card className="mt-6">
                <CardHeader>
                  {workflow.status === 'pending_approval' ? '승인 대기 중' : '현재 실행 중인 에이전트'}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      workflow.status === 'pending_approval'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {workflow.status === 'pending_approval' ? (
                        <Clock size={24} className="text-yellow-600" />
                      ) : (
                        <RefreshCw size={24} className="text-blue-600 animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {currentAgent.displayName.ko}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.status === 'pending_approval'
                          ? '연구자 승인을 기다리고 있습니다'
                          : currentAgent.currentTask || currentAgent.description}
                      </p>
                    </div>
                    {workflow.status === 'pending_approval' && (
                      <Button
                        variant="primary"
                        onClick={() => navigate('/approvals')}
                      >
                        승인하러 가기
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {workflow.status === 'error' && (workflow as any).error && (
              <Card className="mt-6 border-red-200 dark:border-red-800">
                <CardHeader>오류 발생</CardHeader>
                <CardContent>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                      {(workflow as any).error}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Logs */}
          <div>
            <Card className="h-fit">
              <CardHeader
                action={
                  <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="rounded"
                    />
                    자동 스크롤
                  </label>
                }
              >
                실행 로그
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {logs.length > 0 ? logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="text-gray-400 font-mono text-xs whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </span>
                      <span
                        className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                          log.level === 'error'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : log.level === 'warn'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {log.agentId || 'system'}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">
                        {log.message}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      로그가 없습니다
                    </p>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
