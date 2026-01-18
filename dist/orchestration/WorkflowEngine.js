import { v4 as uuidv4 } from 'uuid';
import { SequentialWorkflow } from './workflows/SequentialWorkflow.js';
import { ParallelWorkflow } from './workflows/ParallelWorkflow.js';
import { LoopWorkflow } from './workflows/LoopWorkflow.js';
/**
 * Main workflow orchestration engine
 * Supports hybrid workflows combining sequential, parallel, and loop patterns
 */
export class WorkflowEngine {
    stateManager;
    agentRegistry;
    hitl;
    logger;
    activeWorkflows = new Map();
    constructor(stateManager, agentRegistry, hitl, logger) {
        this.stateManager = stateManager;
        this.agentRegistry = agentRegistry;
        this.hitl = hitl;
        this.logger = logger;
    }
    /**
     * Create and execute a workflow from configuration
     */
    async executeWorkflow(workflowConfig, input, options) {
        const workflow = this.buildWorkflow(workflowConfig);
        const validation = workflow.validate();
        if (!validation.valid) {
            throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
        }
        if (validation.warnings.length > 0) {
            for (const warning of validation.warnings) {
                this.logger.warn(`Workflow warning: ${warning}`);
            }
        }
        const context = await this.createContext(workflow, input, options);
        this.activeWorkflows.set(workflow.id, workflow);
        this.logger.info(`Starting workflow: ${workflow.name} (${workflow.id})`);
        try {
            const result = await workflow.execute(context);
            this.logger.info(`Workflow completed: ${workflow.name} - Success: ${result.success}`);
            return result;
        }
        finally {
            this.activeWorkflows.delete(workflow.id);
            await this.stateManager.persist(context.state.sessionId);
        }
    }
    /**
     * Build workflow from definition (supports hybrid/nested workflows)
     */
    buildWorkflow(definition) {
        const agents = this.resolveAgents(definition);
        switch (definition.type) {
            case 'sequential':
                return new SequentialWorkflow(definition.id, definition.name, agents, definition.config);
            case 'parallel': {
                const mergerAgent = definition.mergerAgentId
                    ? this.agentRegistry.get(definition.mergerAgentId)
                    : undefined;
                return new ParallelWorkflow(definition.id, definition.name, agents, definition.config, mergerAgent);
            }
            case 'loop':
                return new LoopWorkflow(definition.id, definition.name, agents, definition.config);
            case 'hybrid':
                // Hybrid workflows use sequential as base with nested workflows
                return new SequentialWorkflow(definition.id, definition.name, agents, definition.config);
            default:
                throw new Error(`Unknown workflow type: ${definition.type}`);
        }
    }
    /**
     * Resolve agent references to actual agents
     */
    resolveAgents(definition) {
        return definition.agents.map((agentDef) => {
            // Handle nested workflow definitions
            if ('workflow' in agentDef) {
                // Create a workflow agent wrapper
                const nestedWorkflow = this.buildWorkflow(agentDef.workflow);
                return this.createWorkflowAgentWrapper(nestedWorkflow);
            }
            // Regular agent reference
            const agent = this.agentRegistry.get(agentDef.id);
            if (!agent) {
                throw new Error(`Agent not found: ${agentDef.id}`);
            }
            return agent;
        });
    }
    /**
     * Create a wrapper agent for nested workflows
     */
    createWorkflowAgentWrapper(workflow) {
        return {
            id: workflow.id,
            name: workflow.name,
            displayName: { en: workflow.name, ko: workflow.name },
            description: `Nested workflow: ${workflow.name}`,
            instruction: '',
            tools: [],
            skills: [],
            outputKey: undefined,
            model: undefined,
            async execute(context) {
                const workflowContext = {
                    ...context,
                    workflowConfig: {
                        continueOnError: false,
                        approvalGates: [],
                    },
                    previousResults: new Map(),
                    branchResults: new Map(),
                };
                const result = await workflow.execute(workflowContext);
                return {
                    success: result.success,
                    output: result.output,
                    summary: `Workflow ${workflow.name} completed`,
                    metrics: {
                        durationMs: result.metrics.totalDurationMs,
                        toolCalls: 0,
                    },
                    requiresReview: false,
                };
            },
            validateInput: () => ({ success: true, data: undefined }),
            canHandle: () => true,
        };
    }
    /**
     * Create execution context
     */
    async createContext(_workflow, input, options) {
        const session = await this.stateManager.createSession(options?.sessionId);
        const abortController = options?.abortController ?? new AbortController();
        return {
            state: session,
            invocation: {
                invocationId: uuidv4(),
                input,
                timeout: options?.timeout,
                actions: {
                    escalate: false,
                    requestIntervention: false,
                },
            },
            signal: abortController.signal,
            logger: this.logger,
            hitl: this.hitl,
            workflowConfig: {
                continueOnError: false,
                approvalGates: [],
            },
            previousResults: new Map(),
            branchResults: new Map(),
        };
    }
    /**
     * Get default research workflow definition
     */
    getDefaultResearchWorkflow() {
        return {
            id: 'default-research',
            name: 'Default Research Workflow',
            type: 'sequential',
            agents: [
                { id: 'idea-building' },
                { id: 'literature-search' },
                { id: 'experiment-design' },
                { id: 'data-analysis' },
                { id: 'paper-writing' },
                { id: 'formatting-review' },
            ],
            config: {
                continueOnError: false,
                approvalGates: ['experiment-design', 'paper-writing', 'formatting-review'],
            },
        };
    }
    /**
     * Get active workflows
     */
    getActiveWorkflows() {
        return Array.from(this.activeWorkflows.values());
    }
    /**
     * Cancel a running workflow
     */
    cancelWorkflow(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            this.logger.info(`Cancelling workflow: ${workflowId}`);
            // Cancellation is handled via AbortController in context
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=WorkflowEngine.js.map