import type { IAgent } from '../core/interfaces/agent.interface.js';
import type { IWorkflow, WorkflowResult } from '../core/interfaces/workflow.interface.js';
import type { ILogger } from '../core/interfaces/tool.interface.js';
import type { WorkflowDefinition, ExecutionOptions } from '../core/types/workflow.types.js';
import type { HITLInterface } from '../core/types/agent.types.js';
import type { IStateManager } from '../core/interfaces/state.interface.js';
/**
 * Agent registry interface
 */
export interface IAgentRegistry {
    get(id: string): IAgent | undefined;
    getAll(): IAgent[];
}
/**
 * Main workflow orchestration engine
 * Supports hybrid workflows combining sequential, parallel, and loop patterns
 */
export declare class WorkflowEngine {
    private stateManager;
    private agentRegistry;
    private hitl;
    private logger;
    private activeWorkflows;
    constructor(stateManager: IStateManager, agentRegistry: IAgentRegistry, hitl: HITLInterface, logger: ILogger);
    /**
     * Create and execute a workflow from configuration
     */
    executeWorkflow(workflowConfig: WorkflowDefinition, input: unknown, options?: ExecutionOptions): Promise<WorkflowResult>;
    /**
     * Build workflow from definition (supports hybrid/nested workflows)
     */
    private buildWorkflow;
    /**
     * Resolve agent references to actual agents
     */
    private resolveAgents;
    /**
     * Create a wrapper agent for nested workflows
     */
    private createWorkflowAgentWrapper;
    /**
     * Create execution context
     */
    private createContext;
    /**
     * Get default research workflow definition
     */
    getDefaultResearchWorkflow(): WorkflowDefinition;
    /**
     * Get active workflows
     */
    getActiveWorkflows(): IWorkflow[];
    /**
     * Cancel a running workflow
     */
    cancelWorkflow(workflowId: string): boolean;
}
//# sourceMappingURL=WorkflowEngine.d.ts.map