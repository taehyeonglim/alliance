import { v4 as uuidv4 } from 'uuid';
/**
 * Session state implementation
 */
class SessionState {
    sessionId;
    currentStage = 'idea_building';
    researchTopic = '';
    data = new Map();
    temp = new Map();
    constructor(sessionId, initialData) {
        this.sessionId = sessionId;
        if (initialData) {
            this.deserialize(initialData);
        }
    }
    get(key) {
        // Check temp state first (current turn only)
        if (key.startsWith('temp:')) {
            return this.temp.get(key.slice(5));
        }
        return this.data.get(key);
    }
    set(key, value) {
        const isTemp = key.startsWith('temp:');
        const actualKey = isTemp ? key.slice(5) : key;
        const store = isTemp ? this.temp : this.data;
        store.set(actualKey, value);
    }
    has(key) {
        if (key.startsWith('temp:')) {
            return this.temp.has(key.slice(5));
        }
        return this.data.has(key);
    }
    delete(key) {
        if (key.startsWith('temp:')) {
            return this.temp.delete(key.slice(5));
        }
        return this.data.delete(key);
    }
    keys() {
        return Array.from(this.data.keys());
    }
    clearTemp() {
        this.temp.clear();
    }
    serialize() {
        return {
            sessionId: this.sessionId,
            currentStage: this.currentStage,
            researchTopic: this.researchTopic,
            data: Object.fromEntries(this.data),
            timestamp: Date.now(),
        };
    }
    deserialize(state) {
        this.currentStage = state.currentStage;
        this.researchTopic = state.researchTopic;
        for (const [key, value] of Object.entries(state.data)) {
            this.data.set(key, value);
        }
    }
}
/**
 * In-memory persistence adapter
 */
export class MemoryPersistenceAdapter {
    storage = new Map();
    async save(sessionId, state) {
        this.storage.set(sessionId, state);
    }
    async load(sessionId) {
        return this.storage.get(sessionId) ?? null;
    }
    async delete(sessionId) {
        this.storage.delete(sessionId);
    }
    async list() {
        return Array.from(this.storage.keys());
    }
}
/**
 * Central state management for the multi-agent system
 */
export class StateManager {
    sessions = new Map();
    persistenceAdapter;
    constructor(adapter) {
        this.persistenceAdapter = adapter ?? new MemoryPersistenceAdapter();
    }
    /**
     * Create a new session
     */
    async createSession(sessionId) {
        const id = sessionId ?? uuidv4();
        // Check if resuming existing session
        const existing = await this.persistenceAdapter.load(id);
        if (existing) {
            const session = new SessionState(id, existing);
            this.sessions.set(id, session);
            return session;
        }
        const session = new SessionState(id);
        this.sessions.set(id, session);
        return session;
    }
    /**
     * Get existing session
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Persist session state
     */
    async persist(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            await this.persistenceAdapter.save(sessionId, session.serialize());
        }
    }
    /**
     * Delete session
     */
    async deleteSession(sessionId) {
        this.sessions.delete(sessionId);
        await this.persistenceAdapter.delete(sessionId);
    }
    /**
     * List all sessions
     */
    async listSessions() {
        return this.persistenceAdapter.list();
    }
}
//# sourceMappingURL=StateManager.js.map