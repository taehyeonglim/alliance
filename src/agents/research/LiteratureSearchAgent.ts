import { BaseAgent } from '../../core/base/BaseAgent.js';
import type { AgentContext, AgentConfig } from '../../core/types/agent.types.js';

/**
 * Literature Search Agent (문헌검색)
 *
 * Conducts comprehensive literature reviews and searches.
 * Finds relevant papers, analyzes citations, and synthesizes
 * existing research in the field.
 *
 * Skills: To be defined by user
 */
export class LiteratureSearchAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  /**
   * Execute the literature search process
   */
  protected async runAgent(
    context: AgentContext,
    instruction: string
  ): Promise<unknown> {
    context.logger.info('LiteratureSearchAgent: Starting literature search');

    // Get research idea from previous agent
    const researchIdea = context.state.get('research_idea');

    // Placeholder implementation
    const output = {
      searchQueries: [],
      relevantPapers: [],
      citationMap: {},
      keySummary: '',
      identifiedGaps: [],
      _researchIdea: researchIdea,
      _instruction: instruction,
      _status: 'skeleton',
    };

    context.logger.info('LiteratureSearchAgent: Completed (skeleton)');
    return output;
  }

  /**
   * Generate summary of the output
   */
  protected generateSummary(output: unknown): string {
    const data = output as Record<string, unknown>;
    const paperCount = Array.isArray(data['relevantPapers'])
      ? data['relevantPapers'].length
      : 0;
    return `Literature search completed: ${paperCount} relevant papers found (skeleton)`;
  }
}

/**
 * Factory function for creating LiteratureSearchAgent
 */
export function createLiteratureSearchAgent(config: AgentConfig): LiteratureSearchAgent {
  return new LiteratureSearchAgent(config);
}
