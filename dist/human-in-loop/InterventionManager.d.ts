import type { HITLInterface, ApprovalRequestData, HumanResponseData, FeedbackContext, NotificationData } from '../core/types/agent.types.js';
/**
 * Pending approval record
 */
interface PendingApproval {
    id: string;
    request: ApprovalRequestData;
    status: 'pending' | 'approved' | 'rejected' | 'error';
    response?: HumanResponseData;
    error?: Error;
    createdAt: Date;
    resolvedAt?: Date;
}
/**
 * Handler interface for connecting to UI/CLI/API
 */
export interface InterventionHandler {
    /** Handle approval request */
    handleApproval(request: ApprovalRequestData & {
        id: string;
    }): Promise<HumanResponseData>;
    /** Collect free-form feedback */
    collectFeedback(prompt: string, context: FeedbackContext): Promise<string>;
    /** Send notification (optional) */
    notify?(notification: NotificationData): Promise<void>;
}
/**
 * Human-in-the-loop intervention manager
 * Coordinates approval gates, feedback collection, and manual overrides
 */
export declare class InterventionManager implements HITLInterface {
    private pendingApprovals;
    private interventionHandler?;
    private autoApprove;
    /**
     * Set the handler for human interventions
     * This connects to UI/CLI/API for user interaction
     */
    setHandler(handler: InterventionHandler): void;
    /**
     * Enable auto-approve mode (for testing)
     */
    setAutoApprove(enabled: boolean): void;
    /**
     * Request human approval at a checkpoint
     */
    requestApproval(request: ApprovalRequestData): Promise<HumanResponseData>;
    /**
     * Collect feedback from human
     */
    collectFeedback(prompt: string, context: FeedbackContext): Promise<string>;
    /**
     * Notify human of important events (non-blocking)
     */
    notify(notification: NotificationData): Promise<void>;
    /**
     * Get all pending approvals
     */
    getPendingApprovals(): PendingApproval[];
    /**
     * Get intervention history
     */
    getHistory(): PendingApproval[];
    /**
     * Clear history
     */
    clearHistory(): void;
}
/**
 * Console-based intervention handler (for CLI usage)
 */
export declare class ConsoleInterventionHandler implements InterventionHandler {
    private readline?;
    constructor();
    private initReadline;
    handleApproval(request: ApprovalRequestData & {
        id: string;
    }): Promise<HumanResponseData>;
    collectFeedback(prompt: string, context: FeedbackContext): Promise<string>;
    notify(notification: NotificationData): Promise<void>;
    close(): void;
}
export {};
//# sourceMappingURL=InterventionManager.d.ts.map