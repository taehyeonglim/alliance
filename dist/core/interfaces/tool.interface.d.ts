import type { z } from 'zod';
/**
 * Tool definition interface - compatible with both Claude SDK and Google ADK
 */
export interface ITool<TInput = unknown, TOutput = unknown> {
    /** Unique tool name */
    readonly name: string;
    /** Tool description for LLM understanding */
    readonly description: string;
    /** Tool category for organization */
    readonly category?: string;
    /** Zod schema for input validation */
    readonly inputSchema: z.ZodType<TInput>;
    /** Execute the tool */
    execute(input: TInput, context: ToolExecutionContext): Promise<TOutput>;
}
/**
 * Tool execution context
 */
export interface ToolExecutionContext {
    /** Abort signal for cancellation */
    signal: AbortSignal;
    /** Actions for workflow control (ADK pattern) */
    actions: ToolActions;
    /** Logger instance */
    logger: ILogger;
}
/**
 * Tool actions for workflow signaling
 */
export interface ToolActions {
    /** Signal loop exit (for LoopAgent) */
    escalate: boolean;
    /** Skip remaining tools in current turn */
    skipRemainingTools: boolean;
    /** Transfer to another agent */
    transferTo?: string;
}
/**
 * Tool registry interface for managing available tools
 */
export interface IToolRegistry {
    /** Register a tool */
    register<TInput, TOutput>(tool: ITool<TInput, TOutput>): void;
    /** Get tool by name */
    get(name: string): ITool | undefined;
    /** Get all registered tools */
    getAll(): ITool[];
    /** Check if tool exists */
    has(name: string): boolean;
    /** Get tools by category */
    getByCategory(category: string): ITool[];
    /** Unregister a tool */
    unregister(name: string): boolean;
}
/**
 * Logger interface
 */
export interface ILogger {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}
//# sourceMappingURL=tool.interface.d.ts.map