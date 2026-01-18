import type { AgentContext } from '../core/types/agent.types.js';
import type { ResearchStage } from '../core/types/workflow.types.js';
/**
 * Approval gate configuration
 */
export interface GateConfig {
    /** Unique gate ID (usually same as agent ID) */
    id: string;
    /** Human-readable name */
    name: string;
    /** When this gate triggers */
    trigger: 'before' | 'after';
    /** Whether approval is always required */
    required: boolean;
    /** Conditional approval function */
    condition?: (context: AgentContext) => boolean;
    /** Approval type */
    approvalType: 'proceed' | 'review_output' | 'edit_output';
    /** Custom prompt for approval */
    prompt?: string;
    /** Workflows this gate applies to */
    workflowIds?: string[];
    /** Timeout before auto-proceeding (optional, ms) */
    autoApproveAfter?: number;
    /** What to do on timeout */
    timeoutBehavior?: 'approve' | 'reject' | 'pause';
}
/**
 * Default gates for research workflow
 */
export declare const DEFAULT_RESEARCH_GATES: GateConfig[];
/**
 * Approval gate manager for workflow checkpoints
 */
export declare class ApprovalGate {
    private gates;
    constructor(defaultGates?: GateConfig[]);
    /**
     * Register an approval gate
     */
    registerGate(config: GateConfig): void;
    /**
     * Unregister a gate
     */
    unregisterGate(gateId: string): boolean;
    /**
     * Check if approval is required at this point
     */
    isApprovalRequired(agentId: string, context: AgentContext): boolean;
    /**
     * Get gate configuration
     */
    getGateConfig(agentId: string): GateConfig | undefined;
    /**
     * Get all gates
     */
    getAllGates(): GateConfig[];
    /**
     * Get gates for a specific workflow
     */
    getGatesForWorkflow(workflowId: string): GateConfig[];
    /**
     * Get gates by trigger type
     */
    getGatesByTrigger(trigger: 'before' | 'after'): GateConfig[];
    /**
     * Update gate configuration
     */
    updateGate(gateId: string, updates: Partial<GateConfig>): boolean;
    /**
     * Create prompt message for gate
     */
    createPrompt(gate: GateConfig, stage: ResearchStage): string;
}
//# sourceMappingURL=ApprovalGate.d.ts.map