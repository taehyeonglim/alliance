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
export class AgentRegistry implements IAgentRegistry {
  private agents: Map<string, IAgent> = new Map();
  private factories: Map<string, AgentFactory> = new Map();

  /**
   * Register an agent instance
   */
  register(agent: IAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Register an agent factory
   */
  registerFactory(agentId: string, factory: AgentFactory): void {
    this.factories.set(agentId, factory);
  }

  /**
   * Get agent by ID
   */
  get(id: string): IAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all registered agents
   */
  getAll(): IAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Check if agent exists
   */
  has(id: string): boolean {
    return this.agents.has(id);
  }

  /**
   * Unregister an agent
   */
  unregister(id: string): boolean {
    return this.agents.delete(id);
  }

  /**
   * Create agent from config using registered factory
   */
  createFromConfig(config: AgentConfig): IAgent | undefined {
    const factory = this.factories.get(config.id);
    if (factory) {
      const agent = factory(config);
      this.register(agent);
      return agent;
    }
    return undefined;
  }

  /**
   * Get agent IDs
   */
  getIds(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get agents by tag
   */
  getByTag(tag: string): IAgent[] {
    return this.getAll().filter((agent) => {
      // Check if agent has tags in its config (stored in skills or description)
      return agent.description.toLowerCase().includes(tag.toLowerCase());
    });
  }

  /**
   * Clear all registered agents
   */
  clear(): void {
    this.agents.clear();
  }
}
