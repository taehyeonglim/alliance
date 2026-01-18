import { v4 as uuidv4 } from 'uuid';
import type {
  HITLInterface,
  ApprovalRequestData,
  HumanResponseData,
  FeedbackContext,
  NotificationData,
} from '../core/types/agent.types.js';

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
  handleApproval(request: ApprovalRequestData & { id: string }): Promise<HumanResponseData>;

  /** Collect free-form feedback */
  collectFeedback(prompt: string, context: FeedbackContext): Promise<string>;

  /** Send notification (optional) */
  notify?(notification: NotificationData): Promise<void>;
}

/**
 * Human-in-the-loop intervention manager
 * Coordinates approval gates, feedback collection, and manual overrides
 */
export class InterventionManager implements HITLInterface {
  private pendingApprovals: Map<string, PendingApproval> = new Map();
  private interventionHandler?: InterventionHandler;
  private autoApprove: boolean = false;

  /**
   * Set the handler for human interventions
   * This connects to UI/CLI/API for user interaction
   */
  setHandler(handler: InterventionHandler): void {
    this.interventionHandler = handler;
  }

  /**
   * Enable auto-approve mode (for testing)
   */
  setAutoApprove(enabled: boolean): void {
    this.autoApprove = enabled;
  }

  /**
   * Request human approval at a checkpoint
   */
  async requestApproval(request: ApprovalRequestData): Promise<HumanResponseData> {
    const approvalId = uuidv4();

    // Auto-approve mode for testing
    if (this.autoApprove) {
      return { approved: true };
    }

    if (!this.interventionHandler) {
      throw new Error('No intervention handler configured');
    }

    this.pendingApprovals.set(approvalId, {
      id: approvalId,
      request,
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      const response = await this.interventionHandler.handleApproval({
        ...request,
        id: approvalId,
      });

      this.pendingApprovals.set(approvalId, {
        ...this.pendingApprovals.get(approvalId)!,
        status: response.approved ? 'approved' : 'rejected',
        response,
        resolvedAt: new Date(),
      });

      return response;
    } catch (error) {
      this.pendingApprovals.set(approvalId, {
        ...this.pendingApprovals.get(approvalId)!,
        status: 'error',
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Collect feedback from human
   */
  async collectFeedback(prompt: string, context: FeedbackContext): Promise<string> {
    if (this.autoApprove) {
      return 'Auto-approved feedback';
    }

    if (!this.interventionHandler) {
      throw new Error('No intervention handler configured');
    }

    return this.interventionHandler.collectFeedback(prompt, context);
  }

  /**
   * Notify human of important events (non-blocking)
   */
  async notify(notification: NotificationData): Promise<void> {
    if (this.interventionHandler?.notify) {
      await this.interventionHandler.notify(notification);
    }
  }

  /**
   * Get all pending approvals
   */
  getPendingApprovals(): PendingApproval[] {
    return Array.from(this.pendingApprovals.values()).filter(
      (a) => a.status === 'pending'
    );
  }

  /**
   * Get intervention history
   */
  getHistory(): PendingApproval[] {
    return Array.from(this.pendingApprovals.values());
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.pendingApprovals.clear();
  }
}

/**
 * Console-based intervention handler (for CLI usage)
 */
export class ConsoleInterventionHandler implements InterventionHandler {
  private readline?: {
    question: (query: string) => Promise<string>;
    close: () => void;
  };

  constructor() {
    // Will be initialized on first use
  }

  private async initReadline(): Promise<void> {
    if (this.readline) return;

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.readline = {
      question: (query: string) =>
        new Promise((resolve) => {
          rl.question(query, resolve);
        }),
      close: () => rl.close(),
    };
  }

  async handleApproval(
    request: ApprovalRequestData & { id: string }
  ): Promise<HumanResponseData> {
    await this.initReadline();

    console.log('\n' + '='.repeat(60));
    console.log(`APPROVAL REQUIRED: ${request.summary}`);
    console.log('='.repeat(60));
    console.log(`Agent: ${request.agentId}`);
    console.log(`Stage: ${request.stage}`);
    console.log(`Type: ${request.type}`);
    console.log('\nContent:');
    console.log(JSON.stringify(request.content, null, 2));

    if (request.options?.length) {
      console.log('\nOptions:');
      request.options.forEach((opt, i) => {
        console.log(`  ${i + 1}. ${opt.label}: ${opt.description}`);
      });
    }

    const answer = await this.readline!.question('\nApprove? (yes/no/edit): ');

    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      return { approved: true };
    }

    if (answer.toLowerCase() === 'edit' || answer.toLowerCase() === 'e') {
      const feedback = await this.readline!.question('Enter modifications (JSON): ');
      try {
        const modifications = JSON.parse(feedback) as Record<string, unknown>;
        return { approved: true, feedback, modifications };
      } catch {
        return { approved: true, feedback };
      }
    }

    const reason = await this.readline!.question('Rejection reason: ');
    return { approved: false, feedback: reason };
  }

  async collectFeedback(prompt: string, context: FeedbackContext): Promise<string> {
    await this.initReadline();

    console.log('\n' + '-'.repeat(40));
    console.log(`Feedback requested from ${context.agentId}`);
    console.log('-'.repeat(40));
    return this.readline!.question(prompt + ': ');
  }

  async notify(notification: NotificationData): Promise<void> {
    const icons: Record<string, string> = {
      info: 'ℹ',
      warning: '⚠',
      error: '✗',
      success: '✓',
    };

    const icon = icons[notification.type] ?? 'i';
    console.log(`\n[${icon}] ${notification.title}: ${notification.message}`);
  }

  close(): void {
    if (this.readline) {
      this.readline.close();
      this.readline = undefined;
    }
  }
}
