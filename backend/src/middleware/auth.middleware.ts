import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/helpers.js";
import { db } from "../config/database.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Import type declarations
import "../types/express.d.js";

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        let token: string | undefined;

        // Check Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Fallback to query string token (for file preview/download in img/iframe)
        if (!token && req.query.token) {
            token = req.query.token as string;
        }

        if (!token) {
            sendError(res, "Authentication required", 401);
            return;
        }

        const payload = verifyToken(token);

        // Fetch user from database
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);

        if (!user) {
            sendError(res, "User not found", 401);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        sendError(res, "Invalid or expired token", 401);
    }
}

// Optional auth - doesn't fail if no token
export async function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const payload = verifyToken(token);

            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, payload.userId))
                .limit(1);

            if (user) {
                req.user = user;
            }
        }
    } catch {
        // Ignore errors for optional auth
    }
    next();
}
