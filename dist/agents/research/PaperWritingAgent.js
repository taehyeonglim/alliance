import { BaseAgent } from '../../core/base/BaseAgent.js';
/**
 * Paper Writing Agent (논문쓰기)
 *
 * Writes academic papers and research documents.
 * Structures content, writes clear prose, and ensures
 * proper academic writing conventions.
 *
 * Skills: To be defined by user
 */
export class PaperWritingAgent extends BaseAgent {
    constructor(config) {
        super(config);
    }
    /**
     * Execute the paper writing process
     */
    async runAgent(context, instruction) {
        context.logger.info('PaperWritingAgent: Starting paper writing');
        // Get data from all previous agents
        const researchIdea = context.state.get('research_idea');
        const literatureResults = context.state.get('literature_results');
        const experimentDesign = context.state.get('experiment_design');
        const analysisResults = context.state.get('analysis_results');
        // Placeholder implementation
        const output = {
            title: '',
            abstract: '',
            sections: {
                introduction: '',
                methods: '',
                results: '',
                discussion: '',
                conclusion: '',
            },
            references: [],
            acknowledgments: '',
            wordCount: 0,
            _researchIdea: researchIdea,
            _literatureResults: literatureResults,
            _experimentDesign: experimentDesign,
            _analysisResults: analysisResults,
            _instruction: instruction,
            _status: 'skeleton',
        };
        context.logger.info('PaperWritingAgent: Completed (skeleton)');
        return output;
    }
    /**
     * Generate summary of the output
     */
    generateSummary(output) {
        const data = output;
        if (data['title']) {
            return `Paper draft completed: "${data['title']}"`;
        }
        return 'Paper writing completed (skeleton implementation)';
    }
    /**
     * This agent requires approval before proceeding
     */
    shouldRequestReview(_output, _context) {
        return true;
    }
}
/**
 * Factory function for creating PaperWritingAgent
 */
export function createPaperWritingAgent(config) {
    return new PaperWritingAgent(config);
}
//# sourceMappingURL=PaperWritingAgent.js.map