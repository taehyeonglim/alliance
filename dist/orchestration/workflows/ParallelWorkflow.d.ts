import type { IAgent } from '../../core/interfaces/agent.interface.js';
import type { WorkflowType, WorkflowContext, WorkflowResult, WorkflowConfig } from '../../core/interfaces/workflow.interface.js';
import { BaseWorkflow } from './BaseWorkflow.js';
/**
 * Parallel workflow - executes agents concurrently
 * Pattern: Fan-out to multiple agents, then gather results
 *
 * Compatible with Google ADK ParallelAgent pattern
 */
export declare class ParallelWorkflow extends BaseWorkflow {
    readonly type: WorkflowType;
    /** Optional merger agent for result aggregation */
    private mergerAgent?;
    constructor(id: string, name: string, agents: IAgent[], config?: Partial<WorkflowConfig>, mergerAgent?: IAgent);
    execute(context: WorkflowContext): Promise<WorkflowResult>;
    private createBranchContext;
    private createMergerContext;
    private combineOutputs;
}
//# sourceMappingURL=ParallelWorkflow.d.ts.map