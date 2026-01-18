import * as fs from 'fs/promises';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { AgentConfigSchema, type AgentConfig } from '../core/types/agent.types.js';
import { WorkflowDefinitionSchema, type WorkflowDefinition } from '../core/types/workflow.types.js';

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public zodError: z.ZodError
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Configuration loader with validation and caching
 */
export class ConfigLoader {
  private agentCache: Map<string, AgentConfig> = new Map();
  private workflowCache: Map<string, WorkflowDefinition> = new Map();
  private configDir: string;

  constructor(configDir: string = './config') {
    this.configDir = configDir;
  }

  /**
   * Load all agent configurations from the agents directory
   */
  async loadAllAgents(): Promise<Map<string, AgentConfig>> {
    const agentsDir = path.join(this.configDir, 'agents');

    try {
      const files = await fs.readdir(agentsDir);

      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          try {
            const config = await this.loadAgentConfig(path.join(agentsDir, file));
            this.agentCache.set(config.id, config);
          } catch (error) {
            console.error(`Failed to load agent config ${file}:`, error);
          }
        }
      }
    } catch (error) {
      // Directory may not exist yet
      console.warn(`Agents directory not found: ${agentsDir}`);
    }

    return this.agentCache;
  }

  /**
   * Load a single agent configuration
   */
  async loadAgentConfig(filePath: string): Promise<AgentConfig> {
    const content = await fs.readFile(filePath, 'utf-8');
    const rawConfig = parseYaml(content) as unknown;

    const result = AgentConfigSchema.safeParse(rawConfig);

    if (!result.success) {
      throw new ConfigValidationError(
        `Invalid agent configuration in ${filePath}: ${result.error.message}`,
        result.error
      );
    }

    return result.data;
  }

  /**
   * Load workflow configuration
   */
  async loadWorkflowConfig(workflowId: string): Promise<WorkflowDefinition> {
    // Check cache first
    const cached = this.workflowCache.get(workflowId);
    if (cached) return cached;

    const filePath = path.join(this.configDir, 'workflows', `${workflowId}.yaml`);
    const content = await fs.readFile(filePath, 'utf-8');
    const rawConfig = parseYaml(content) as unknown;

    const result = WorkflowDefinitionSchema.safeParse(rawConfig);

    if (!result.success) {
      throw new ConfigValidationError(
        `Invalid workflow configuration: ${workflowId}`,
        result.error
      );
    }

    const workflowDef = result.data as WorkflowDefinition;
    this.workflowCache.set(workflowId, workflowDef);
    return workflowDef;
  }

  /**
   * Get cached agent config
   */
  getAgentConfig(agentId: string): AgentConfig | undefined {
    return this.agentCache.get(agentId);
  }

  /**
   * Get all cached agent configs
   */
  getAllAgentConfigs(): AgentConfig[] {
    return Array.from(this.agentCache.values());
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.agentCache.clear();
    this.workflowCache.clear();
  }

  /**
   * Check if config directory exists
   */
  async configDirExists(): Promise<boolean> {
    try {
      await fs.access(this.configDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create default config directory structure
   */
  async createConfigDir(): Promise<void> {
    await fs.mkdir(path.join(this.configDir, 'agents'), { recursive: true });
    await fs.mkdir(path.join(this.configDir, 'workflows'), { recursive: true });
  }

  /**
   * Save agent config to file
   */
  async saveAgentConfig(config: AgentConfig): Promise<void> {
    const filePath = path.join(this.configDir, 'agents', `${config.id}.yaml`);
    const { stringify } = await import('yaml');
    const content = stringify(config);
    await fs.writeFile(filePath, content, 'utf-8');
    this.agentCache.set(config.id, config);
  }

  /**
   * Save workflow config to file
   */
  async saveWorkflowConfig(config: WorkflowDefinition): Promise<void> {
    const filePath = path.join(this.configDir, 'workflows', `${config.id}.yaml`);
    const { stringify } = await import('yaml');
    const content = stringify(config);
    await fs.writeFile(filePath, content, 'utf-8');
    this.workflowCache.set(config.id, config);
  }
}
