/**
 * Alliance - AI Co-scientist Multi-Agent System
 * 연구의 전체 사이클을 관장하는 AI 공동연구자
 */
export { AgentConfigSchema, RESEARCH_STAGES, StateKeys, WorkflowDefinitionSchema, } from './core/types/index.js';
// Base classes
export { BaseAgent } from './core/base/index.js';
// State management
export { StateManager, MemoryPersistenceAdapter } from './state/index.js';
// Orchestration
export { WorkflowEngine, SequentialWorkflow, ParallelWorkflow, LoopWorkflow, } from './orchestration/index.js';
// Human-in-the-loop
export { InterventionManager, ConsoleInterventionHandler, ApprovalGate, DEFAULT_RESEARCH_GATES, } from './human-in-loop/index.js';
// Configuration
export { ConfigLoader, ConfigValidationError } from './config/index.js';
// Agents
export { AgentRegistry, IdeaBuildingAgent, createIdeaBuildingAgent, LiteratureSearchAgent, createLiteratureSearchAgent, ExperimentDesignAgent, createExperimentDesignAgent, DataAnalysisAgent, createDataAnalysisAgent, PaperWritingAgent, createPaperWritingAgent, FormattingReviewAgent, createFormattingReviewAgent, } from './agents/index.js';
// Utilities
export { ConsoleLogger, SilentLogger, createLogger } from './utils/index.js';
// Main Alliance class
import { StateManager } from './state/index.js';
import { WorkflowEngine } from './orchestration/index.js';
import { InterventionManager, ConsoleInterventionHandler } from './human-in-loop/index.js';
import { ConfigLoader } from './config/index.js';
import { AgentRegistry } from './agents/index.js';
import { createIdeaBuildingAgent, createLiteratureSearchAgent, createExperimentDesignAgent, createDataAnalysisAgent, createPaperWritingAgent, createFormattingReviewAgent, } from './agents/index.js';
import { createLogger } from './utils/index.js';
/**
 * Main Alliance class - entry point for the AI Co-scientist system
 */
export class Alliance {
    stateManager;
    agentRegistry;
    interventionManager;
    configLoader;
    workflowEngine;
    logger;
    initialized = false;
    constructor(config = {}) {
        this.logger = createLogger({ level: config.logLevel ?? 'info' });
        this.stateManager = new StateManager();
        this.agentRegistry = new AgentRegistry();
        this.interventionManager = new InterventionManager();
        this.configLoader = new ConfigLoader(config.configDir ?? './config');
        // Set up console handler for HITL
        this.interventionManager.setHandler(new ConsoleInterventionHandler());
        if (config.autoApprove) {
            this.interventionManager.setAutoApprove(true);
        }
        this.workflowEngine = new WorkflowEngine(this.stateManager, this.agentRegistry, this.interventionManager, this.logger);
    }
    /**
     * Initialize the Alliance system
     */
    async initialize() {
        if (this.initialized)
            return;
        this.logger.info('Initializing Alliance...');
        // Load agent configurations
        const configs = await this.configLoader.loadAllAgents();
        // Register agent factories
        const factories = {
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
    async runResearchWorkflow(researchTopic, options) {
        if (!this.initialized) {
            await this.initialize();
        }
        this.logger.info(`Starting research workflow for: ${researchTopic}`);
        const workflowDef = this.workflowEngine.getDefaultResearchWorkflow();
        return this.workflowEngine.executeWorkflow(workflowDef, { researchTopic }, options);
    }
    /**
     * Run a custom workflow
     */
    async runWorkflow(workflowId, input, options) {
        if (!this.initialized) {
            await this.initialize();
        }
        const workflowDef = await this.configLoader.loadWorkflowConfig(workflowId);
        return this.workflowEngine.executeWorkflow(workflowDef, input, options);
    }
    /**
     * Get the agent registry
     */
    getAgentRegistry() {
        return this.agentRegistry;
    }
    /**
     * Get the state manager
     */
    getStateManager() {
        return this.stateManager;
    }
    /**
     * Get the intervention manager
     */
    getInterventionManager() {
        return this.interventionManager;
    }
    /**
     * Get the config loader
     */
    getConfigLoader() {
        return this.configLoader;
    }
    /**
     * Get the workflow engine
     */
    getWorkflowEngine() {
        return this.workflowEngine;
    }
}
// Default export
export default Alliance;
//# sourceMappingURL=index.js.map