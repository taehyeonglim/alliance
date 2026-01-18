import { z } from 'zod';
import type {
  IAgent,
  Skill,
  AgentLifecycleHooks,
} from '../interfaces/agent.interface.js';
import type {
  AgentContext,
  AgentResult,
  AgentConfig,
  Tool,
} from '../types/agent.types.js';

/**
 * Abstract base agent class
 * Provides common functionality for all research agents
 */
export abstract class BaseAgent implements IAgent {
  readonly id: string;
  readonly name: string;
  readonly displayName: { en: string; ko: string };
  readonly description: string;
  readonly instruction: string;
  readonly tools: Tool[];
  readonly skills: Skill[];
  readonly outputKey?: string;
  readonly model?: string;

  protected config: AgentConfig;
  protected hooks: AgentLifecycleHooks = {};
  protected inputSchema: z.ZodType<unknown>;

  constructor(config: AgentConfig) {
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.displayName = config.displayName;
    this.description = config.description;
    this.instruction = config.instruction;
    this.tools = [];
    this.skills = config.skills;
    this.outputKey = config.outputKey;
    this.model = config.model;
    this.inputSchema = z.unknown();
  }

  /**
   * Main execution method
   */
  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // Lifecycle: before execute
      if (this.hooks.onBeforeExecute) {
        await this.hooks.onBeforeExecute(context);
      }

      // Interpolate instruction with state values
      const interpolatedInstruction = this.interpolateTemplate(
        this.instruction,
        context
      );

      // Log execution start
      context.logger.info(`Agent ${this.id} starting execution`);

      // Execute agent-specific logic
      const output = await this.runAgent(context, interpolatedInstruction);

      // Store output if outputKey specified
      if (this.outputKey) {
        context.state.set(this.outputKey, output);
      }

      const result: AgentResult = {
        success: true,
        output,
        summary: this.generateSummary(output),
        metrics: {
          durationMs: Date.now() - startTime,
          toolCalls: 0,
        },
        requiresReview: this.shouldRequestReview(output, context),
      };

      // Lifecycle: after execute
      if (this.hooks.onAfterExecute) {
        await this.hooks.onAfterExecute(context, result);
      }

      context.logger.info(`Agent ${this.id} completed successfully`);

      return result;
    } catch (error) {
      const err = error as Error;

      // Lifecycle: on error
      if (this.hooks.onError) {
        await this.hooks.onError(context, err);
      }

      context.logger.error(`Agent ${this.id} failed: ${err.message}`);

      return {
        success: false,
        output: null,
        summary: `Agent ${this.id} failed: ${err.message}`,
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
        metrics: {
          durationMs: Date.now() - startTime,
          toolCalls: 0,
        },
        requiresReview: false,
      };
    }
  }

  /**
   * Validate input against schema
   */
  validateInput(input: unknown): z.SafeParseReturnType<unknown, unknown> {
    return this.inputSchema.safeParse(input);
  }

  /**
   * Check if agent can handle task (for dynamic routing)
   */
  canHandle(task: string): boolean {
    const taskLower = task.toLowerCase();
    const descLower = this.description.toLowerCase();

    const keywords = taskLower.split(/\s+/);
    return keywords.some((kw) => descLower.includes(kw));
  }

  /**
   * Set lifecycle hooks
   */
  setHooks(hooks: Partial<AgentLifecycleHooks>): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  /**
   * Set input validation schema
   */
  setInputSchema(schema: z.ZodType<unknown>): void {
    this.inputSchema = schema;
  }

  /**
   * Interpolate template with state values
   * Example: "Review the hypothesis: {hypothesis}" -> "Review the hypothesis: ..."
   */
  protected interpolateTemplate(template: string, context: AgentContext): string {
    return template.replace(/\{([^}]+)\}/g, (match, key: string) => {
      const value = context.state.get(key);
      if (value === undefined) {
        return match;
      }
      return typeof value === 'string' ? value : JSON.stringify(value);
    });
  }

  /**
   * Abstract method: Implement agent-specific logic
   */
  protected abstract runAgent(
    context: AgentContext,
    instruction: string
  ): Promise<unknown>;

  /**
   * Generate human-readable summary of output
   */
  protected abstract generateSummary(output: unknown): string;

  /**
   * Determine if output needs human review
   */
  protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean {
    return this.config.requiresApproval;
  }
}
