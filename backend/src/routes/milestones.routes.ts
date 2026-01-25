import { Router } from "express";
import { milestonesService } from "../services/milestones.service.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { createMilestoneSchema, updateMilestoneSchema } from "../types/index.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

const router = Router();

router.use(authMiddleware);

// GET /api/milestones/assignment/:assignmentId
router.get("/assignment/:assignmentId", async (req, res, next) => {
    try {
        const milestones = await milestonesService.getByAssignment(
            req.params.assignmentId,
            req.user!.id
        );
        sendSuccess(res, milestones);
    } catch (error: any) {
        if (error.message === "Assignment not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

// POST /api/milestones/assignment/:assignmentId
router.post(
    "/assignment/:assignmentId",
    validate(createMilestoneSchema),
    async (req, res, next) => {
        try {
            const milestone = await milestonesService.create(
                req.params.assignmentId,
                req.user!.id,
                req.body
            );
            sendSuccess(res, milestone, 201);
        } catch (error: any) {
            if (error.message === "Assignment not found") {
                sendError(res, error.message, 404);
            } else {
                next(error);
            }
        }
    }
);

// PUT /api/milestones/:id
router.put("/:id", validate(updateMilestoneSchema), async (req, res, next) => {
    try {
        const result = await milestonesService.update(req.params.id, req.user!.id, req.body);
        sendSuccess(res, result);
    } catch (error: any) {
        if (error.message === "Milestone not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

// PUT /api/milestones/:id/toggle
router.put("/:id/toggle", async (req, res, next) => {
    try {
        const result = await milestonesService.toggle(req.params.id, req.user!.id);
        sendSuccess(res, result);
    } catch (error: any) {
        if (error.message === "Milestone not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

// DELETE /api/milestones/:id
router.delete("/:id", async (req, res, next) => {
    try {
        await milestonesService.delete(req.params.id, req.user!.id);
        sendSuccess(res, { deleted: true });
    } catch (error: any) {
        if (error.message === "Milestone not found") {
            sendError(res, error.message, 404);
        } else {
            next(error);
        }
    }
});

export default router;
