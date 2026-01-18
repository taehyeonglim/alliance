import { BaseAgent } from '../../core/base/BaseAgent.js';
import type { AgentContext, AgentConfig } from '../../core/types/agent.types.js';

/**
 * Formatting Review Agent (포맷팅 검토)
 *
 * Reviews and formats academic papers for submission.
 * Ensures compliance with journal guidelines, checks
 * citations, and polishes the final document.
 *
 * Skills: To be defined by user
 */
export class FormattingReviewAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  /**
   * Execute the formatting review process
   */
  protected async runAgent(
    context: AgentContext,
    instruction: string
  ): Promise<unknown> {
    context.logger.info('FormattingReviewAgent: Starting formatting review');

    // Get paper draft from previous agent
    const paperDraft = context.state.get('paper_draft');

    // Placeholder implementation
    const output = {
      formattedDocument: '',
      styleChecks: {
        passed: [],
        issues: [],
      },
      citationChecks: {
        total: 0,
        verified: 0,
        issues: [],
      },
      figureTableChecks: {
        figures: 0,
        tables: 0,
        issues: [],
      },
      grammarSuggestions: [],
      readabilityScore: 0,
      journalCompliance: null,
      _paperDraft: paperDraft,
      _instruction: instruction,
      _status: 'skeleton',
    };

    context.logger.info('FormattingReviewAgent: Completed (skeleton)');
    return output;
  }

  /**
   * Generate summary of the output
   */
  protected generateSummary(output: unknown): string {
    const data = output as Record<string, unknown>;
    const styleChecks = data['styleChecks'] as Record<string, unknown[]> | undefined;
    const issueCount = Array.isArray(styleChecks?.['issues'])
      ? styleChecks['issues'].length
      : 0;
    return `Formatting review completed: ${issueCount} issues found (skeleton)`;
  }

  /**
   * This agent requires approval before completing
   */
  protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean {
    return true;
  }
}

/**
 * Factory function for creating FormattingReviewAgent
 */
export function createFormattingReviewAgent(config: AgentConfig): FormattingReviewAgent {
  return new FormattingReviewAgent(config);
}
