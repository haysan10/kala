import { Router } from "express";
import { assignmentsService } from "../services/assignments.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { createAssignmentSchema, updateAssignmentSchema } from "../types/index.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/assignments
router.get("/", async (req, res, next) => {
    try {
        const assignments = await assignmentsService.getAll(req.user!.id);
        sendSuccess(res, assignments, 200, { total: assignments.length });
    } catch (error) {
        next(error);
    }
});

// GET /api/assignments/:id
router.get("/:id", async (req, res, next) => {
    try {
        const assignment = await assignmentsService.getById(req.params.id, req.user!.id);
        sendSuccess(res, assignment);
    } catch (error: any) {
        if (error.message === "Assignment not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

// POST /api/assignments
router.post("/", validate(createAssignmentSchema), async (req, res, next) => {
    try {
        const assignment = await assignmentsService.create(req.user!.id, req.body);
        sendSuccess(res, assignment, 201);
    } catch (error) {
        next(error);
    }
});

// PUT /api/assignments/:id
router.put("/:id", validate(updateAssignmentSchema), async (req, res, next) => {
    try {
        const assignment = await assignmentsService.update(req.params.id, req.user!.id, req.body);
        sendSuccess(res, assignment);
    } catch (error: any) {
        if (error.message === "Assignment not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

// DELETE /api/assignments/:id
router.delete("/:id", async (req, res, next) => {
    try {
        await assignmentsService.delete(req.params.id, req.user!.id);
        sendSuccess(res, { deleted: true });
    } catch (error: any) {
        if (error.message === "Assignment not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

export default router;
