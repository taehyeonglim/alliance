import type { IAgent } from '../../core/interfaces/agent.interface.js';
import type { WorkflowType, WorkflowContext, WorkflowResult, WorkflowConfig } from '../../core/interfaces/workflow.interface.js';
import { BaseWorkflow } from './BaseWorkflow.js';
/**
 * Loop workflow - executes agents iteratively until termination
 * Pattern: Repeat (Agent A -> Agent B) until condition or max iterations
 *
 * Compatible with Google ADK LoopAgent pattern
 */
export declare class LoopWorkflow extends BaseWorkflow {
    readonly type: WorkflowType;
    /** Termination condition function */
    private terminationCondition?;
    constructor(id: string, name: string, agents: IAgent[], config?: Partial<WorkflowConfig>, terminationCondition?: (context: WorkflowContext, iteration: number) => boolean);
    execute(context: WorkflowContext): Promise<WorkflowResult>;
    private createIterationContext;
    /**
     * Set termination condition
     */
    setTerminationCondition(condition: (context: WorkflowContext, iteration: number) => boolean): void;
}
//# sourceMappingURL=LoopWorkflow.d.ts.map