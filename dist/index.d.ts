/**
 * Alliance - AI Co-scientist Multi-Agent System
 * 연구의 전체 사이클을 관장하는 AI 공동연구자
 */
export type { IAgent, IWorkflowAgent, Skill, AgentLifecycleHooks, HumanResponse, ISessionState, SerializedState, IStatePersistenceAdapter, IStateManager, IWorkflow, WorkflowType, WorkflowContext, WorkflowConfig, WorkflowResult, WorkflowMetrics, ValidationResult, ApprovalRequest, ITool, ToolExecutionContext, IToolRegistry, ILogger, } from './core/interfaces/index.js';
export type { AgentContext, AgentResult, AgentConfig, ResearchStage, WorkflowDefinition, ExecutionOptions, } from './core/types/index.js';
export { AgentConfigSchema, RESEARCH_STAGES, StateKeys, WorkflowDefinitionSchema, } from './core/types/index.js';
export { BaseAgent } from './core/base/index.js';
export { StateManager, MemoryPersistenceAdapter } from './state/index.js';
export { WorkflowEngine, SequentialWorkflow, ParallelWorkflow, LoopWorkflow, } from './orchestration/index.js';
export type { IAgentRegistry } from './orchestration/index.js';
export { InterventionManager, ConsoleInterventionHandler, ApprovalGate, DEFAULT_RESEARCH_GATES, } from './human-in-loop/index.js';
export type { InterventionHandler, GateConfig } from './human-in-loop/index.js';
export { ConfigLoader, ConfigValidationError } from './config/index.js';
export { AgentRegistry, IdeaBuildingAgent, createIdeaBuildingAgent, LiteratureSearchAgent, createLiteratureSearchAgent, ExperimentDesignAgent, createExperimentDesignAgent, DataAnalysisAgent, createDataAnalysisAgent, PaperWritingAgent, createPaperWritingAgent, FormattingReviewAgent, createFormattingReviewAgent, } from './agents/index.js';
export type { AgentFactory } from './agents/index.js';
export { ConsoleLogger, SilentLogger, createLogger } from './utils/index.js';
export type { LogLevel, LoggerConfig } from './utils/index.js';
import { StateManager } from './state/index.js';
import { WorkflowEngine } from './orchestration/index.js';
import { InterventionManager } from './human-in-loop/index.js';
import { ConfigLoader } from './config/index.js';
import { AgentRegistry } from './agents/index.js';
import type { WorkflowResult } from './core/interfaces/index.js';
import type { ExecutionOptions } from './core/types/index.js';
/**
 * Alliance configuration
 */
export interface AllianceConfig {
    configDir?: string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    autoApprove?: boolean;
}
/**
 * Main Alliance class - entry point for the AI Co-scientist system
 */
export declare class Alliance {
    private stateManager;
    private agentRegistry;
    private interventionManager;
    private configLoader;
    private workflowEngine;
    private logger;
    private initialized;
    constructor(config?: AllianceConfig);
    /**
     * Initialize the Alliance system
     */
    initialize(): Promise<void>;
    /**
     * Run the default research workflow
     */
    runResearchWorkflow(researchTopic: string, options?: ExecutionOptions): Promise<WorkflowResult>;
    /**
     * Run a custom workflow
     */
    runWorkflow(workflowId: string, input: unknown, options?: ExecutionOptions): Promise<WorkflowResult>;
    /**
     * Get the agent registry
     */
    getAgentRegistry(): AgentRegistry;
    /**
     * Get the state manager
     */
    getStateManager(): StateManager;
    /**
     * Get the intervention manager
     */
    getInterventionManager(): InterventionManager;
    /**
     * Get the config loader
     */
    getConfigLoader(): ConfigLoader;
    /**
     * Get the workflow engine
     */
    getWorkflowEngine(): WorkflowEngine;
}
export default Alliance;
//# sourceMappingURL=index.d.ts.map