import type { IAgent, HumanResponse } from '../../core/interfaces/agent.interface.js';
import type { IWorkflow, WorkflowType, WorkflowContext, WorkflowResult, WorkflowConfig, WorkflowMetrics, ValidationResult, InterventionRecord } from '../../core/interfaces/workflow.interface.js';
import type { AgentResult } from '../../core/types/agent.types.js';
/**
 * Abstract base workflow class
 * Provides common functionality for all workflow types
 */
export declare abstract class BaseWorkflow implements IWorkflow {
    readonly id: string;
    readonly name: string;
    abstract readonly type: WorkflowType;
    readonly agents: IAgent[];
    protected config: WorkflowConfig;
    protected interventions: InterventionRecord[];
    constructor(id: string, name: string, agents: IAgent[], config?: Partial<WorkflowConfig>);
    /**
     * Abstract execute method - implemented by subclasses
     */
    abstract execute(context: WorkflowContext): Promise<WorkflowResult>;
    /**
     * Validate workflow configuration
     */
    validate(): ValidationResult;
    /**
     * Find agent by ID
     */
    protected findAgent(agentId: string): IAgent | undefined;
    /**
     * Request human approval
     */
    protected requestApproval(context: WorkflowContext, agent: IAgent, output: unknown): Promise<HumanResponse>;
    /**
     * Create error result for failed execution
     */
    protected createErrorResult(error: unknown): AgentResult;
    /**
     * Create workflow result
     */
    protected createResult(success: boolean, agentResults: Map<string, AgentResult>, executionPath: string[], _errorMessage?: string, output?: unknown, totalIterations?: number): WorkflowResult;
    /**
     * Calculate workflow metrics
     */
    protected calculateMetrics(agentResults: Map<string, AgentResult>, totalIterations?: number): WorkflowMetrics;
}
//# sourceMappingURL=BaseWorkflow.d.ts.map