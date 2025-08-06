export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: any;
    error?: any;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    component?: string;
    action?: string;
}

export interface LoggerOptions {
    level: LogLevel;
    enableConsole: boolean;
    enableRemote: boolean;
    remoteEndpoint?: string;
    maxRetries: number;
    batchSize: number;
    flushInterval: number;
}

export class Logger {
    private static instance: Logger;
    private options: LoggerOptions;
    private logBuffer: LogEntry[] = [];
    private flushTimer?: NodeJS.Timeout;

    private constructor(options: Partial<LoggerOptions> = {}) {
        this.options = {
            level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
            enableConsole: true,
            enableRemote: process.env.NODE_ENV === 'production',
            maxRetries: 3,
            batchSize: 10,
            flushInterval: 5000,
            ...options
        };

        // Start flush timer if remote logging is enabled
        if (this.options.enableRemote) {
            this.startFlushTimer();
        }
    }

    static getInstance(options?: Partial<LoggerOptions>): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(options);
        }
        return Logger.instance;
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.options.level;
    }

    private createLogEntry(
        level: LogLevel,
        message: string,
        context?: any,
        error?: any
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                status: error.status
            } : undefined,
            userId: this.getCurrentUserId(),
            sessionId: this.getCurrentSessionId(),
            requestId: this.getCurrentRequestId(),
            component: context?.component,
            action: context?.action
        };
    }

    private getCurrentUserId(): string | undefined {
        // In a real implementation, you'd get this from the current context
        // This could be from a request header, session, or context provider
        return undefined;
    }

    private getCurrentSessionId(): string | undefined {
        // Get session ID from current context
        return undefined;
    }

    private getCurrentRequestId(): string | undefined {
        // Get request ID from current context
        return undefined;
    }

    private logToConsole(entry: LogEntry): void {
        if (!this.options.enableConsole) return;

        const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
        const levelColors = [
            '\x1b[36m', // Cyan for DEBUG
            '\x1b[32m', // Green for INFO
            '\x1b[33m', // Yellow for WARN
            '\x1b[31m', // Red for ERROR
            '\x1b[35m'  // Magenta for CRITICAL
        ];

        const color = levelColors[entry.level];
        const reset = '\x1b[0m';
        const levelName = levelNames[entry.level];

        const prefix = `${color}[${entry.timestamp}] ${levelName}${reset}`;
        const message = `${prefix}: ${entry.message}`;

        // Log to appropriate console method
        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(message, entry.context, entry.error);
                break;
            case LogLevel.INFO:
                console.info(message, entry.context);
                break;
            case LogLevel.WARN:
                console.warn(message, entry.context, entry.error);
                break;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                console.error(message, entry.context, entry.error);
                break;
        }
    }

    private addToBuffer(entry: LogEntry): void {
        if (!this.options.enableRemote) return;

        this.logBuffer.push(entry);

        // Flush immediately for critical errors
        if (entry.level === LogLevel.CRITICAL) {
            this.flush();
        }

        // Flush if buffer is full
        if (this.logBuffer.length >= this.options.batchSize) {
            this.flush();
        }
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(() => {
            if (this.logBuffer.length > 0) {
                this.flush();
            }
        }, this.options.flushInterval);
    }

    private async flush(): Promise<void> {
        if (this.logBuffer.length === 0) return;

        const logsToSend = [...this.logBuffer];
        this.logBuffer = [];

        try {
            await this.sendLogsToRemote(logsToSend);
        } catch (error) {
            // If remote logging fails, log to console as fallback
            console.error('Failed to send logs to remote endpoint:', error);

            // Put logs back in buffer for retry (up to max retries)
            this.logBuffer.unshift(...logsToSend);
        }
    }

    private async sendLogsToRemote(logs: LogEntry[], retryCount = 0): Promise<void> {
        if (!this.options.remoteEndpoint) return;

        try {
            const response = await fetch(this.options.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ logs })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            if (retryCount < this.options.maxRetries) {
                // Exponential backoff
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendLogsToRemote(logs, retryCount + 1);
            }
            throw error;
        }
    }

    debug(message: string, context?: any): void {
        if (!this.shouldLog(LogLevel.DEBUG)) return;

        const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    info(message: string, context?: any): void {
        if (!this.shouldLog(LogLevel.INFO)) return;

        const entry = this.createLogEntry(LogLevel.INFO, message, context);
        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    warn(message: string, context?: any, error?: any): void {
        if (!this.shouldLog(LogLevel.WARN)) return;

        const entry = this.createLogEntry(LogLevel.WARN, message, context, error);
        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    error(message: string, context?: any, error?: any): void {
        if (!this.shouldLog(LogLevel.ERROR)) return;

        const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    critical(message: string, context?: any, error?: any): void {
        if (!this.shouldLog(LogLevel.CRITICAL)) return;

        const entry = this.createLogEntry(LogLevel.CRITICAL, message, context, error);
        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    // Structured logging methods for specific use cases
    logApiRequest(method: string, path: string, statusCode: number, duration: number, context?: any): void {
        this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, {
            component: 'API',
            action: 'request',
            method,
            path,
            statusCode,
            duration,
            ...context
        });
    }

    logDatabaseQuery(query: string, duration: number, error?: any): void {
        if (error) {
            this.error(`Database query failed: ${query}`, {
                component: 'Database',
                action: 'query',
                query,
                duration
            }, error);
        } else {
            this.debug(`Database query executed: ${query} (${duration}ms)`, {
                component: 'Database',
                action: 'query',
                query,
                duration
            });
        }
    }

    logAuthEvent(event: string, userId?: string, success: boolean = true, error?: any): void {
        const level = success ? LogLevel.INFO : LogLevel.WARN;
        const message = `Auth ${event}: ${success ? 'success' : 'failed'}`;

        const entry = this.createLogEntry(level, message, {
            component: 'Auth',
            action: event,
            userId,
            success
        }, error);

        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    logPaymentEvent(event: string, amount?: number, currency?: string, success: boolean = true, error?: any): void {
        const level = success ? LogLevel.INFO : LogLevel.ERROR;
        const message = `Payment ${event}: ${success ? 'success' : 'failed'}`;

        const entry = this.createLogEntry(level, message, {
            component: 'Payment',
            action: event,
            amount,
            currency,
            success
        }, error);

        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    logWebhookEvent(eventType: string, eventId: string, success: boolean = true, error?: any): void {
        const level = success ? LogLevel.INFO : LogLevel.ERROR;
        const message = `Webhook ${eventType}: ${success ? 'processed' : 'failed'}`;

        const entry = this.createLogEntry(level, message, {
            component: 'Webhook',
            action: 'process',
            eventType,
            eventId,
            success
        }, error);

        this.logToConsole(entry);
        this.addToBuffer(entry);
    }

    // Cleanup method
    destroy(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        // Flush remaining logs
        if (this.logBuffer.length > 0) {
            this.flush();
        }
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
    debug: (message: string, context?: any) => logger.debug(message, context),
    info: (message: string, context?: any) => logger.info(message, context),
    warn: (message: string, context?: any, error?: any) => logger.warn(message, context, error),
    error: (message: string, context?: any, error?: any) => logger.error(message, context, error),
    critical: (message: string, context?: any, error?: any) => logger.critical(message, context, error),

    // Structured logging
    apiRequest: (method: string, path: string, statusCode: number, duration: number, context?: any) =>
        logger.logApiRequest(method, path, statusCode, duration, context),

    dbQuery: (query: string, duration: number, error?: any) =>
        logger.logDatabaseQuery(query, duration, error),

    auth: (event: string, userId?: string, success?: boolean, error?: any) =>
        logger.logAuthEvent(event, userId, success, error),

    payment: (event: string, amount?: number, currency?: string, success?: boolean, error?: any) =>
        logger.logPaymentEvent(event, amount, currency, success, error),

    webhook: (eventType: string, eventId: string, success?: boolean, error?: any) =>
        logger.logWebhookEvent(eventType, eventId, success, error)
};