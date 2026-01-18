import type { IAgent } from '../../core/interfaces/agent.interface.js';
import type { WorkflowType, WorkflowContext, WorkflowResult, WorkflowConfig } from '../../core/interfaces/workflow.interface.js';
import { BaseWorkflow } from './BaseWorkflow.js';
/**
 * Sequential workflow - executes agents one after another
 * Pattern: Agent A -> Agent B -> Agent C
 *
 * Compatible with Google ADK SequentialAgent pattern
 */
export declare class SequentialWorkflow extends BaseWorkflow {
    readonly type: WorkflowType;
    constructor(id: string, name: string, agents: IAgent[], config?: Partial<WorkflowConfig>);
    execute(context: WorkflowContext): Promise<WorkflowResult>;
    private createAgentContext;
}
//# sourceMappingURL=SequentialWorkflow.d.ts.map