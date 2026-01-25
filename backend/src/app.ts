import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import { env } from "./config/env.js";
import { errorMiddleware, notFoundHandler } from "./middleware/error.middleware.js";
import { requestLogger, requestIdHeader } from "./middleware/logging.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import assignmentsRoutes from "./routes/assignments.routes.js";
import milestonesRoutes from "./routes/milestones.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import synapseRoutes from "./routes/synapse.routes.js";
import userRoutes from "./routes/user.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import filesRoutes from "./routes/files.routes.js";
import foldersRoutes from "./routes/folders.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import blocksRoutes from "./routes/blocks.routes.js";
import exportRoutes from "./routes/export.routes.js";

const app = express();

// ==================== MIDDLEWARE ====================
console.log(`🔒 CORS Origin: ${env.FRONTEND_URL}`);
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Request logging and tracing
app.use(requestLogger);
app.use(requestIdHeader);

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// ==================== API ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/milestones", milestonesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/synapse", synapseRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/folders", foldersRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/blocks", blocksRoutes);
app.use("/api/export", exportRoutes);

// ==================== ERROR HANDLING ====================
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
