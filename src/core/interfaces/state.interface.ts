import type { ResearchStage } from '../types/workflow.types.js';

/**
 * Session state interface - persists across the entire research workflow
 */
export interface ISessionState {
  /** Unique session identifier */
  readonly sessionId: string;

  /** Current workflow stage */
  currentStage: ResearchStage;

  /** Research topic/question */
  researchTopic: string;

  /** Get state value with type safety */
  get<T>(key: string): T | undefined;

  /** Set state value */
  set<T>(key: string, value: T): void;

  /** Check if key exists */
  has(key: string): boolean;

  /** Delete a key from state */
  delete(key: string): boolean;

  /** Get all keys */
  keys(): string[];

  /** Clear temporary state (called between turns) */
  clearTemp(): void;

  /** Serialize state for persistence */
  serialize(): SerializedState;
}

/**
 * Serialized state structure for persistence
 */
export interface SerializedState {
  sessionId: string;
  currentStage: ResearchStage;
  researchTopic: string;
  data: Record<string, unknown>;
  timestamp: number;
}

/**
 * State persistence adapter interface
 */
export interface IStatePersistenceAdapter {
  /** Save state to storage */
  save(sessionId: string, state: SerializedState): Promise<void>;

  /** Load state from storage */
  load(sessionId: string): Promise<SerializedState | null>;

  /** Delete state from storage */
  delete(sessionId: string): Promise<void>;

  /** List all session IDs */
  list(): Promise<string[]>;
}

/**
 * State manager interface
 */
export interface IStateManager {
  /** Create a new session */
  createSession(sessionId?: string): Promise<ISessionState>;

  /** Get existing session */
  getSession(sessionId: string): ISessionState | undefined;

  /** Persist session state */
  persist(sessionId: string): Promise<void>;

  /** Delete session */
  deleteSession(sessionId: string): Promise<void>;
}
