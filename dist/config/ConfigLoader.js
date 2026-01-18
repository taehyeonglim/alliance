import * as fs from 'fs/promises';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';
import { AgentConfigSchema } from '../core/types/agent.types.js';
import { WorkflowDefinitionSchema } from '../core/types/workflow.types.js';
/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
    zodError;
    constructor(message, zodError) {
        super(message);
        this.zodError = zodError;
        this.name = 'ConfigValidationError';
    }
}
/**
 * Configuration loader with validation and caching
 */
export class ConfigLoader {
    agentCache = new Map();
    workflowCache = new Map();
    configDir;
    constructor(configDir = './config') {
        this.configDir = configDir;
    }
    /**
     * Load all agent configurations from the agents directory
     */
    async loadAllAgents() {
        const agentsDir = path.join(this.configDir, 'agents');
        try {
            const files = await fs.readdir(agentsDir);
            for (const file of files) {
                if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                    try {
                        const config = await this.loadAgentConfig(path.join(agentsDir, file));
                        this.agentCache.set(config.id, config);
                    }
                    catch (error) {
                        console.error(`Failed to load agent config ${file}:`, error);
                    }
                }
            }
        }
        catch (error) {
            // Directory may not exist yet
            console.warn(`Agents directory not found: ${agentsDir}`);
        }
        return this.agentCache;
    }
    /**
     * Load a single agent configuration
     */
    async loadAgentConfig(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const rawConfig = parseYaml(content);
        const result = AgentConfigSchema.safeParse(rawConfig);
        if (!result.success) {
            throw new ConfigValidationError(`Invalid agent configuration in ${filePath}: ${result.error.message}`, result.error);
        }
        return result.data;
    }
    /**
     * Load workflow configuration
     */
    async loadWorkflowConfig(workflowId) {
        // Check cache first
        const cached = this.workflowCache.get(workflowId);
        if (cached)
            return cached;
        const filePath = path.join(this.configDir, 'workflows', `${workflowId}.yaml`);
        const content = await fs.readFile(filePath, 'utf-8');
        const rawConfig = parseYaml(content);
        const result = WorkflowDefinitionSchema.safeParse(rawConfig);
        if (!result.success) {
            throw new ConfigValidationError(`Invalid workflow configuration: ${workflowId}`, result.error);
        }
        const workflowDef = result.data;
        this.workflowCache.set(workflowId, workflowDef);
        return workflowDef;
    }
    /**
     * Get cached agent config
     */
    getAgentConfig(agentId) {
        return this.agentCache.get(agentId);
    }
    /**
     * Get all cached agent configs
     */
    getAllAgentConfigs() {
        return Array.from(this.agentCache.values());
    }
    /**
     * Clear all caches
     */
    clearCache() {
        this.agentCache.clear();
        this.workflowCache.clear();
    }
    /**
     * Check if config directory exists
     */
    async configDirExists() {
        try {
            await fs.access(this.configDir);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Create default config directory structure
     */
    async createConfigDir() {
        await fs.mkdir(path.join(this.configDir, 'agents'), { recursive: true });
        await fs.mkdir(path.join(this.configDir, 'workflows'), { recursive: true });
    }
    /**
     * Save agent config to file
     */
    async saveAgentConfig(config) {
        const filePath = path.join(this.configDir, 'agents', `${config.id}.yaml`);
        const { stringify } = await import('yaml');
        const content = stringify(config);
        await fs.writeFile(filePath, content, 'utf-8');
        this.agentCache.set(config.id, config);
    }
    /**
     * Save workflow config to file
     */
    async saveWorkflowConfig(config) {
        const filePath = path.join(this.configDir, 'workflows', `${config.id}.yaml`);
        const { stringify } = await import('yaml');
        const content = stringify(config);
        await fs.writeFile(filePath, content, 'utf-8');
        this.workflowCache.set(config.id, config);
    }
}
//# sourceMappingURL=ConfigLoader.js.map