import { BaseWorkflow } from './BaseWorkflow.js';
/**
 * Sequential workflow - executes agents one after another
 * Pattern: Agent A -> Agent B -> Agent C
 *
 * Compatible with Google ADK SequentialAgent pattern
 */
export class SequentialWorkflow extends BaseWorkflow {
    type = 'sequential';
    constructor(id, name, agents, config) {
        super(id, name, agents, config);
    }
    async execute(context) {
        const executionPath = [];
        const agentResults = new Map();
        let currentOutput = context.invocation.input;
        for (const agent of this.agents) {
            // Check for abort signal
            if (context.signal.aborted) {
                context.logger.info('Workflow aborted');
                break;
            }
            // Human approval gate check
            if (this.config.approvalGates.includes(agent.id)) {
                const approval = await this.requestApproval(context, agent, currentOutput);
                if (!approval.approved) {
                    return this.createResult(false, agentResults, executionPath, 'Human rejected');
                }
                if (approval.modifications) {
                    currentOutput = { ...currentOutput, ...approval.modifications };
                }
            }
            executionPath.push(agent.id);
            // Create agent-specific context with previous output
            const agentContext = this.createAgentContext(context, agent, currentOutput);
            try {
                // Execute agent
                context.logger.info(`Executing agent: ${agent.id}`);
                const result = await agent.execute(agentContext);
                agentResults.set(agent.id, result);
                // Store output in shared state for next agent (ADK outputKey pattern)
                if (agent.outputKey) {
                    context.state.set(agent.outputKey, result.output);
                }
                // Update current output for next agent
                currentOutput = result.output;
                // Check for early termination (escalate signal)
                if (agentContext.invocation.actions.escalate) {
                    context.logger.info('Escalate signal received, terminating workflow');
                    break;
                }
                // Check for agent transfer request
                if (agentContext.invocation.actions.transferTo) {
                    const transferAgent = this.findAgent(agentContext.invocation.actions.transferTo);
                    if (transferAgent) {
                        executionPath.push(`transfer:${transferAgent.id}`);
                        const transferContext = this.createAgentContext(context, transferAgent, currentOutput);
                        const transferResult = await transferAgent.execute(transferContext);
                        agentResults.set(transferAgent.id, transferResult);
                        currentOutput = transferResult.output;
                    }
                }
                if (!result.success && !this.config.continueOnError) {
                    return this.createResult(false, agentResults, executionPath, result.error?.message);
                }
            }
            catch (error) {
                agentResults.set(agent.id, this.createErrorResult(error));
                if (!this.config.continueOnError) {
                    throw error;
                }
            }
        }
        return this.createResult(true, agentResults, executionPath);
    }
    createAgentContext(workflowContext, _agent, input) {
        return {
            state: workflowContext.state,
            invocation: {
                ...workflowContext.invocation,
                input,
                parentAgentId: this.id,
                actions: {
                    escalate: false,
                    requestIntervention: false,
                },
            },
            signal: workflowContext.signal,
            logger: workflowContext.logger,
            hitl: workflowContext.hitl,
        };
    }
}
//# sourceMappingURL=SequentialWorkflow.js.map