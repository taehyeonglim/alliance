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
export declare class PaperWritingAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Execute the paper writing process
     */
    protected runAgent(context: AgentContext, instruction: string): Promise<unknown>;
    /**
     * Generate summary of the output
     */
    protected generateSummary(output: unknown): string;
    /**
     * This agent requires approval before proceeding
     */
    protected shouldRequestReview(_output: unknown, _context: AgentContext): boolean;
}
/**
 * Factory function for creating PaperWritingAgent
 */
export declare function createPaperWritingAgent(config: AgentConfig): PaperWritingAgent;
//# sourceMappingURL=PaperWritingAgent.d.ts.map