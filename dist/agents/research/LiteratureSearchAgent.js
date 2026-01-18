import { BaseAgent } from '../../core/base/BaseAgent.js';
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
    constructor(config) {
        super(config);
    }
    /**
     * Execute the literature search process
     */
    async runAgent(context, instruction) {
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
    generateSummary(output) {
        const data = output;
        const paperCount = Array.isArray(data['relevantPapers'])
            ? data['relevantPapers'].length
            : 0;
        return `Literature search completed: ${paperCount} relevant papers found (skeleton)`;
    }
}
/**
 * Factory function for creating LiteratureSearchAgent
 */
export function createLiteratureSearchAgent(config) {
    return new LiteratureSearchAgent(config);
}
//# sourceMappingURL=LiteratureSearchAgent.js.map