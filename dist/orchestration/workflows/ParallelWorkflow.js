import { BaseWorkflow } from './BaseWorkflow.js';
/**
 * Parallel workflow - executes agents concurrently
 * Pattern: Fan-out to multiple agents, then gather results
 *
 * Compatible with Google ADK ParallelAgent pattern
 */
export class ParallelWorkflow extends BaseWorkflow {
    type = 'parallel';
    /** Optional merger agent for result aggregation */
    mergerAgent;
    constructor(id, name, agents, config, mergerAgent) {
        super(id, name, agents, config);
        this.mergerAgent = mergerAgent;
    }
    async execute(context) {
        const executionPath = ['parallel_start'];
        const agentResults = new Map();
        context.logger.info(`Starting parallel execution of ${this.agents.length} agents`);
        // Create branch contexts for each parallel agent
        const parallelExecutions = this.agents.map(async (agent) => {
            const branchContext = this.createBranchContext(context, agent);
            executionPath.push(`branch:${agent.id}`);
            try {
                context.logger.info(`Parallel branch starting: ${agent.id}`);
                const result = await agent.execute(branchContext);
                // Store result with unique key
                if (agent.outputKey) {
                    context.state.set(agent.outputKey, result.output);
                }
                return { agentId: agent.id, result };
            }
            catch (error) {
                return { agentId: agent.id, result: this.createErrorResult(error) };
            }
        });
        // Wait for all parallel executions
        const results = await Promise.all(parallelExecutions);
        // Collect results
        for (const { agentId, result } of results) {
            agentResults.set(agentId, result);
        }
        executionPath.push('parallel_complete');
        context.logger.info('All parallel branches completed');
        // Optional: Run merger agent to aggregate results
        if (this.mergerAgent) {
            executionPath.push(`merge:${this.mergerAgent.id}`);
            const mergerContext = this.createMergerContext(context, agentResults);
            const mergeResult = await this.mergerAgent.execute(mergerContext);
            agentResults.set(this.mergerAgent.id, mergeResult);
            return this.createResult(mergeResult.success, agentResults, executionPath, undefined, mergeResult.output);
        }
        // Combine outputs if no merger
        const combinedOutput = this.combineOutputs(agentResults);
        return this.createResult(true, agentResults, executionPath, undefined, combinedOutput);
    }
    createBranchContext(context, agent) {
        return {
            state: context.state,
            invocation: {
                ...context.invocation,
                branch: `${context.invocation.branch ?? 'main'}.${agent.id}`,
                parentAgentId: this.id,
                actions: {
                    escalate: false,
                    requestIntervention: false,
                },
            },
            signal: context.signal,
            logger: context.logger,
            hitl: context.hitl,
        };
    }
    createMergerContext(context, results) {
        // Provide all parallel results to merger agent
        const mergerInput = Object.fromEntries(Array.from(results.entries()).map(([id, result]) => [id, result.output]));
        return {
            state: context.state,
            invocation: {
                ...context.invocation,
                input: mergerInput,
                parentAgentId: this.id,
                actions: {
                    escalate: false,
                    requestIntervention: false,
                },
            },
            signal: context.signal,
            logger: context.logger,
            hitl: context.hitl,
        };
    }
    combineOutputs(results) {
        return Object.fromEntries(Array.from(results.entries()).map(([id, result]) => [id, result.output]));
    }
}
//# sourceMappingURL=ParallelWorkflow.js.map