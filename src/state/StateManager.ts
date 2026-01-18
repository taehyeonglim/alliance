import { v4 as uuidv4 } from 'uuid';
import type {
  ISessionState,
  IStateManager,
  IStatePersistenceAdapter,
  SerializedState,
} from '../core/interfaces/state.interface.js';
import type { ResearchStage } from '../core/types/workflow.types.js';

/**
 * Session state implementation
 */
class SessionState implements ISessionState {
  readonly sessionId: string;
  currentStage: ResearchStage = 'idea_building';
  researchTopic: string = '';

  private data: Map<string, unknown> = new Map();
  private temp: Map<string, unknown> = new Map();

  constructor(sessionId: string, initialData?: SerializedState) {
    this.sessionId = sessionId;

    if (initialData) {
      this.deserialize(initialData);
    }
  }

  get<T>(key: string): T | undefined {
    // Check temp state first (current turn only)
    if (key.startsWith('temp:')) {
      return this.temp.get(key.slice(5)) as T | undefined;
    }
    return this.data.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    const isTemp = key.startsWith('temp:');
    const actualKey = isTemp ? key.slice(5) : key;
    const store = isTemp ? this.temp : this.data;

    store.set(actualKey, value);
  }

  has(key: string): boolean {
    if (key.startsWith('temp:')) {
      return this.temp.has(key.slice(5));
    }
    return this.data.has(key);
  }

  delete(key: string): boolean {
    if (key.startsWith('temp:')) {
      return this.temp.delete(key.slice(5));
    }
    return this.data.delete(key);
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  clearTemp(): void {
    this.temp.clear();
  }

  serialize(): SerializedState {
    return {
      sessionId: this.sessionId,
      currentStage: this.currentStage,
      researchTopic: this.researchTopic,
      data: Object.fromEntries(this.data),
      timestamp: Date.now(),
    };
  }

  private deserialize(state: SerializedState): void {
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
export class MemoryPersistenceAdapter implements IStatePersistenceAdapter {
  private storage: Map<string, SerializedState> = new Map();

  async save(sessionId: string, state: SerializedState): Promise<void> {
    this.storage.set(sessionId, state);
  }

  async load(sessionId: string): Promise<SerializedState | null> {
    return this.storage.get(sessionId) ?? null;
  }

  async delete(sessionId: string): Promise<void> {
    this.storage.delete(sessionId);
  }

  async list(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

/**
 * Central state management for the multi-agent system
 */
export class StateManager implements IStateManager {
  private sessions: Map<string, SessionState> = new Map();
  private persistenceAdapter: IStatePersistenceAdapter;

  constructor(adapter?: IStatePersistenceAdapter) {
    this.persistenceAdapter = adapter ?? new MemoryPersistenceAdapter();
  }

  /**
   * Create a new session
   */
  async createSession(sessionId?: string): Promise<ISessionState> {
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
  getSession(sessionId: string): ISessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Persist session state
   */
  async persist(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.persistenceAdapter.save(sessionId, session.serialize());
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    await this.persistenceAdapter.delete(sessionId);
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<string[]> {
    return this.persistenceAdapter.list();
  }
}
