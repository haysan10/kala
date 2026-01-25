import { Router } from "express";
import passport from "../config/passport.js";
import { authService } from "../services/auth.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../types/index.js";
import { sendSuccess, sendError } from "../utils/helpers.js";
import { env } from "../config/env.js";
import { signToken } from "../utils/jwt.js";
import type { User } from "../db/schema.js";

const router = Router();

// ==================== EMAIL/PASSWORD AUTH ====================

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        sendSuccess(res, result, 201);
    } catch (error: any) {
        if (error.message === "Email already registered") {
            sendError(res, error.message, 409);
        } else {
            next(error);
        }
    }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        sendSuccess(res, result);
    } catch (error: any) {
        if (error.message === "Invalid email or password") {
            sendError(res, error.message, 401);
        } else {
            next(error);
        }
    }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const profile = await authService.getProfile(req.user!.id);
        sendSuccess(res, profile);
    } catch (error) {
        next(error);
    }
});

// PUT /api/auth/profile
router.put("/profile", authMiddleware, validate(updateProfileSchema), async (req, res, next) => {
    try {
        const updated = await authService.updateProfile(req.user!.id, req.body);
        sendSuccess(res, updated);
    } catch (error) {
        next(error);
    }
});

// ==================== GOOGLE OAUTH ====================

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow
 */
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

/**
 * GET /api/auth/google/drive
 * Initiates Google OAuth flow with Drive permissions
 */
router.get(
    "/google/drive",
    passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
        accessType: "offline",
        prompt: "consent",
        session: false,
    })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/auth?error=google_auth_failed`,
    }),
    (req, res) => {
        try {
            const user = req.user as User;

            // Generate JWT token
            const token = signToken({ userId: user.id, email: user.email });

            // Redirect to frontend with token (root URL for SPA)
            res.redirect(`${env.FRONTEND_URL}/?token=${token}`);
        } catch (error) {
            console.error("Google OAuth callback error:", error);
            res.redirect(`${env.FRONTEND_URL}/auth?error=token_generation_failed`);
        }
    }
);

// ==================== GITHUB OAUTH ====================

/**
 * GET /api/auth/github
 * Initiates GitHub OAuth flow
 */
router.get(
    "/github",
    passport.authenticate("github", {
        scope: ["user:email"],
        session: false,
    })
);

/**
 * GET /api/auth/github/callback
 * GitHub OAuth callback
 */
router.get(
    "/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/auth?error=github_auth_failed`,
    }),
    (req, res) => {
        try {
            const user = req.user as User;

            // Generate JWT token
            const token = signToken({ userId: user.id, email: user.email });

            // Redirect to frontend with token (root URL for SPA)
            res.redirect(`${env.FRONTEND_URL}/?token=${token}`);
        } catch (error) {
            console.error("GitHub OAuth callback error:", error);
            res.redirect(`${env.FRONTEND_URL}/auth?error=token_generation_failed`);
        }
    }
);

export default router;
