import { BaseAgent } from '../../core/base/BaseAgent.js';
/**
 * Experiment Design Agent (실험설계)
 *
 * Designs rigorous experiments and research methodologies.
 * Creates detailed protocols, identifies variables, and
 * ensures statistical validity of research designs.
 *
 * Skills: To be defined by user
 */
export class ExperimentDesignAgent extends BaseAgent {
    constructor(config) {
        super(config);
    }
    /**
     * Execute the experiment design process
     */
    async runAgent(context, instruction) {
        context.logger.info('ExperimentDesignAgent: Starting experiment design');
        // Get data from previous agents
        const researchIdea = context.state.get('research_idea');
        const literatureResults = context.state.get('literature_results');
        // Placeholder implementation
        const output = {
            studyType: '',
            variables: {
                independent: [],
                dependent: [],
                control: [],
            },
            sampleSize: 0,
            samplingMethod: '',
            protocol: [],
            statisticalPlan: '',
            timeline: '',
            _researchIdea: researchIdea,
            _literatureResults: literatureResults,
            _instruction: instruction,
            _status: 'skeleton',
        };
        context.logger.info('ExperimentDesignAgent: Completed (skeleton)');
        return output;
    }
    /**
     * Generate summary of the output
     */
    generateSummary(output) {
        const data = output;
        if (data['studyType']) {
            return `Experiment designed: ${data['studyType']} study`;
        }
        return 'Experiment design completed (skeleton implementation)';
    }
    /**
     * This agent requires approval before proceeding
     */
    shouldRequestReview(_output, _context) {
        return true;
    }
}
/**
 * Factory function for creating ExperimentDesignAgent
 */
export function createExperimentDesignAgent(config) {
    return new ExperimentDesignAgent(config);
}
//# sourceMappingURL=ExperimentDesignAgent.js.map