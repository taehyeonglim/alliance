import type { ISessionState, IStateManager, IStatePersistenceAdapter, SerializedState } from '../core/interfaces/state.interface.js';
/**
 * In-memory persistence adapter
 */
export declare class MemoryPersistenceAdapter implements IStatePersistenceAdapter {
    private storage;
    save(sessionId: string, state: SerializedState): Promise<void>;
    load(sessionId: string): Promise<SerializedState | null>;
    delete(sessionId: string): Promise<void>;
    list(): Promise<string[]>;
}
/**
 * Central state management for the multi-agent system
 */
export declare class StateManager implements IStateManager {
    private sessions;
    private persistenceAdapter;
    constructor(adapter?: IStatePersistenceAdapter);
    /**
     * Create a new session
     */
    createSession(sessionId?: string): Promise<ISessionState>;
    /**
     * Get existing session
     */
    getSession(sessionId: string): ISessionState | undefined;
    /**
     * Persist session state
     */
    persist(sessionId: string): Promise<void>;
    /**
     * Delete session
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * List all sessions
     */
    listSessions(): Promise<string[]>;
}
//# sourceMappingURL=StateManager.d.ts.map