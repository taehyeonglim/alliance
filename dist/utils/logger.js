/**
 * Log level priorities
 */
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
/**
 * Console logger implementation
 */
export class ConsoleLogger {
    level;
    prefix;
    timestamps;
    constructor(config = {}) {
        this.level = config.level ?? 'info';
        this.prefix = config.prefix ?? '[Alliance]';
        this.timestamps = config.timestamps ?? true;
    }
    shouldLog(level) {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
    }
    formatMessage(level, message) {
        const parts = [];
        if (this.timestamps) {
            parts.push(new Date().toISOString());
        }
        parts.push(this.prefix);
        parts.push(`[${level.toUpperCase()}]`);
        parts.push(message);
        return parts.join(' ');
    }
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message), ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }
    /**
     * Set log level
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * Create a child logger with a different prefix
     */
    child(prefix) {
        return new ConsoleLogger({
            level: this.level,
            prefix: `${this.prefix}${prefix}`,
            timestamps: this.timestamps,
        });
    }
}
/**
 * Silent logger (for testing)
 */
export class SilentLogger {
    debug(_message, ..._args) { }
    info(_message, ..._args) { }
    warn(_message, ..._args) { }
    error(_message, ..._args) { }
}
/**
 * Create default logger
 */
export function createLogger(config) {
    return new ConsoleLogger(config);
}
//# sourceMappingURL=logger.js.map