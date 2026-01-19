import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { mockAgents } from '../data/mockData';
import {
  Lightbulb,
  BookOpen,
  FlaskConical,
  BarChart3,
  FileText,
  FileCheck,
  CheckCircle,
  Clock,
} from 'lucide-react';

const agentIcons: Record<string, React.ReactNode> = {
  'idea-building': <Lightbulb size={24} />,
  'literature-search': <BookOpen size={24} />,
  'experiment-design': <FlaskConical size={24} />,
  'data-analysis': <BarChart3 size={24} />,
  'paper-writing': <FileText size={24} />,
  'formatting-review': <FileCheck size={24} />,
};

const agentColors: Record<string, string> = {
  'idea-building': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  'literature-search': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  'experiment-design': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  'data-analysis': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  'paper-writing': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  'formatting-review': 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
};

export function Agents() {
  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return '실행 기록 없음';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div>
      <Header title="에이전트" subtitle="AI 연구 에이전트 관리" />

      <div className="p-6">
        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAgents.map((agent) => (
            <Card key={agent.id} hover className="group">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${agentColors[agent.id]}`}>
                  {agentIcons[agent.id]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {agent.displayName.ko}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {agent.id}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {agent.description}
              </p>

              {/* Status & Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <StatusBadge status={agent.status} />
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {agent.requiresApproval && (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-yellow-500" />
                      승인 필요
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatLastRun(agent.lastRunAt)}
                  </span>
                </div>
              </div>

              {/* Current Task (if running) */}
              {agent.status === 'running' && agent.currentTask && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                  <span className="animate-pulse-slow">● </span>
                  {agent.currentTask}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Agent Pipeline Overview */}
        <Card className="mt-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            에이전트 파이프라인
          </h3>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {mockAgents.map((agent, index) => (
              <div key={agent.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${agentColors[agent.id]}`}>
                    {agentIcons[agent.id]}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 text-center whitespace-nowrap">
                    {agent.displayName.ko}
                  </span>
                  {agent.requiresApproval && (
                    <span className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                      승인
                    </span>
                  )}
                </div>
                {index < mockAgents.length - 1 && (
                  <div className="w-12 h-0.5 mx-2 bg-gray-300 dark:bg-gray-600" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
