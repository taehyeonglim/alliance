import { z } from 'zod';
import type { ISessionState } from '../interfaces/state.interface.js';
import type { ILogger } from '../interfaces/tool.interface.js';
import type { ResearchStage } from './workflow.types.js';

/**
 * Agent execution context - shared across all agents in a workflow
 */
export interface AgentContext {
  /** Current session state (shared across agents) */
  state: ISessionState;

  /** Invocation-specific context */
  invocation: InvocationContext;

  /** Abort signal for cancellation */
  signal: AbortSignal;

  /** Logger instance */
  logger: ILogger;

  /** Human-in-the-loop interface */
  hitl: HITLInterface;
}

/**
 * Invocation context - specific to current execution
 */
export interface InvocationContext {
  /** Unique invocation ID */
  invocationId: string;

  /** Parent agent ID (if sub-agent) */
  parentAgentId?: string;

  /** Branch identifier for parallel execution */
  branch?: string;

  /** Input provided to this invocation */
  input: unknown;

  /** Maximum execution time (ms) */
  timeout?: number;

  /** Iteration number (for loop workflows) */
  iteration?: number;

  /** Actions to signal workflow control */
  actions: WorkflowActions;
}

/**
 * Workflow control actions
 */
export interface WorkflowActions {
  /** Signal to exit current loop/workflow early */
  escalate: boolean;

  /** Request transfer to another agent */
  transferTo?: string;

  /** Request human intervention */
  requestIntervention: boolean;

  /** Intervention reason */
  interventionReason?: string;
}

/**
 * Agent execution result
 */
export interface AgentResult {
  /** Whether execution succeeded */
  success: boolean;

  /** Output data from the agent */
  output: unknown;

  /** Human-readable summary */
  summary: string;

  /** Error information if failed */
  error?: AgentError;

  /** Metrics about the execution */
  metrics: ExecutionMetrics;

  /** Next recommended agent (if any) */
  nextAgent?: string;

  /** Whether human review is recommended */
  requiresReview: boolean;
}

/**
 * Agent error information
 */
export interface AgentError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
}

/**
 * Execution metrics for monitoring
 */
export interface ExecutionMetrics {
  durationMs: number;
  tokensUsed?: {
    input: number;
    output: number;
  };
  toolCalls: number;
  iterations?: number;
}

/**
 * Human-in-the-loop interface
 */
export interface HITLInterface {
  /** Request human approval */
  requestApproval(request: ApprovalRequestData): Promise<HumanResponseData>;

  /** Collect feedback from human */
  collectFeedback(prompt: string, context: FeedbackContext): Promise<string>;

  /** Notify human of important events (non-blocking) */
  notify(notification: NotificationData): Promise<void>;
}

/**
 * Approval request data
 */
export interface ApprovalRequestData {
  agentId: string;
  stage: ResearchStage;
  type: 'proceed' | 'output' | 'modification' | 'critical_decision';
  summary: string;
  content: unknown;
  options?: Array<{ label: string; description: string; value: string }>;
  timeout?: number;
}

/**
 * Human response data
 */
export interface HumanResponseData {
  approved: boolean;
  feedback?: string;
  modifications?: Record<string, unknown>;
}

/**
 * Feedback context
 */
export interface FeedbackContext {
  agentId: string;
  stage: ResearchStage;
  currentOutput: unknown;
}

/**
 * Notification data
 */
export interface NotificationData {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  agentId?: string;
}

/**
 * Tool definition for agents
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: z.ZodType;
}

/**
 * Agent configuration schema (Zod for validation)
 */
export const AgentConfigSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  displayName: z.object({
    en: z.string().min(1),
    ko: z.string().min(1),
  }),
  description: z.string().min(1),
  instruction: z.string(),
  tools: z.array(z.string()).default([]),
  skills: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    enabled: z.boolean().default(true),
    config: z.record(z.unknown()).optional(),
  })).default([]),
  outputKey: z.string().optional(),
  model: z.string().optional(),
  timeout: z.number().positive().default(300000),
  maxRetries: z.number().nonnegative().default(3),
  requiresApproval: z.boolean().default(false),
  approvalCheckpoints: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  version: z.string().default('1.0.0'),
  tags: z.array(z.string()).default([]),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
