import type { IAgent } from '../../core/interfaces/agent.interface.js';
import type {
  WorkflowType,
  WorkflowContext,
  WorkflowResult,
  WorkflowConfig,
} from '../../core/interfaces/workflow.interface.js';
import type { AgentContext, AgentResult } from '../../core/types/agent.types.js';
import { BaseWorkflow } from './BaseWorkflow.js';

/**
 * Loop workflow - executes agents iteratively until termination
 * Pattern: Repeat (Agent A -> Agent B) until condition or max iterations
 *
 * Compatible with Google ADK LoopAgent pattern
 */
export class LoopWorkflow extends BaseWorkflow {
  readonly type: WorkflowType = 'loop';

  /** Termination condition function */
  private terminationCondition?: (context: WorkflowContext, iteration: number) => boolean;

  constructor(
    id: string,
    name: string,
    agents: IAgent[],
    config?: Partial<WorkflowConfig>,
    terminationCondition?: (context: WorkflowContext, iteration: number) => boolean
  ) {
    super(id, name, agents, config);
    this.terminationCondition = terminationCondition;
  }

  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    const maxIterations = this.config.maxIterations ?? 10;
    const executionPath: string[] = [];
    const agentResults = new Map<string, AgentResult>();
    let iteration = 0;
    let currentOutput: unknown = context.invocation.input;

    context.logger.info(`Starting loop workflow with max ${maxIterations} iterations`);

    while (iteration < maxIterations) {
      // Check abort signal
      if (context.signal.aborted) {
        context.logger.info('Loop workflow aborted');
        break;
      }

      executionPath.push(`iteration_${iteration}`);
      iteration++;

      context.logger.info(`Loop iteration ${iteration}`);

      // Execute all agents in sequence for this iteration
      for (const agent of this.agents) {
        const iterationContext = this.createIterationContext(
          context,
          agent,
          iteration,
          currentOutput
        );

        try {
          const result = await agent.execute(iterationContext);
          agentResults.set(`${agent.id}_iter${iteration}`, result);

          // Store latest output for next iteration
          if (agent.outputKey) {
            context.state.set(agent.outputKey, result.output);
          }
          currentOutput = result.output;

          // Check for escalate signal (early exit)
          if (iterationContext.invocation.actions.escalate) {
            executionPath.push('escalate_exit');
            context.logger.info('Escalate signal received, exiting loop');
            return this.createResult(
              true,
              agentResults,
              executionPath,
              undefined,
              currentOutput,
              iteration
            );
          }

          // Human intervention check
          if (result.requiresReview) {
            const approval = await this.requestApproval(context, agent, result.output);
            if (!approval.approved) {
              return this.createResult(
                false,
                agentResults,
                executionPath,
                'Human rejected',
                undefined,
                iteration
              );
            }
          }
        } catch (error) {
          agentResults.set(`${agent.id}_iter${iteration}`, this.createErrorResult(error));
          if (!this.config.continueOnError) {
            throw error;
          }
        }
      }

      // Check custom termination condition
      if (this.terminationCondition && this.terminationCondition(context, iteration)) {
        executionPath.push('condition_exit');
        context.logger.info('Termination condition met, exiting loop');
        break;
      }
    }

    if (iteration >= maxIterations) {
      executionPath.push('max_iterations_reached');
      context.logger.warn(`Max iterations (${maxIterations}) reached`);
    }

    return this.createResult(
      true,
      agentResults,
      executionPath,
      undefined,
      currentOutput,
      iteration
    );
  }

  private createIterationContext(
    context: WorkflowContext,
    _agent: IAgent,
    iteration: number,
    input: unknown
  ): AgentContext {
    return {
      state: context.state,
      invocation: {
        ...context.invocation,
        input,
        iteration,
        parentAgentId: this.id,
        actions: {
          escalate: false,
          requestIntervention: false,
        },
      },
      signal: context.signal,
      logger: context.logger,
      hitl: context.hitl,
    };
  }

  /**
   * Set termination condition
   */
  setTerminationCondition(
    condition: (context: WorkflowContext, iteration: number) => boolean
  ): void {
    this.terminationCondition = condition;
  }
}
