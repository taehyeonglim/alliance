import { z } from 'zod';
import { type AgentConfig } from '../core/types/agent.types.js';
import { type WorkflowDefinition } from '../core/types/workflow.types.js';
/**
 * Configuration validation error
 */
export declare class ConfigValidationError extends Error {
    zodError: z.ZodError;
    constructor(message: string, zodError: z.ZodError);
}
/**
 * Configuration loader with validation and caching
 */
export declare class ConfigLoader {
    private agentCache;
    private workflowCache;
    private configDir;
    constructor(configDir?: string);
    /**
     * Load all agent configurations from the agents directory
     */
    loadAllAgents(): Promise<Map<string, AgentConfig>>;
    /**
     * Load a single agent configuration
     */
    loadAgentConfig(filePath: string): Promise<AgentConfig>;
    /**
     * Load workflow configuration
     */
    loadWorkflowConfig(workflowId: string): Promise<WorkflowDefinition>;
    /**
     * Get cached agent config
     */
    getAgentConfig(agentId: string): AgentConfig | undefined;
    /**
     * Get all cached agent configs
     */
    getAllAgentConfigs(): AgentConfig[];
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Check if config directory exists
     */
    configDirExists(): Promise<boolean>;
    /**
     * Create default config directory structure
     */
    createConfigDir(): Promise<void>;
    /**
     * Save agent config to file
     */
    saveAgentConfig(config: AgentConfig): Promise<void>;
    /**
     * Save workflow config to file
     */
    saveWorkflowConfig(config: WorkflowDefinition): Promise<void>;
}
//# sourceMappingURL=ConfigLoader.d.ts.map