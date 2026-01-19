import { Check, Loader2, Clock, AlertCircle, Pause } from 'lucide-react';
import type { Workflow, WorkflowStep } from '../../types';
import { mockAgents } from '../../data/mockData';

interface WorkflowVisualizerProps {
  workflow: Workflow;
}

const getStepIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Check size={16} className="text-white" />;
    case 'running':
      return <Loader2 size={16} className="text-white animate-spin" />;
    case 'pending_approval':
      return <Pause size={16} className="text-white" />;
    case 'error':
      return <AlertCircle size={16} className="text-white" />;
    default:
      return <Clock size={16} className="text-gray-400" />;
  }
};

const getStepStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 border-green-500';
    case 'running':
      return 'bg-blue-500 border-blue-500 animate-pulse-slow';
    case 'pending_approval':
      return 'bg-yellow-500 border-yellow-500';
    case 'error':
      return 'bg-red-500 border-red-500';
    default:
      return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
  }
};

const getConnectorStyle = (status: string, _nextStatus: string) => {
  if (status === 'completed') {
    return 'bg-green-500';
  }
  if (status === 'running' || status === 'pending_approval') {
    return 'bg-gradient-to-r from-green-500 to-gray-300 dark:to-gray-600';
  }
  return 'bg-gray-300 dark:bg-gray-600';
};

export function WorkflowVisualizer({ workflow }: WorkflowVisualizerProps) {
  const getAgentName = (agentId: string) => {
    const agent = mockAgents.find(a => a.id === agentId);
    return agent?.displayName.ko || agentId;
  };

  // steps가 없거나 빈 배열인 경우 처리
  if (!workflow.steps || workflow.steps.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">워크플로우 단계가 없습니다.</p>
      </div>
    );
  }

  // 단계 수에 따라 레이아웃 결정
  const totalSteps = workflow.steps.length;
  const halfPoint = Math.ceil(totalSteps / 2);
  const topRow = workflow.steps.slice(0, halfPoint);
  const bottomRow = workflow.steps.slice(halfPoint).reverse();

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
      {/* Top row: left to right */}
      <div className="flex items-center justify-between mb-8">
        {topRow.map((step, index) => (
          <div key={step.agentId} className="flex items-center">
            <StepNode
              step={step}
              agentName={getAgentName(step.agentId)}
            />
            {index < topRow.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${getConnectorStyle(step.status, topRow[index + 1]?.status)}`} />
            )}
          </div>
        ))}
      </div>

      {/* Vertical connector on right (only if there's a bottom row) */}
      {bottomRow.length > 0 && (
        <div className="flex justify-end pr-12 mb-8">
          <div className={`w-0.5 h-8 ${
            topRow[topRow.length - 1]?.status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
          }`} />
        </div>
      )}

      {/* Bottom row: right to left */}
      {bottomRow.length > 0 && (
        <div className="flex items-center justify-between">
          {bottomRow.map((step, index) => (
            <div key={step.agentId} className="flex items-center">
              {index > 0 && (
                <div className={`w-16 h-0.5 mx-2 ${getConnectorStyle(bottomRow[index - 1]?.status, step.status)}`} />
              )}
              <StepNode
                step={step}
                agentName={getAgentName(step.agentId)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StepNodeProps {
  step: WorkflowStep;
  agentName: string;
}

function StepNode({ step, agentName }: StepNodeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepStyle(step.status)}`}>
        {getStepIcon(step.status)}
      </div>
      <span className={`mt-2 text-sm font-medium text-center ${
        step.status === 'completed'
          ? 'text-green-600 dark:text-green-400'
          : step.status === 'running'
          ? 'text-blue-600 dark:text-blue-400'
          : step.status === 'pending_approval'
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {agentName}
      </span>
    </div>
  );
}
