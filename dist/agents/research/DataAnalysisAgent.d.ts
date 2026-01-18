import { BaseAgent } from '../../core/base/BaseAgent.js';
import type { AgentContext, AgentConfig } from '../../core/types/agent.types.js';
/**
 * Data Analysis Agent (데이터분석)
 *
 * Performs statistical analysis and data visualization.
 * Interprets results, identifies patterns, and generates
 * insights from research data.
 *
 * Skills: To be defined by user
 */
export declare class DataAnalysisAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Execute the data analysis process
     */
    protected runAgent(context: AgentContext, instruction: string): Promise<unknown>;
    /**
     * Generate summary of the output
     */
    protected generateSummary(output: unknown): string;
}
/**
 * Factory function for creating DataAnalysisAgent
 */
export declare function createDataAnalysisAgent(config: AgentConfig): DataAnalysisAgent;
//# sourceMappingURL=DataAnalysisAgent.d.ts.map