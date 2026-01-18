import type { IAgent, HumanResponse } from '../../core/interfaces/agent.interface.js';
import type {
  IWorkflow,
  WorkflowType,
  WorkflowContext,
  WorkflowResult,
  WorkflowConfig,
  WorkflowMetrics,
  ValidationResult,
  InterventionRecord,
} from '../../core/interfaces/workflow.interface.js';
import type { AgentResult } from '../../core/types/agent.types.js';

/**
 * Abstract base workflow class
 * Provides common functionality for all workflow types
 */
export abstract class BaseWorkflow implements IWorkflow {
  readonly id: string;
  readonly name: string;
  abstract readonly type: WorkflowType;
  readonly agents: IAgent[];
  protected config: WorkflowConfig;
  protected interventions: InterventionRecord[] = [];

  constructor(
    id: string,
    name: string,
    agents: IAgent[],
    config?: Partial<WorkflowConfig>
  ) {
    this.id = id;
    this.name = name;
    this.agents = agents;
    this.config = {
      continueOnError: false,
      approvalGates: [],
      ...config,
    };
  }

  /**
   * Abstract execute method - implemented by subclasses
   */
  abstract execute(context: WorkflowContext): Promise<WorkflowResult>;

  /**
   * Validate workflow configuration
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (this.agents.length === 0) {
      errors.push('Workflow must have at least one agent');
    }

    // Check for duplicate agent IDs
    const ids = new Set<string>();
    for (const agent of this.agents) {
      if (ids.has(agent.id)) {
        errors.push(`Duplicate agent ID: ${agent.id}`);
      }
      ids.add(agent.id);
    }

    // Check approval gates reference valid agents
    for (const gateId of this.config.approvalGates) {
      if (!this.agents.some((a) => a.id === gateId)) {
        warnings.push(`Approval gate references unknown agent: ${gateId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Find agent by ID
   */
  protected findAgent(agentId: string): IAgent | undefined {
    return this.agents.find((a) => a.id === agentId);
  }

  /**
   * Request human approval
   */
  protected async requestApproval(
    context: WorkflowContext,
    agent: IAgent,
    output: unknown
  ): Promise<HumanResponse> {
    const response = await context.hitl.requestApproval({
      agentId: agent.id,
      stage: context.state.currentStage,
      type: 'output',
      summary: `Review output from ${agent.displayName.en}`,
      content: output,
    });

    // Record intervention
    this.interventions.push({
      agentId: agent.id,
      timestamp: new Date(),
      reason: `Approval gate at ${agent.id}`,
      response,
    });

    return response;
  }

  /**
   * Create error result for failed execution
   */
  protected createErrorResult(error: unknown): AgentResult {
    const err = error as Error;
    return {
      success: false,
      output: null,
      summary: `Execution failed: ${err.message}`,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      metrics: {
        durationMs: 0,
        toolCalls: 0,
      },
      requiresReview: false,
    };
  }

  /**
   * Create workflow result
   */
  protected createResult(
    success: boolean,
    agentResults: Map<string, AgentResult>,
    executionPath: string[],
    _errorMessage?: string,
    output?: unknown,
    totalIterations?: number
  ): WorkflowResult {
    const metrics = this.calculateMetrics(agentResults, totalIterations);

    // Determine final output
    let finalOutput = output;
    if (finalOutput === undefined) {
      // Use last successful agent's output
      const lastSuccessful = Array.from(agentResults.values())
        .filter((r) => r.success)
        .pop();
      finalOutput = lastSuccessful?.output;
    }

    return {
      success,
      output: finalOutput,
      agentResults,
      executionPath,
      metrics,
      interventions: this.interventions,
    };
  }

  /**
   * Calculate workflow metrics
   */
  protected calculateMetrics(
    agentResults: Map<string, AgentResult>,
    totalIterations?: number
  ): WorkflowMetrics {
    let totalDurationMs = 0;
    let successfulAgents = 0;
    let failedAgents = 0;

    for (const result of agentResults.values()) {
      totalDurationMs += result.metrics.durationMs;
      if (result.success) {
        successfulAgents++;
      } else {
        failedAgents++;
      }
    }

    return {
      totalDurationMs,
      agentCount: agentResults.size,
      successfulAgents,
      failedAgents,
      humanInterventions: this.interventions.length,
      totalIterations,
    };
  }
}
