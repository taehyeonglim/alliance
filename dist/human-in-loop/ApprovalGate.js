/**
 * Default gates for research workflow
 */
export const DEFAULT_RESEARCH_GATES = [
    {
        id: 'experiment-design',
        name: 'Experiment Design Review',
        trigger: 'after',
        required: true,
        approvalType: 'review_output',
        prompt: 'Please review the proposed experiment design before proceeding to data analysis.',
    },
    {
        id: 'paper-writing',
        name: 'Paper Draft Review',
        trigger: 'after',
        required: true,
        approvalType: 'edit_output',
        prompt: 'Please review and optionally edit the paper draft before final formatting.',
    },
    {
        id: 'formatting-review',
        name: 'Final Submission Review',
        trigger: 'after',
        required: true,
        approvalType: 'review_output',
        prompt: 'Please review the final formatted document before completion.',
    },
];
/**
 * Approval gate manager for workflow checkpoints
 */
export class ApprovalGate {
    gates = new Map();
    constructor(defaultGates = DEFAULT_RESEARCH_GATES) {
        for (const gate of defaultGates) {
            this.gates.set(gate.id, gate);
        }
    }
    /**
     * Register an approval gate
     */
    registerGate(config) {
        this.gates.set(config.id, config);
    }
    /**
     * Unregister a gate
     */
    unregisterGate(gateId) {
        return this.gates.delete(gateId);
    }
    /**
     * Check if approval is required at this point
     */
    isApprovalRequired(agentId, context) {
        const gate = this.gates.get(agentId);
        if (!gate)
            return false;
        // Check conditional approval
        if (gate.condition) {
            return gate.condition(context);
        }
        return gate.required;
    }
    /**
     * Get gate configuration
     */
    getGateConfig(agentId) {
        return this.gates.get(agentId);
    }
    /**
     * Get all gates
     */
    getAllGates() {
        return Array.from(this.gates.values());
    }
    /**
     * Get gates for a specific workflow
     */
    getGatesForWorkflow(workflowId) {
        return Array.from(this.gates.values()).filter((g) => g.workflowIds?.includes(workflowId) ?? true);
    }
    /**
     * Get gates by trigger type
     */
    getGatesByTrigger(trigger) {
        return Array.from(this.gates.values()).filter((g) => g.trigger === trigger);
    }
    /**
     * Update gate configuration
     */
    updateGate(gateId, updates) {
        const existing = this.gates.get(gateId);
        if (!existing)
            return false;
        this.gates.set(gateId, { ...existing, ...updates });
        return true;
    }
    /**
     * Create prompt message for gate
     */
    createPrompt(gate, stage) {
        if (gate.prompt) {
            return gate.prompt;
        }
        switch (gate.approvalType) {
            case 'proceed':
                return `Ready to proceed to the next stage after ${stage}?`;
            case 'review_output':
                return `Please review the output from ${stage}.`;
            case 'edit_output':
                return `Please review and edit the output from ${stage} if needed.`;
            default:
                return `Approval required for ${stage}.`;
        }
    }
}
//# sourceMappingURL=ApprovalGate.js.map