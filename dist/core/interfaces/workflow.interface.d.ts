import type { IAgent } from './agent.interface.js';
import type { HumanResponse } from './agent.interface.js';
import type { AgentResult, AgentContext } from '../types/agent.types.js';
import type { ResearchStage } from '../types/workflow.types.js';
/**
 * Workflow type enumeration
 */
export type WorkflowType = 'sequential' | 'parallel' | 'loop' | 'conditional' | 'hybrid';
/**
 * Workflow execution interface
 */
export interface IWorkflow {
    /** Unique workflow identifier */
    readonly id: string;
    /** Workflow name */
    readonly name: string;
    /** Execution pattern type */
    readonly type: WorkflowType;
    /** Agents in this workflow */
    readonly agents: IAgent[];
    /** Execute the workflow */
    execute(context: WorkflowContext): Promise<WorkflowResult>;
    /** Validate workflow configuration */
    validate(): ValidationResult;
}
/**
 * Workflow execution context
 */
export interface WorkflowContext extends AgentContext {
    /** Workflow-level configuration */
    workflowConfig: WorkflowConfig;
    /** Previous stage results (for sequential) */
    previousResults: Map<string, AgentResult>;
    /** Parallel branch results (for fan-out/gather) */
    branchResults: Map<string, AgentResult>;
}
/**
 * Workflow configuration
 */
export interface WorkflowConfig {
    /** Maximum iterations for loop workflows */
    maxIterations?: number;
    /** Timeout for entire workflow (ms) */
    timeout?: number;
    /** Whether to continue on agent failure */
    continueOnError: boolean;
    /** Human approval required stages */
    approvalGates: string[];
    /** Conditional branching rules */
    conditions?: ConditionalRule[];
}
/**
 * Conditional branching rule
 */
export interface ConditionalRule {
    /** Condition to evaluate */
    condition: (context: WorkflowContext) => boolean;
    /** Agent to execute if condition is true */
    thenAgent: string;
    /** Agent to execute if condition is false */
    elseAgent?: string;
}
/**
 * Workflow execution result
 */
export interface WorkflowResult {
    /** Overall success status */
    success: boolean;
    /** Final output from the workflow */
    output: unknown;
    /** Results from each agent */
    agentResults: Map<string, AgentResult>;
    /** Workflow execution path taken */
    executionPath: string[];
    /** Total metrics */
    metrics: WorkflowMetrics;
    /** Any human interventions that occurred */
    interventions: InterventionRecord[];
}
/**
 * Workflow execution metrics
 */
export interface WorkflowMetrics {
    totalDurationMs: number;
    agentCount: number;
    successfulAgents: number;
    failedAgents: number;
    humanInterventions: number;
    totalIterations?: number;
}
/**
 * Record of a human intervention
 */
export interface InterventionRecord {
    agentId: string;
    timestamp: Date;
    reason: string;
    response: HumanResponse;
}
/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Approval request for human intervention
 */
export interface ApprovalRequest {
    /** Unique request ID */
    id: string;
    /** Agent requesting approval */
    agentId: string;
    /** Stage in the workflow */
    stage: ResearchStage;
    /** What is being approved */
    type: 'proceed' | 'output' | 'modification' | 'critical_decision';
    /** Summary of what needs approval */
    summary: string;
    /** Detailed content for review */
    content: unknown;
    /** Suggested options */
    options?: ApprovalOption[];
    /** Timeout for approval (ms) */
    timeout?: number;
}
/**
 * Approval option
 */
export interface ApprovalOption {
    label: string;
    description: string;
    value: string;
}
//# sourceMappingURL=workflow.interface.d.ts.map