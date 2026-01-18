import { BaseAgent } from '../../core/base/BaseAgent.js';
import type { AgentContext, AgentConfig } from '../../core/types/agent.types.js';

/**
 * Experiment Design Agent (실험설계)
 *
 * Designs rigorous experiments and research methodologies.
 * Creates detailed protocols, identifies variables, and
 * ensures statistical validity of research designs.
 *
 * Skills: To be defined by user
 */
export class ExperimentDesignAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  /**
   * Execute the experiment design process
   */
  protected async runAgent(
    context: AgentContext,
    instruction: string
  ): Promise<unknown> {
    context.logger.info('ExperimentDesignAgent: Starting experiment design');

    // Get data from previous agents
    const researchIdea = context.state.get('research_idea');
    const literatureResults = context.state.get('literature_results');

    // Placeholder implementation
    const output = {
      studyType: '',
      variables: {
        independent: [],
        dependent: [],
        control: [],
      },
      sampleSize: 0,
      samplingMethod: '',
      protocol: [],
      statisticalPlan: '',
      timeline: '',
      _researchIdea: researchIdea,
      _literatureResults: literatureResults,
      _instruction: instruction,
      _status: 'skeleton',
    };

    context.logger.info('ExperimentDesignAgent: Completed (skeleton)');
    return output;
  }

  /**
   * Generate summary of the output
   */
  protected generateSummary(output: unknown): string {
    const data = output as Record<string, unknown>;
    if (data['studyType']) {
      return `Experiment designed: ${data['studyType']} study`;
    }
    return 'Experiment design completed (skeleton implementation)';
  }

  /**
   * This agent requires approval before proceeding
   */
  protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean {
    return true;
  }
}

/**
 * Factory function for creating ExperimentDesignAgent
 */
export function createExperimentDesignAgent(config: AgentConfig): ExperimentDesignAgent {
  return new ExperimentDesignAgent(config);
}
