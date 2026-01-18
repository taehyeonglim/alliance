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
    options?: Array<{
        label: string;
        description: string;
        value: string;
    }>;
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
export declare const AgentConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodObject<{
        en: z.ZodString;
        ko: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ko: string;
    }, {
        en: string;
        ko: string;
    }>;
    description: z.ZodString;
    instruction: z.ZodString;
    tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    skills: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        enabled: z.ZodDefault<z.ZodBoolean>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        enabled: boolean;
        config?: Record<string, unknown> | undefined;
    }, {
        name: string;
        description: string;
        config?: Record<string, unknown> | undefined;
        enabled?: boolean | undefined;
    }>, "many">>;
    outputKey: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    requiresApproval: z.ZodDefault<z.ZodBoolean>;
    approvalCheckpoints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    version: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    timeout: number;
    displayName: {
        en: string;
        ko: string;
    };
    description: string;
    instruction: string;
    tools: string[];
    skills: {
        name: string;
        description: string;
        enabled: boolean;
        config?: Record<string, unknown> | undefined;
    }[];
    maxRetries: number;
    requiresApproval: boolean;
    approvalCheckpoints: string[];
    dependencies: string[];
    version: string;
    tags: string[];
    outputKey?: string | undefined;
    model?: string | undefined;
}, {
    id: string;
    name: string;
    displayName: {
        en: string;
        ko: string;
    };
    description: string;
    instruction: string;
    timeout?: number | undefined;
    tools?: string[] | undefined;
    skills?: {
        name: string;
        description: string;
        config?: Record<string, unknown> | undefined;
        enabled?: boolean | undefined;
    }[] | undefined;
    outputKey?: string | undefined;
    model?: string | undefined;
    maxRetries?: number | undefined;
    requiresApproval?: boolean | undefined;
    approvalCheckpoints?: string[] | undefined;
    dependencies?: string[] | undefined;
    version?: string | undefined;
    tags?: string[] | undefined;
}>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
//# sourceMappingURL=agent.types.d.ts.map