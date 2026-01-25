import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/helpers.js";
import { env } from "../config/env.js";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);

    // Zod validation errors
    if (err instanceof ZodError) {
        const messages = err.errors.map(e => `${e.path.join(".")}: ${e.message}`);
        sendError(res, `Validation error: ${messages.join(", ")}`, 400);
        return;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        sendError(res, "Invalid token", 401);
        return;
    }

    if (err.name === "TokenExpiredError") {
        sendError(res, "Token expired", 401);
        return;
    }

    // Database constraint errors (SQLite)
    if ((err as any).code === "SQLITE_CONSTRAINT") {
        sendError(res, "Resource already exists or constraint violated", 409);
        return;
    }

    // AI service errors
    if (err.message?.includes("API key") || err.message?.includes("Gemini")) {
        sendError(res, "AI service error. Please check your API configuration.", 503);
        return;
    }

    // Default error
    const message = env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;

    sendError(res, message, 500);
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
    sendError(res, `Route ${req.method} ${req.path} not found`, 404);
}
