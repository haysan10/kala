/**
 * Logger Service
 * 
 * Provides structured logging with:
 * - Log levels (debug, info, warn, error)
 * - Timestamp and context
 * - JSON format for production
 * - Colorful console output for development
 */

import { env } from "../config/env.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: unknown;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    bright: "\x1b[1m",
    debug: "\x1b[36m",  // Cyan
    info: "\x1b[32m",   // Green
    warn: "\x1b[33m",   // Yellow
    error: "\x1b[31m",  // Red
} as const;

class Logger {
    private isDevelopment = env.NODE_ENV === "development";
    private minLevel: LogLevel = env.NODE_ENV === "production" ? "info" : "debug";

    private levelPriority: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    private shouldLog(level: LogLevel): boolean {
        return this.levelPriority[level] >= this.levelPriority[this.minLevel];
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private formatDev(entry: LogEntry): string {
        const color = colors[entry.level];
        const timestamp = colors.dim + entry.timestamp + colors.reset;
        const level = color + entry.level.toUpperCase().padEnd(5) + colors.reset;
        const message = entry.message;

        let output = `${timestamp} ${level} ${message}`;

        if (entry.context && Object.keys(entry.context).length > 0) {
            output += "\n" + colors.dim + JSON.stringify(entry.context, null, 2) + colors.reset;
        }

        if (entry.error) {
            output += "\n" + colors.error + `Error: ${entry.error.name}: ${entry.error.message}` + colors.reset;
            if (entry.error.stack) {
                output += "\n" + colors.dim + entry.error.stack + colors.reset;
            }
        }

        return output;
    }

    private formatProd(entry: LogEntry): string {
        return JSON.stringify(entry);
    }

    private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            timestamp: this.formatTimestamp(),
            level,
            message,
            context,
        };

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        const formatted = this.isDevelopment
            ? this.formatDev(entry)
            : this.formatProd(entry);

        switch (level) {
            case "error":
                console.error(formatted);
                break;
            case "warn":
                console.warn(formatted);
                break;
            default:
                console.log(formatted);
        }
    }

    // Public logging methods
    debug(message: string, context?: LogContext): void {
        this.log("debug", message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log("info", message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log("warn", message, context);
    }

    error(message: string, error?: Error, context?: LogContext): void {
        this.log("error", message, context, error);
    }

    // Request logging helper
    request(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
        const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
        this.log(level, `${method} ${path} ${statusCode} ${duration}ms`, context);
    }

    // AI operation logging
    ai(operation: string, provider: string, success: boolean, duration: number, context?: LogContext): void {
        const level: LogLevel = success ? "info" : "warn";
        this.log(level, `[AI:${provider}] ${operation} ${success ? "✓" : "✗"} ${duration}ms`, context);
    }

    // Database operation logging
    db(operation: string, table: string, duration: number, context?: LogContext): void {
        this.debug(`[DB] ${operation} ${table} ${duration}ms`, context);
    }
}

// Singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
