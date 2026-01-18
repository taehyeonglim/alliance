import { BaseAgent } from '../../core/base/BaseAgent.js';
import type { AgentContext, AgentConfig } from '../../core/types/agent.types.js';

/**
 * Paper Writing Agent (논문쓰기)
 *
 * Writes academic papers and research documents.
 * Structures content, writes clear prose, and ensures
 * proper academic writing conventions.
 *
 * Skills: To be defined by user
 */
export class PaperWritingAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  /**
   * Execute the paper writing process
   */
  protected async runAgent(
    context: AgentContext,
    instruction: string
  ): Promise<unknown> {
    context.logger.info('PaperWritingAgent: Starting paper writing');

    // Get data from all previous agents
    const researchIdea = context.state.get('research_idea');
    const literatureResults = context.state.get('literature_results');
    const experimentDesign = context.state.get('experiment_design');
    const analysisResults = context.state.get('analysis_results');

    // Placeholder implementation
    const output = {
      title: '',
      abstract: '',
      sections: {
        introduction: '',
        methods: '',
        results: '',
        discussion: '',
        conclusion: '',
      },
      references: [],
      acknowledgments: '',
      wordCount: 0,
      _researchIdea: researchIdea,
      _literatureResults: literatureResults,
      _experimentDesign: experimentDesign,
      _analysisResults: analysisResults,
      _instruction: instruction,
      _status: 'skeleton',
    };

    context.logger.info('PaperWritingAgent: Completed (skeleton)');
    return output;
  }

  /**
   * Generate summary of the output
   */
  protected generateSummary(output: unknown): string {
    const data = output as Record<string, unknown>;
    if (data['title']) {
      return `Paper draft completed: "${data['title']}"`;
    }
    return 'Paper writing completed (skeleton implementation)';
  }

  /**
   * This agent requires approval before proceeding
   */
  protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean {
    return true;
  }
}

/**
 * Factory function for creating PaperWritingAgent
 */
export function createPaperWritingAgent(config: AgentConfig): PaperWritingAgent {
  return new PaperWritingAgent(config);
}
