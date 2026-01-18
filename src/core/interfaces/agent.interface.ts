import type { z } from 'zod';
import type { AgentContext, AgentResult, Tool } from '../types/agent.types.js';

/**
 * Core agent interface - compatible with both Claude Code SDK and Google ADK patterns
 */
export interface IAgent {
  /** Unique identifier for the agent */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Localized display name */
  readonly displayName: {
    en: string;
    ko: string;
  };

  /** Description of the agent's purpose and capabilities */
  readonly description: string;

  /** Agent's system instruction/prompt */
  readonly instruction: string;

  /** Tools available to this agent */
  readonly tools: Tool[];

  /** Skills defined for this agent */
  readonly skills: Skill[];

  /** Output key for state management (ADK pattern) */
  readonly outputKey?: string;

  /** Model to use (if different from default) */
  readonly model?: string;

  /**
   * Execute the agent's main logic
   * @param context - Execution context with state and tools
   * @returns Promise resolving to agent result
   */
  execute(context: AgentContext): Promise<AgentResult>;

  /**
   * Validate input before execution
   * @param input - Input to validate
   */
  validateInput(input: unknown): z.SafeParseReturnType<unknown, unknown>;

  /**
   * Check if agent can handle the given task
   * @param task - Task description
   */
  canHandle(task: string): boolean;
}

/**
 * Workflow agent interface for orchestration agents
 */
export interface IWorkflowAgent extends IAgent {
  /** Sub-agents managed by this workflow */
  readonly subAgents: IAgent[];

  /** Workflow type for execution pattern */
  readonly workflowType: 'sequential' | 'parallel' | 'loop' | 'conditional';
}

/**
 * Skill definition for agent capabilities
 */
export interface Skill {
  /** Unique skill name */
  name: string;

  /** Skill description */
  description: string;

  /** Whether the skill is enabled */
  enabled: boolean;

  /** Optional skill configuration */
  config?: Record<string, unknown>;
}

/**
 * Agent lifecycle hooks for extensibility
 */
export interface AgentLifecycleHooks {
  /** Called before agent execution */
  onBeforeExecute?: (context: AgentContext) => Promise<void>;

  /** Called after successful execution */
  onAfterExecute?: (context: AgentContext, result: AgentResult) => Promise<void>;

  /** Called on execution error */
  onError?: (context: AgentContext, error: Error) => Promise<void>;

  /** Called when agent requests human intervention */
  onHumanInterventionRequired?: (
    context: AgentContext,
    reason: string
  ) => Promise<HumanResponse>;
}

/**
 * Human response from intervention
 */
export interface HumanResponse {
  approved: boolean;
  feedback?: string;
  modifications?: Record<string, unknown>;
}
