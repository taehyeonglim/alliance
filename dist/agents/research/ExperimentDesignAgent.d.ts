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
export declare class ExperimentDesignAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Execute the experiment design process
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
 * Factory function for creating ExperimentDesignAgent
 */
export declare function createExperimentDesignAgent(config: AgentConfig): ExperimentDesignAgent;
//# sourceMappingURL=ExperimentDesignAgent.d.ts.map