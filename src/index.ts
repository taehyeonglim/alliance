/**
 * Alliance - AI Co-scientist Multi-Agent System
 * 연구의 전체 사이클을 관장하는 AI 공동연구자
 */

// Core exports
export type {
  IAgent,
  IWorkflowAgent,
  Skill,
  AgentLifecycleHooks,
  HumanResponse,
  ISessionState,
  SerializedState,
  IStatePersistenceAdapter,
  IStateManager,
  IWorkflow,
  WorkflowType,
  WorkflowContext,
  WorkflowConfig,
  WorkflowResult,
  WorkflowMetrics,
  ValidationResult,
  ApprovalRequest,
  ITool,
  ToolExecutionContext,
  IToolRegistry,
  ILogger,
} from './core/interfaces/index.js';

export type {
  AgentContext,
  AgentResult,
  AgentConfig,
  ResearchStage,
  WorkflowDefinition,
  ExecutionOptions,
} from './core/types/index.js';

export {
  AgentConfigSchema,
  RESEARCH_STAGES,
  StateKeys,
  WorkflowDefinitionSchema,
} from './core/types/index.js';

// Base classes
export { BaseAgent } from './core/base/index.js';

// State management
export { StateManager, MemoryPersistenceAdapter, FilePersistenceAdapter } from './state/index.js';

// Orchestration
export {
  WorkflowEngine,
  SequentialWorkflow,
  ParallelWorkflow,
  LoopWorkflow,
} from './orchestration/index.js';
export type { IAgentRegistry } from './orchestration/index.js';

// Human-in-the-loop
export {
  InterventionManager,
  ConsoleInterventionHandler,
  ApprovalGate,
  DEFAULT_RESEARCH_GATES,
} from './human-in-loop/index.js';
export type { InterventionHandler, GateConfig } from './human-in-loop/index.js';

// Configuration
export { ConfigLoader, ConfigValidationError } from './config/index.js';

// Agents
export {
  AgentRegistry,
  IdeaBuildingAgent,
  createIdeaBuildingAgent,
  LiteratureSearchAgent,
  createLiteratureSearchAgent,
  ExperimentDesignAgent,
  createExperimentDesignAgent,
  DataAnalysisAgent,
  createDataAnalysisAgent,
  PaperWritingAgent,
  createPaperWritingAgent,
  FormattingReviewAgent,
  createFormattingReviewAgent,
} from './agents/index.js';
export type { AgentFactory } from './agents/index.js';

// Utilities
export { ConsoleLogger, SilentLogger, createLogger } from './utils/index.js';
export type { LogLevel, LoggerConfig } from './utils/index.js';

// Main Alliance class
import { StateManager, FilePersistenceAdapter } from './state/index.js';
import { WorkflowEngine } from './orchestration/index.js';
import { InterventionManager, ConsoleInterventionHandler } from './human-in-loop/index.js';
import { ConfigLoader } from './config/index.js';
import { AgentRegistry } from './agents/index.js';
import {
  createIdeaBuildingAgent,
  createLiteratureSearchAgent,
  createExperimentDesignAgent,
  createDataAnalysisAgent,
  createPaperWritingAgent,
  createFormattingReviewAgent,
} from './agents/index.js';
import { createLogger } from './utils/index.js';
import type { WorkflowResult } from './core/interfaces/index.js';
import type { ExecutionOptions } from './core/types/index.js';
import type { ILogger } from './core/interfaces/index.js';

/**
 * Alliance configuration
 */
export interface AllianceConfig {
  configDir?: string;
  dataDir?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  autoApprove?: boolean;
  /** Use file-based persistence for multi-device Git sync (default: true) */
  persistToFile?: boolean;
}

/**
 * Main Alliance class - entry point for the AI Co-scientist system
 */
export class Alliance {
  private stateManager: StateManager;
  private agentRegistry: AgentRegistry;
  private interventionManager: InterventionManager;
  private configLoader: ConfigLoader;
  private workflowEngine: WorkflowEngine;
  private logger: ILogger;
  private initialized: boolean = false;

  constructor(config: AllianceConfig = {}) {
    this.logger = createLogger({ level: config.logLevel ?? 'info' });

    // Use file persistence by default for multi-device Git sync
    const useFilePersistence = config.persistToFile !== false;
    const adapter = useFilePersistence
      ? new FilePersistenceAdapter(config.dataDir)
      : undefined;
    this.stateManager = new StateManager(adapter);

    this.agentRegistry = new AgentRegistry();
    this.interventionManager = new InterventionManager();
    this.configLoader = new ConfigLoader(config.configDir ?? './config');

    // Set up console handler for HITL
    this.interventionManager.setHandler(new ConsoleInterventionHandler());

    if (config.autoApprove) {
      this.interventionManager.setAutoApprove(true);
    }

    this.workflowEngine = new WorkflowEngine(
      this.stateManager,
      this.agentRegistry,
      this.interventionManager,
      this.logger
    );
  }

  /**
   * Initialize the Alliance system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing Alliance...');

    // Load agent configurations
    const configs = await this.configLoader.loadAllAgents();

    // Register agent factories
    const factories: Record<string, (config: any) => any> = {
      'idea-building': createIdeaBuildingAgent,
      'literature-search': createLiteratureSearchAgent,
      'experiment-design': createExperimentDesignAgent,
      'data-analysis': createDataAnalysisAgent,
      'paper-writing': createPaperWritingAgent,
      'formatting-review': createFormattingReviewAgent,
    };

    // Create and register agents
    for (const [id, config] of configs) {
      const factory = factories[id];
      if (factory) {
        const agent = factory(config);
        this.agentRegistry.register(agent);
        this.logger.info(`Registered agent: ${id}`);
      }
    }

    this.initialized = true;
    this.logger.info('Alliance initialized successfully');
  }

  /**
   * Run the default research workflow
   */
  async runResearchWorkflow(
    researchTopic: string,
    options?: ExecutionOptions
  ): Promise<WorkflowResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.logger.info(`Starting research workflow for: ${researchTopic}`);

    const workflowDef = this.workflowEngine.getDefaultResearchWorkflow();

    return this.workflowEngine.executeWorkflow(
      workflowDef,
      { researchTopic },
      options
    );
  }

  /**
   * Run a custom workflow
   */
  async runWorkflow(
    workflowId: string,
    input: unknown,
    options?: ExecutionOptions
  ): Promise<WorkflowResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const workflowDef = await this.configLoader.loadWorkflowConfig(workflowId);
    return this.workflowEngine.executeWorkflow(workflowDef, input, options);
  }

  /**
   * Get the agent registry
   */
  getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  /**
   * Get the state manager
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * Get the intervention manager
   */
  getInterventionManager(): InterventionManager {
    return this.interventionManager;
  }

  /**
   * Get the config loader
   */
  getConfigLoader(): ConfigLoader {
    return this.configLoader;
  }

  /**
   * Get the workflow engine
   */
  getWorkflowEngine(): WorkflowEngine {
    return this.workflowEngine;
  }
}

// Default export
export default Alliance;
