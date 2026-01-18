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
export const DEFAULT_RESEARCH_GATES: GateConfig[] = [
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
  private gates: Map<string, GateConfig> = new Map();

  constructor(defaultGates: GateConfig[] = DEFAULT_RESEARCH_GATES) {
    for (const gate of defaultGates) {
      this.gates.set(gate.id, gate);
    }
  }

  /**
   * Register an approval gate
   */
  registerGate(config: GateConfig): void {
    this.gates.set(config.id, config);
  }

  /**
   * Unregister a gate
   */
  unregisterGate(gateId: string): boolean {
    return this.gates.delete(gateId);
  }

  /**
   * Check if approval is required at this point
   */
  isApprovalRequired(agentId: string, context: AgentContext): boolean {
    const gate = this.gates.get(agentId);
    if (!gate) return false;

    // Check conditional approval
    if (gate.condition) {
      return gate.condition(context);
    }

    return gate.required;
  }

  /**
   * Get gate configuration
   */
  getGateConfig(agentId: string): GateConfig | undefined {
    return this.gates.get(agentId);
  }

  /**
   * Get all gates
   */
  getAllGates(): GateConfig[] {
    return Array.from(this.gates.values());
  }

  /**
   * Get gates for a specific workflow
   */
  getGatesForWorkflow(workflowId: string): GateConfig[] {
    return Array.from(this.gates.values()).filter(
      (g) => g.workflowIds?.includes(workflowId) ?? true
    );
  }

  /**
   * Get gates by trigger type
   */
  getGatesByTrigger(trigger: 'before' | 'after'): GateConfig[] {
    return Array.from(this.gates.values()).filter((g) => g.trigger === trigger);
  }

  /**
   * Update gate configuration
   */
  updateGate(gateId: string, updates: Partial<GateConfig>): boolean {
    const existing = this.gates.get(gateId);
    if (!existing) return false;

    this.gates.set(gateId, { ...existing, ...updates });
    return true;
  }

  /**
   * Create prompt message for gate
   */
  createPrompt(gate: GateConfig, stage: ResearchStage): string {
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
