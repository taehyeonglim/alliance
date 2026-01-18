import type { IAgent } from '../../core/interfaces/agent.interface.js';
import type { AgentConfig } from '../../core/types/agent.types.js';
import type { IAgentRegistry } from '../../orchestration/WorkflowEngine.js';
/**
 * Agent factory function type
 */
export type AgentFactory = (config: AgentConfig) => IAgent;
/**
 * Agent registry for managing available agents
 */
export declare class AgentRegistry implements IAgentRegistry {
    private agents;
    private factories;
    /**
     * Register an agent instance
     */
    register(agent: IAgent): void;
    /**
     * Register an agent factory
     */
    registerFactory(agentId: string, factory: AgentFactory): void;
    /**
     * Get agent by ID
     */
    get(id: string): IAgent | undefined;
    /**
     * Get all registered agents
     */
    getAll(): IAgent[];
    /**
     * Check if agent exists
     */
    has(id: string): boolean;
    /**
     * Unregister an agent
     */
    unregister(id: string): boolean;
    /**
     * Create agent from config using registered factory
     */
    createFromConfig(config: AgentConfig): IAgent | undefined;
    /**
     * Get agent IDs
     */
    getIds(): string[];
    /**
     * Get agents by tag
     */
    getByTag(tag: string): IAgent[];
    /**
     * Clear all registered agents
     */
    clear(): void;
}
//# sourceMappingURL=AgentRegistry.d.ts.map