import { z } from 'zod';
import type { IAgent, Skill, AgentLifecycleHooks } from '../interfaces/agent.interface.js';
import type { AgentContext, AgentResult, AgentConfig, Tool } from '../types/agent.types.js';
/**
 * Abstract base agent class
 * Provides common functionality for all research agents
 */
export declare abstract class BaseAgent implements IAgent {
    readonly id: string;
    readonly name: string;
    readonly displayName: {
        en: string;
        ko: string;
    };
    readonly description: string;
    readonly instruction: string;
    readonly tools: Tool[];
    readonly skills: Skill[];
    readonly outputKey?: string;
    readonly model?: string;
    protected config: AgentConfig;
    protected hooks: AgentLifecycleHooks;
    protected inputSchema: z.ZodType<unknown>;
    constructor(config: AgentConfig);
    /**
     * Main execution method
     */
    execute(context: AgentContext): Promise<AgentResult>;
    /**
     * Validate input against schema
     */
    validateInput(input: unknown): z.SafeParseReturnType<unknown, unknown>;
    /**
     * Check if agent can handle task (for dynamic routing)
     */
    canHandle(task: string): boolean;
    /**
     * Set lifecycle hooks
     */
    setHooks(hooks: Partial<AgentLifecycleHooks>): void;
    /**
     * Set input validation schema
     */
    setInputSchema(schema: z.ZodType<unknown>): void;
    /**
     * Interpolate template with state values
     * Example: "Review the hypothesis: {hypothesis}" -> "Review the hypothesis: ..."
     */
    protected interpolateTemplate(template: string, context: AgentContext): string;
    /**
     * Abstract method: Implement agent-specific logic
     */
    protected abstract runAgent(context: AgentContext, instruction: string): Promise<unknown>;
    /**
     * Generate human-readable summary of output
     */
    protected abstract generateSummary(output: unknown): string;
    /**
     * Determine if output needs human review
     */
    protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean;
}
//# sourceMappingURL=BaseAgent.d.ts.map