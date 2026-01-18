import type { ILogger } from '../core/interfaces/tool.interface.js';
/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Logger configuration
 */
export interface LoggerConfig {
    level: LogLevel;
    prefix?: string;
    timestamps?: boolean;
}
/**
 * Console logger implementation
 */
export declare class ConsoleLogger implements ILogger {
    private level;
    private prefix;
    private timestamps;
    constructor(config?: Partial<LoggerConfig>);
    private shouldLog;
    private formatMessage;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    /**
     * Set log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Create a child logger with a different prefix
     */
    child(prefix: string): ConsoleLogger;
}
/**
 * Silent logger (for testing)
 */
export declare class SilentLogger implements ILogger {
    debug(_message: string, ..._args: unknown[]): void;
    info(_message: string, ..._args: unknown[]): void;
    warn(_message: string, ..._args: unknown[]): void;
    error(_message: string, ..._args: unknown[]): void;
}
/**
 * Create default logger
 */
export declare function createLogger(config?: Partial<LoggerConfig>): ILogger;
//# sourceMappingURL=logger.d.ts.map