// Agent Types
export type AgentStatus = 'idle' | 'running' | 'pending_approval' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  displayName: {
    en: string;
    ko: string;
  };
  description: string;
  status: AgentStatus;
  outputKey?: string;
  requiresApproval: boolean;
  lastRunAt?: string;
  currentTask?: string;
}

// Workflow Types
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'pending_approval' | 'error';
export type WorkflowType = 'sequential' | 'parallel' | 'loop' | 'hybrid';

export interface WorkflowStep {
  agentId: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  output?: unknown;
}

export interface Workflow {
  id: string;
  name: string;
  type: WorkflowType;
  status: WorkflowStatus;
  progress: number;
  currentAgent?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  researchTopic?: string;
  description?: string;
  results?: Record<string, string>;
  error?: string;
  // 휴지통 관련 필드
  deletedAt?: string;           // 삭제 시간 (soft delete)
  permanentDeleteAt?: string;   // 영구 삭제 예정 시간 (30일 후)
}

// Approval Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'modified';
export type ApprovalPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Approval {
  id: string;
  workflowId: string;
  workflowName: string;
  agentId: string;
  agentName: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  output: unknown;
  outputPreview: string;
  createdAt: string;
  feedback?: string;
}

// Session Types
export interface SessionState {
  research_idea?: string;
  literature_results?: unknown;
  experiment_design?: unknown;
  analysis_results?: unknown;
  paper_draft?: string;
  final_document?: string;
  [key: string]: unknown;
}

export interface Session {
  id: string;
  workflowId: string;
  state: SessionState;
  createdAt: string;
  updatedAt: string;
}

// Log Types
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  agentId?: string;
  workflowId?: string;
  message: string;
  details?: unknown;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  labelKo: string;
  path: string;
  icon: string;
  badge?: number;
}
