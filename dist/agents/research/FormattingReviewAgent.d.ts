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
export declare class FormattingReviewAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Execute the formatting review process
     */
    protected runAgent(context: AgentContext, instruction: string): Promise<unknown>;
    /**
     * Generate summary of the output
     */
    protected generateSummary(output: unknown): string;
    /**
     * This agent requires approval before completing
     */
    protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean;
}
/**
 * Factory function for creating FormattingReviewAgent
 */
export declare function createFormattingReviewAgent(config: AgentConfig): FormattingReviewAgent;
//# sourceMappingURL=FormattingReviewAgent.d.ts.map