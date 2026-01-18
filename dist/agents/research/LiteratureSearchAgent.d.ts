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
export declare class LiteratureSearchAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Execute the literature search process
     */
    protected runAgent(context: AgentContext, instruction: string): Promise<unknown>;
    /**
     * Generate summary of the output
     */
    protected generateSummary(output: unknown): string;
}
/**
 * Factory function for creating LiteratureSearchAgent
 */
export declare function createLiteratureSearchAgent(config: AgentConfig): LiteratureSearchAgent;
//# sourceMappingURL=LiteratureSearchAgent.d.ts.map