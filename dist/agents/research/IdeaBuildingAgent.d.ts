import { BaseAgent } from '../../core/base/BaseAgent.js';
import type { AgentContext, AgentConfig } from '../../core/types/agent.types.js';
/**
 * Idea Building Agent (아이디어 빌딩)
 *
 * Helps researchers brainstorm and develop research ideas.
 * Identifies research gaps, formulates hypotheses, and
 * generates innovative approaches to scientific questions.
 *
 * Skills: To be defined by user
 */
export declare class IdeaBuildingAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Execute the idea building process
     */
    protected runAgent(context: AgentContext, instruction: string): Promise<unknown>;
    /**
     * Generate summary of the output
     */
    protected generateSummary(output: unknown): string;
}
/**
 * Factory function for creating IdeaBuildingAgent
 */
export declare function createIdeaBuildingAgent(config: AgentConfig): IdeaBuildingAgent;
//# sourceMappingURL=IdeaBuildingAgent.d.ts.map