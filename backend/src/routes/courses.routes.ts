/**
 * Courses Routes
 * 
 * API endpoints for course/matakuliah management
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { sendSuccess, sendError } from "../utils/helpers.js";
import { coursesService } from "../services/courses.service.js";
import { z } from "zod";

const router = Router();

router.use(authMiddleware);

// Validation schemas
const createCourseSchema = z.object({
    name: z.string().min(1, "Course name is required").max(100),
    code: z.string().max(20).optional(),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
    icon: z.string().max(10).optional(),
    semester: z.string().max(50).optional(),
    instructor: z.string().max(100).optional(),
    credits: z.number().int().min(1).max(10).optional(),
});

const updateCourseSchema = createCourseSchema.partial().extend({
    isArchived: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    coverImage: z.string().url().optional().nullable(),
});

const reorderSchema = z.object({
    courseIds: z.array(z.string().uuid()),
});

const linkAssignmentSchema = z.object({
    courseId: z.string().uuid().nullable(),
});

// ==================== ROUTES ====================

/**
 * GET /api/courses - Get all courses for user
 * Query params: includeArchived (boolean)
 */
router.get("/", async (req, res, next) => {
    try {
        const includeArchived = req.query.includeArchived === "true";
        const courses = await coursesService.getAll(req.user!.id, includeArchived);
        sendSuccess(res, courses);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/courses/icons - Get icon suggestions
 */
router.get("/icons", async (req, res, next) => {
    try {
        const suggestions = coursesService.getIconSuggestions();
        sendSuccess(res, suggestions);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/courses/:id - Get a single course
 */
router.get("/:id", async (req, res, next) => {
    try {
        const course = await coursesService.getById(req.params.id, req.user!.id);

        if (!course) {
            sendError(res, "Course not found", 404);
            return;
        }

        sendSuccess(res, course);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/courses/:id/assignments - Get assignments for a course
 */
router.get("/:id/assignments", async (req, res, next) => {
    try {
        const assignments = await coursesService.getAssignments(req.params.id, req.user!.id);
        sendSuccess(res, assignments);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/courses - Create a new course
 */
router.post("/", async (req, res, next) => {
    try {
        const parsed = createCourseSchema.safeParse(req.body);

        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        const course = await coursesService.create(req.user!.id, parsed.data);
        sendSuccess(res, course, 201);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/courses/:id - Update a course
 */
router.put("/:id", async (req, res, next) => {
    try {
        const parsed = updateCourseSchema.safeParse(req.body);

        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        const course = await coursesService.update(req.params.id, req.user!.id, parsed.data);

        if (!course) {
            sendError(res, "Course not found", 404);
            return;
        }

        sendSuccess(res, course);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/courses/:id - Delete a course
 */
router.delete("/:id", async (req, res, next) => {
    try {
        const deleted = await coursesService.delete(req.params.id, req.user!.id);

        if (!deleted) {
            sendError(res, "Course not found", 404);
            return;
        }

        sendSuccess(res, { message: "Course deleted successfully" });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/courses/:id/archive - Toggle archive status
 */
router.post("/:id/archive", async (req, res, next) => {
    try {
        const course = await coursesService.toggleArchive(req.params.id, req.user!.id);

        if (!course) {
            sendError(res, "Course not found", 404);
            return;
        }

        sendSuccess(res, course);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/courses/reorder - Reorder courses
 */
router.post("/reorder", async (req, res, next) => {
    try {
        const parsed = reorderSchema.safeParse(req.body);

        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        await coursesService.reorder(req.user!.id, parsed.data.courseIds);
        sendSuccess(res, { message: "Courses reordered successfully" });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/courses/link-assignment/:assignmentId - Link/unlink assignment to course
 */
router.post("/link-assignment/:assignmentId", async (req, res, next) => {
    try {
        const parsed = linkAssignmentSchema.safeParse(req.body);

        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        const success = await coursesService.linkAssignment(
            req.params.assignmentId,
            parsed.data.courseId,
            req.user!.id
        );

        if (!success) {
            sendError(res, "Assignment or course not found", 404);
            return;
        }

        sendSuccess(res, { message: "Assignment linked successfully" });
    } catch (error) {
        next(error);
    }
});

export default router;
