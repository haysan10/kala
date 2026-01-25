import { db } from "../config/database.js";
import { milestones, assignments } from "../db/schema.js";
import { eq, and, asc } from "drizzle-orm";
import { assignmentsService } from "./assignments.service.js";
import type { CreateMilestoneInput, UpdateMilestoneInput } from "../types/index.js";

export class MilestonesService {
    async getByAssignment(assignmentId: string, userId: string) {
        // Verify assignment ownership
        const [assignment] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        return db
            .select()
            .from(milestones)
            .where(eq(milestones.assignmentId, assignmentId))
            .orderBy(asc(milestones.sortOrder));
    }

    async create(assignmentId: string, userId: string, input: CreateMilestoneInput) {
        // Verify assignment ownership
        const [assignment] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        // Get current max sort order
        const existing = await db
            .select({ sortOrder: milestones.sortOrder })
            .from(milestones)
            .where(eq(milestones.assignmentId, assignmentId))
            .orderBy(asc(milestones.sortOrder));

        const maxOrder = existing.length > 0 ? Math.max(...existing.map(m => m.sortOrder || 0)) : -1;

        const [milestone] = await db
            .insert(milestones)
            .values({
                assignmentId,
                title: input.title,
                description: input.description,
                estimatedMinutes: input.estimatedMinutes || 30,
                deadline: input.deadline,
                sortOrder: maxOrder + 1,
            })
            .returning();

        return milestone;
    }

    async update(id: string, userId: string, input: UpdateMilestoneInput) {
        // Verify ownership through assignment
        const [milestone] = await db
            .select({
                id: milestones.id,
                assignmentId: milestones.assignmentId,
            })
            .from(milestones)
            .where(eq(milestones.id, id))
            .limit(1);

        if (!milestone) {
            throw new Error("Milestone not found");
        }

        const [assignment] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, milestone.assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Milestone not found");
        }

        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.estimatedMinutes !== undefined) updateData.estimatedMinutes = input.estimatedMinutes;
        if (input.deadline !== undefined) updateData.deadline = input.deadline;
        if (input.status !== undefined) updateData.status = input.status;
        updateData.updatedAt = new Date().toISOString();

        const [updated] = await db
            .update(milestones)
            .set(updateData)
            .where(eq(milestones.id, id))
            .returning();

        // Recalculate assignment progress
        const progress = await assignmentsService.recalculateProgress(milestone.assignmentId);

        return { milestone: updated, assignmentProgress: progress };
    }

    async toggle(id: string, userId: string) {
        const [milestone] = await db
            .select()
            .from(milestones)
            .where(eq(milestones.id, id))
            .limit(1);

        if (!milestone) {
            throw new Error("Milestone not found");
        }

        // Verify ownership
        const [assignment] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, milestone.assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Milestone not found");
        }

        const newStatus = milestone.status === "completed" ? "todo" : "completed";

        const [updated] = await db
            .update(milestones)
            .set({ status: newStatus, updatedAt: new Date().toISOString() })
            .where(eq(milestones.id, id))
            .returning();

        const progress = await assignmentsService.recalculateProgress(milestone.assignmentId);

        return { milestone: updated, assignmentProgress: progress };
    }

    async delete(id: string, userId: string) {
        const [milestone] = await db
            .select({ assignmentId: milestones.assignmentId })
            .from(milestones)
            .where(eq(milestones.id, id))
            .limit(1);

        if (!milestone) {
            throw new Error("Milestone not found");
        }

        // Verify ownership
        const [assignment] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, milestone.assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Milestone not found");
        }

        await db.delete(milestones).where(eq(milestones.id, id));

        // Recalculate progress
        await assignmentsService.recalculateProgress(milestone.assignmentId);

        return { deleted: true };
    }
}

export const milestonesService = new MilestonesService();
