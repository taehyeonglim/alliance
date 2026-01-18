/**
 * Abstract base workflow class
 * Provides common functionality for all workflow types
 */
export class BaseWorkflow {
    id;
    name;
    agents;
    config;
    interventions = [];
    constructor(id, name, agents, config) {
        this.id = id;
        this.name = name;
        this.agents = agents;
        this.config = {
            continueOnError: false,
            approvalGates: [],
            ...config,
        };
    }
    /**
     * Validate workflow configuration
     */
    validate() {
        const errors = [];
        const warnings = [];
        if (this.agents.length === 0) {
            errors.push('Workflow must have at least one agent');
        }
        // Check for duplicate agent IDs
        const ids = new Set();
        for (const agent of this.agents) {
            if (ids.has(agent.id)) {
                errors.push(`Duplicate agent ID: ${agent.id}`);
            }
            ids.add(agent.id);
        }
        // Check approval gates reference valid agents
        for (const gateId of this.config.approvalGates) {
            if (!this.agents.some((a) => a.id === gateId)) {
                warnings.push(`Approval gate references unknown agent: ${gateId}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Find agent by ID
     */
    findAgent(agentId) {
        return this.agents.find((a) => a.id === agentId);
    }
    /**
     * Request human approval
     */
    async requestApproval(context, agent, output) {
        const response = await context.hitl.requestApproval({
            agentId: agent.id,
            stage: context.state.currentStage,
            type: 'output',
            summary: `Review output from ${agent.displayName.en}`,
            content: output,
        });
        // Record intervention
        this.interventions.push({
            agentId: agent.id,
            timestamp: new Date(),
            reason: `Approval gate at ${agent.id}`,
            response,
        });
        return response;
    }
    /**
     * Create error result for failed execution
     */
    createErrorResult(error) {
        const err = error;
        return {
            success: false,
            output: null,
            summary: `Execution failed: ${err.message}`,
            error: {
                name: err.name,
                message: err.message,
                stack: err.stack,
            },
            metrics: {
                durationMs: 0,
                toolCalls: 0,
            },
            requiresReview: false,
        };
    }
    /**
     * Create workflow result
     */
    createResult(success, agentResults, executionPath, _errorMessage, output, totalIterations) {
        const metrics = this.calculateMetrics(agentResults, totalIterations);
        // Determine final output
        let finalOutput = output;
        if (finalOutput === undefined) {
            // Use last successful agent's output
            const lastSuccessful = Array.from(agentResults.values())
                .filter((r) => r.success)
                .pop();
            finalOutput = lastSuccessful?.output;
        }
        return {
            success,
            output: finalOutput,
            agentResults,
            executionPath,
            metrics,
            interventions: this.interventions,
        };
    }
    /**
     * Calculate workflow metrics
     */
    calculateMetrics(agentResults, totalIterations) {
        let totalDurationMs = 0;
        let successfulAgents = 0;
        let failedAgents = 0;
        for (const result of agentResults.values()) {
            totalDurationMs += result.metrics.durationMs;
            if (result.success) {
                successfulAgents++;
            }
            else {
                failedAgents++;
            }
        }
        return {
            totalDurationMs,
            agentCount: agentResults.size,
            successfulAgents,
            failedAgents,
            humanInterventions: this.interventions.length,
            totalIterations,
        };
    }
}
//# sourceMappingURL=BaseWorkflow.js.map