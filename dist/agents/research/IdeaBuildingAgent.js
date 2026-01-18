import { BaseAgent } from '../../core/base/BaseAgent.js';
/**
 * Idea Building Agent (아이디어 빌딩)
 *
 * Helps researchers brainstorm and develop research ideas.
 * Identifies research gaps, formulates hypotheses, and
 * generates innovative approaches to scientific questions.
 *
 * Skills: To be defined by user
 */
export class IdeaBuildingAgent extends BaseAgent {
    constructor(config) {
        super(config);
    }
    /**
     * Execute the idea building process
     */
    async runAgent(context, instruction) {
        context.logger.info('IdeaBuildingAgent: Starting idea building process');
        // Placeholder implementation
        // Real implementation will be added when skills are defined
        const output = {
            researchQuestion: '',
            hypothesis: '',
            rationale: '',
            potentialImpact: '',
            feasibilityScore: 0,
            suggestedKeywords: [],
            _instruction: instruction,
            _status: 'skeleton',
        };
        context.logger.info('IdeaBuildingAgent: Completed (skeleton)');
        return output;
    }
    /**
     * Generate summary of the output
     */
    generateSummary(output) {
        const data = output;
        if (data['researchQuestion']) {
            return `Research idea generated: ${data['researchQuestion']}`;
        }
        return 'Idea building completed (skeleton implementation)';
    }
}
/**
 * Factory function for creating IdeaBuildingAgent
 */
export function createIdeaBuildingAgent(config) {
    return new IdeaBuildingAgent(config);
}
//# sourceMappingURL=IdeaBuildingAgent.js.map