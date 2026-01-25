/**
 * Request Logging Middleware
 * 
 * Logs all HTTP requests with:
 * - Method and path
 * - Response status code
 * - Request duration
 * - Request ID for tracing
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// Extend Express Request to include requestId
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            startTime?: number;
        }
    }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    // Assign request ID and start time
    req.requestId = generateRequestId();
    req.startTime = Date.now();

    // Log request start (debug level)
    logger.debug(`→ ${req.method} ${req.path}`, {
        requestId: req.requestId,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        userAgent: req.get("user-agent"),
        ip: req.ip,
    });

    // Capture response finish
    res.on("finish", () => {
        const duration = Date.now() - (req.startTime || Date.now());

        logger.request(req.method, req.path, res.statusCode, duration, {
            requestId: req.requestId,
            userId: (req as any).user?.id,
        });
    });

    next();
}

/**
 * Request ID header middleware
 * Adds X-Request-ID header to responses
 */
export function requestIdHeader(req: Request, res: Response, next: NextFunction): void {
    if (req.requestId) {
        res.setHeader("X-Request-ID", req.requestId);
    }
    next();
}
