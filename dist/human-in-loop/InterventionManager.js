import { v4 as uuidv4 } from 'uuid';
/**
 * Human-in-the-loop intervention manager
 * Coordinates approval gates, feedback collection, and manual overrides
 */
export class InterventionManager {
    pendingApprovals = new Map();
    interventionHandler;
    autoApprove = false;
    /**
     * Set the handler for human interventions
     * This connects to UI/CLI/API for user interaction
     */
    setHandler(handler) {
        this.interventionHandler = handler;
    }
    /**
     * Enable auto-approve mode (for testing)
     */
    setAutoApprove(enabled) {
        this.autoApprove = enabled;
    }
    /**
     * Request human approval at a checkpoint
     */
    async requestApproval(request) {
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
                ...this.pendingApprovals.get(approvalId),
                status: response.approved ? 'approved' : 'rejected',
                response,
                resolvedAt: new Date(),
            });
            return response;
        }
        catch (error) {
            this.pendingApprovals.set(approvalId, {
                ...this.pendingApprovals.get(approvalId),
                status: 'error',
                error: error,
            });
            throw error;
        }
    }
    /**
     * Collect feedback from human
     */
    async collectFeedback(prompt, context) {
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
    async notify(notification) {
        if (this.interventionHandler?.notify) {
            await this.interventionHandler.notify(notification);
        }
    }
    /**
     * Get all pending approvals
     */
    getPendingApprovals() {
        return Array.from(this.pendingApprovals.values()).filter((a) => a.status === 'pending');
    }
    /**
     * Get intervention history
     */
    getHistory() {
        return Array.from(this.pendingApprovals.values());
    }
    /**
     * Clear history
     */
    clearHistory() {
        this.pendingApprovals.clear();
    }
}
/**
 * Console-based intervention handler (for CLI usage)
 */
export class ConsoleInterventionHandler {
    readline;
    constructor() {
        // Will be initialized on first use
    }
    async initReadline() {
        if (this.readline)
            return;
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.readline = {
            question: (query) => new Promise((resolve) => {
                rl.question(query, resolve);
            }),
            close: () => rl.close(),
        };
    }
    async handleApproval(request) {
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
        const answer = await this.readline.question('\nApprove? (yes/no/edit): ');
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            return { approved: true };
        }
        if (answer.toLowerCase() === 'edit' || answer.toLowerCase() === 'e') {
            const feedback = await this.readline.question('Enter modifications (JSON): ');
            try {
                const modifications = JSON.parse(feedback);
                return { approved: true, feedback, modifications };
            }
            catch {
                return { approved: true, feedback };
            }
        }
        const reason = await this.readline.question('Rejection reason: ');
        return { approved: false, feedback: reason };
    }
    async collectFeedback(prompt, context) {
        await this.initReadline();
        console.log('\n' + '-'.repeat(40));
        console.log(`Feedback requested from ${context.agentId}`);
        console.log('-'.repeat(40));
        return this.readline.question(prompt + ': ');
    }
    async notify(notification) {
        const icons = {
            info: 'ℹ',
            warning: '⚠',
            error: '✗',
            success: '✓',
        };
        const icon = icons[notification.type] ?? 'i';
        console.log(`\n[${icon}] ${notification.title}: ${notification.message}`);
    }
    close() {
        if (this.readline) {
            this.readline.close();
            this.readline = undefined;
        }
    }
}
//# sourceMappingURL=InterventionManager.js.map