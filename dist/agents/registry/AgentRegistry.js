/**
 * Agent registry for managing available agents
 */
export class AgentRegistry {
    agents = new Map();
    factories = new Map();
    /**
     * Register an agent instance
     */
    register(agent) {
        this.agents.set(agent.id, agent);
    }
    /**
     * Register an agent factory
     */
    registerFactory(agentId, factory) {
        this.factories.set(agentId, factory);
    }
    /**
     * Get agent by ID
     */
    get(id) {
        return this.agents.get(id);
    }
    /**
     * Get all registered agents
     */
    getAll() {
        return Array.from(this.agents.values());
    }
    /**
     * Check if agent exists
     */
    has(id) {
        return this.agents.has(id);
    }
    /**
     * Unregister an agent
     */
    unregister(id) {
        return this.agents.delete(id);
    }
    /**
     * Create agent from config using registered factory
     */
    createFromConfig(config) {
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
    getIds() {
        return Array.from(this.agents.keys());
    }
    /**
     * Get agents by tag
     */
    getByTag(tag) {
        return this.getAll().filter((agent) => {
            // Check if agent has tags in its config (stored in skills or description)
            return agent.description.toLowerCase().includes(tag.toLowerCase());
        });
    }
    /**
     * Clear all registered agents
     */
    clear() {
        this.agents.clear();
    }
}
//# sourceMappingURL=AgentRegistry.js.map