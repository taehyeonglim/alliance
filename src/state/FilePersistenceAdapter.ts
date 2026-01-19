import { promises as fs } from 'fs';
import path from 'path';
import type {
  IStatePersistenceAdapter,
  SerializedState,
} from '../core/interfaces/state.interface.js';

/**
 * File-based persistence adapter for JSON storage
 * Data is stored in local files that can be synced via Git
 */
export class FilePersistenceAdapter implements IStatePersistenceAdapter {
  private dataDir: string;
  private sessionsDir: string;

  constructor(dataDir?: string) {
    // Default to 'data' folder in project root
    this.dataDir = dataDir ?? path.join(process.cwd(), 'data');
    this.sessionsDir = path.join(this.dataDir, 'sessions');
  }

  /**
   * Ensure data directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.sessionsDir, { recursive: true });
  }

  /**
   * Get file path for a session
   */
  private getSessionPath(sessionId: string): string {
    // Sanitize sessionId to prevent path traversal
    const safeId = sessionId.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.sessionsDir, `${safeId}.json`);
  }

  /**
   * Save session state to JSON file
   */
  async save(sessionId: string, state: SerializedState): Promise<void> {
    await this.ensureDirectories();
    const filePath = this.getSessionPath(sessionId);
    const content = JSON.stringify(state, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Load session state from JSON file
   */
  async load(sessionId: string): Promise<SerializedState | null> {
    const filePath = this.getSessionPath(sessionId);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as SerializedState;
    } catch (error) {
      // File doesn't exist or read error
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete session file
   */
  async delete(sessionId: string): Promise<void> {
    const filePath = this.getSessionPath(sessionId);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List all session IDs from files
   */
  async list(): Promise<string[]> {
    await this.ensureDirectories();

    try {
      const files = await fs.readdir(this.sessionsDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch {
      return [];
    }
  }

  /**
   * Get the data directory path
   */
  getDataDir(): string {
    return this.dataDir;
  }
}
