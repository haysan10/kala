import { db } from "../config/database.js";
import { assignments, milestones } from "../db/schema.js";
import { eq, desc, asc, and } from "drizzle-orm";
import type { CreateAssignmentInput, UpdateAssignmentInput } from "../types/index.js";
import { parseJsonField, stringifyJsonField } from "../utils/helpers.js";

export class AssignmentsService {
    async getAll(userId: string) {
        const results = await db
            .select()
            .from(assignments)
            .where(eq(assignments.userId, userId))
            .orderBy(desc(assignments.createdAt));

        return results.map(this.formatAssignment);
    }

    async getById(id: string, userId: string) {
        const [assignment] = await db
            .select()
            .from(assignments)
            .where(and(eq(assignments.id, id), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        // Get milestones
        const assignmentMilestones = await db
            .select()
            .from(milestones)
            .where(eq(milestones.assignmentId, id))
            .orderBy(asc(milestones.sortOrder));

        return {
            ...this.formatAssignment(assignment),
            milestones: assignmentMilestones,
        };
    }

    async create(userId: string, input: CreateAssignmentInput) {
        const [assignment] = await db
            .insert(assignments)
            .values({
                userId,
                title: input.title,
                description: input.description,
                learningOutcome: input.learningOutcome,
                deadline: input.deadline,
                course: input.course || "General",
                tags: stringifyJsonField(input.tags),
                rubrics: stringifyJsonField(input.rubrics),
                diagnosticQuestions: stringifyJsonField(input.diagnosticQuestions),
            })
            .returning();

        // Create milestones if provided
        if (input.milestones && input.milestones.length > 0) {
            await db.insert(milestones).values(
                input.milestones.map((m, index) => ({
                    assignmentId: assignment.id,
                    title: m.title,
                    description: m.description,
                    estimatedMinutes: m.estimatedMinutes || 30,
                    deadline: m.deadline,
                    sortOrder: index,
                }))
            );
        }

        return this.getById(assignment.id, userId);
    }

    async update(id: string, userId: string, input: UpdateAssignmentInput) {
        // Verify ownership
        const [existing] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, id), eq(assignments.userId, userId)))
            .limit(1);

        if (!existing) {
            throw new Error("Assignment not found");
        }

        const updateData: Record<string, unknown> = {};

        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.learningOutcome !== undefined) updateData.learningOutcome = input.learningOutcome;
        if (input.deadline !== undefined) updateData.deadline = input.deadline;
        if (input.course !== undefined) updateData.course = input.course;
        if (input.tags !== undefined) updateData.tags = stringifyJsonField(input.tags);
        if (input.rubrics !== undefined) updateData.rubrics = stringifyJsonField(input.rubrics);
        if (input.overallProgress !== undefined) updateData.overallProgress = input.overallProgress;
        if (input.atRisk !== undefined) updateData.atRisk = input.atRisk;
        if (input.clarityScore !== undefined) updateData.clarityScore = input.clarityScore;
        if (input.summativeReflection !== undefined) updateData.summativeReflection = input.summativeReflection;

        updateData.updatedAt = new Date().toISOString();

        await db.update(assignments).set(updateData).where(eq(assignments.id, id));

        return this.getById(id, userId);
    }

    async delete(id: string, userId: string) {
        const [existing] = await db
            .select({ id: assignments.id })
            .from(assignments)
            .where(and(eq(assignments.id, id), eq(assignments.userId, userId)))
            .limit(1);

        if (!existing) {
            throw new Error("Assignment not found");
        }

        await db.delete(assignments).where(eq(assignments.id, id));
        return { deleted: true };
    }

    async recalculateProgress(assignmentId: string) {
        const assignmentMilestones = await db
            .select({ status: milestones.status })
            .from(milestones)
            .where(eq(milestones.assignmentId, assignmentId));

        if (assignmentMilestones.length === 0) {
            return 0;
        }

        const completed = assignmentMilestones.filter(m => m.status === "completed").length;
        const progress = Math.round((completed / assignmentMilestones.length) * 100);

        await db
            .update(assignments)
            .set({ overallProgress: progress, updatedAt: new Date().toISOString() })
            .where(eq(assignments.id, assignmentId));

        return progress;
    }

    private formatAssignment(a: typeof assignments.$inferSelect) {
        return {
            ...a,
            tags: parseJsonField<string[]>(a.tags),
            rubrics: parseJsonField<string[]>(a.rubrics),
            diagnosticQuestions: parseJsonField<string[]>(a.diagnosticQuestions),
            diagnosticResponses: parseJsonField<Record<string, string>>(a.diagnosticResponses),
        };
    }
}

export const assignmentsService = new AssignmentsService();
