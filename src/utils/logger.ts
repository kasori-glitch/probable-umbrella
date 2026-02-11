/**
 * Centralized logging utility
 * Provides consistent logging across the application
 * Can be extended to send logs to external services (Sentry, LogRocket, etc.)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;

    private log(level: LogLevel, message: string, context?: LogContext): void {
        const timestamp = new Date().toISOString();

        // Console logging
        switch (level) {
            case 'error':
                console.error(`[${timestamp}] ERROR:`, message, context);
                // TODO: Send to error tracking service (Sentry, etc.)
                break;
            case 'warn':
                console.warn(`[${timestamp}] WARN:`, message, context);
                break;
            case 'info':
                if (this.isDevelopment) {
                    console.info(`[${timestamp}] INFO:`, message, context);
                }
                break;
            case 'debug':
                if (this.isDevelopment) {
                    console.debug(`[${timestamp}] DEBUG:`, message, context);
                }
                break;
        }
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context);
    }

    debug(message: string, context?: LogContext): void {
        this.log('debug', message, context);
    }

    // Performance logging
    time(label: string): void {
        if (this.isDevelopment) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (this.isDevelopment) {
            console.timeEnd(label);
        }
    }
}

export const logger = new Logger();
