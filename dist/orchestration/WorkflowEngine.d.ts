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
     * Get workflow definition based on methodology
     * 연구방법론에 따른 워크플로우 정의 반환
     */
    getWorkflowForMethodology(methodologyId: string): WorkflowDefinition;
    /**
     * Literature Review Workflow (문헌고찰 전용 워크플로우)
     * 체계적 문헌고찰, 주제범위 문헌고찰, 메타분석 등 모든 문헌 기반 연구에 사용
     * 핵심: 실험설계(experiment-design) 단계를 건너뜀
     */
    private getLiteratureReviewWorkflow;
    /**
     * Quantitative Research Workflow
     * 양적 연구 워크플로우
     */
    private getQuantitativeWorkflow;
    /**
     * Qualitative Research Workflow
     * 질적 연구 워크플로우
     */
    private getQualitativeWorkflow;
    /**
     * Mixed Methods Research Workflow
     * 혼합 연구 워크플로우
     */
    private getMixedMethodsWorkflow;
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