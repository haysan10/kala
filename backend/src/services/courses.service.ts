/**
 * Courses Service
 * 
 * Manages course/matakuliah data with full CRUD operations
 * Includes statistics calculation and assignment linking
 */

import { db } from "../config/database.js";
import { courses, assignments, Course, NewCourse } from "../db/schema.js";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";

export interface CourseWithStats extends Course {
    assignmentCount: number;
    completedCount: number;
    inProgressCount: number;
    overallProgress: number;
}

export interface CreateCourseInput {
    name: string;
    code?: string;
    description?: string;
    color?: string;
    icon?: string;
    semester?: string;
    instructor?: string;
    credits?: number;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
    isArchived?: boolean;
    sortOrder?: number;
    coverImage?: string | null;
}

class CoursesService {
    /**
     * Get all courses for a user
     */
    async getAll(userId: string, includeArchived: boolean = false): Promise<CourseWithStats[]> {
        const whereClause = includeArchived
            ? eq(courses.userId, userId)
            : and(eq(courses.userId, userId), eq(courses.isArchived, false));

        const userCourses = await db
            .select()
            .from(courses)
            .where(whereClause)
            .orderBy(asc(courses.sortOrder), desc(courses.createdAt));

        // Get stats for each course
        const coursesWithStats: CourseWithStats[] = await Promise.all(
            userCourses.map(async (course) => {
                const stats = await this.getCourseStats(course.id);
                return { ...course, ...stats };
            })
        );

        return coursesWithStats;
    }

    /**
     * Get a single course by ID
     */
    async getById(courseId: string, userId: string): Promise<CourseWithStats | null> {
        const [course] = await db
            .select()
            .from(courses)
            .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
            .limit(1);

        if (!course) return null;

        const stats = await this.getCourseStats(course.id);
        return { ...course, ...stats };
    }

    /**
     * Create a new course
     */
    async create(userId: string, input: CreateCourseInput): Promise<Course> {
        // Get current max sort order
        const [maxOrder] = await db
            .select({ max: sql<number>`MAX(${courses.sortOrder})` })
            .from(courses)
            .where(eq(courses.userId, userId));

        const sortOrder = (maxOrder?.max ?? -1) + 1;

        const [course] = await db
            .insert(courses)
            .values({
                userId,
                name: input.name,
                code: input.code,
                description: input.description,
                color: input.color || this.getRandomColor(),
                icon: input.icon || "📚",
                semester: input.semester,
                instructor: input.instructor,
                credits: input.credits,
                sortOrder,
            })
            .returning();

        return course;
    }

    /**
     * Update a course
     */
    async update(courseId: string, userId: string, input: UpdateCourseInput): Promise<Course | null> {
        const [updated] = await db
            .update(courses)
            .set({
                ...input,
                updatedAt: new Date().toISOString(),
            })
            .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
            .returning();

        return updated || null;
    }

    /**
     * Delete a course
     * Assignments linked to this course will have courseId set to null
     */
    async delete(courseId: string, userId: string): Promise<boolean> {
        const result = await db
            .delete(courses)
            .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
            .returning({ id: courses.id });

        return result.length > 0;
    }

    /**
     * Archive/unarchive a course
     */
    async toggleArchive(courseId: string, userId: string): Promise<Course | null> {
        const [course] = await db
            .select()
            .from(courses)
            .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
            .limit(1);

        if (!course) return null;

        const [updated] = await db
            .update(courses)
            .set({
                isArchived: !course.isArchived,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(courses.id, courseId))
            .returning();

        return updated;
    }

    /**
     * Reorder courses
     */
    async reorder(userId: string, courseIds: string[]): Promise<void> {
        await Promise.all(
            courseIds.map((id, index) =>
                db
                    .update(courses)
                    .set({ sortOrder: index })
                    .where(and(eq(courses.id, id), eq(courses.userId, userId)))
            )
        );
    }

    /**
     * Get course statistics
     */
    async getCourseStats(courseId: string): Promise<{
        assignmentCount: number;
        completedCount: number;
        inProgressCount: number;
        overallProgress: number;
    }> {
        const courseAssignments = await db
            .select({
                overallProgress: assignments.overallProgress,
            })
            .from(assignments)
            .where(eq(assignments.courseId, courseId));

        const assignmentCount = courseAssignments.length;
        const completedCount = courseAssignments.filter((a) => (a.overallProgress ?? 0) >= 100).length;
        const inProgressCount = courseAssignments.filter(
            (a) => (a.overallProgress ?? 0) > 0 && (a.overallProgress ?? 0) < 100
        ).length;

        const totalProgress = courseAssignments.reduce((sum, a) => sum + (a.overallProgress ?? 0), 0);
        const overallProgress = assignmentCount > 0 ? Math.round(totalProgress / assignmentCount) : 0;

        return {
            assignmentCount,
            completedCount,
            inProgressCount,
            overallProgress,
        };
    }

    /**
     * Get assignments for a course
     */
    async getAssignments(courseId: string, userId: string) {
        return db
            .select()
            .from(assignments)
            .where(and(eq(assignments.courseId, courseId), eq(assignments.userId, userId)))
            .orderBy(desc(assignments.createdAt));
    }

    /**
     * Link an assignment to a course
     */
    async linkAssignment(assignmentId: string, courseId: string | null, userId: string): Promise<boolean> {
        // Verify ownership
        const [assignment] = await db
            .select()
            .from(assignments)
            .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) return false;

        // If courseId is provided, verify it exists and belongs to user
        if (courseId) {
            const [course] = await db
                .select()
                .from(courses)
                .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
                .limit(1);

            if (!course) return false;
        }

        await db
            .update(assignments)
            .set({
                courseId,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(assignments.id, assignmentId));

        // Update course stats
        if (courseId) {
            await this.updateCourseStats(courseId);
        }
        if (assignment.courseId && assignment.courseId !== courseId) {
            await this.updateCourseStats(assignment.courseId);
        }

        return true;
    }

    /**
     * Update course statistics (cached values)
     */
    async updateCourseStats(courseId: string): Promise<void> {
        const stats = await this.getCourseStats(courseId);

        await db
            .update(courses)
            .set({
                totalAssignments: stats.assignmentCount,
                completedAssignments: stats.completedCount,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(courses.id, courseId));
    }

    /**
     * Get random color for new courses
     */
    private getRandomColor(): string {
        const colors = [
            "#6366f1", // Indigo
            "#8b5cf6", // Purple  
            "#ec4899", // Pink
            "#ef4444", // Red
            "#f97316", // Orange
            "#eab308", // Yellow
            "#22c55e", // Green
            "#14b8a6", // Teal
            "#06b6d4", // Cyan
            "#3b82f6", // Blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get emoji suggestions for academic subjects
     */
    getIconSuggestions(): { emoji: string; subjects: string[] }[] {
        return [
            { emoji: "📐", subjects: ["Matematika", "Kalkulus", "Statistik", "Aljabar"] },
            { emoji: "🧪", subjects: ["Kimia", "Biologi", "Fisika", "Sains"] },
            { emoji: "💻", subjects: ["Komputer", "Pemrograman", "IT", "Software"] },
            { emoji: "📚", subjects: ["Sastra", "Bahasa", "Literatur"] },
            { emoji: "🌍", subjects: ["Geografi", "IPS", "Sejarah", "Sosiologi"] },
            { emoji: "💼", subjects: ["Ekonomi", "Bisnis", "Manajemen", "Akuntansi"] },
            { emoji: "⚖️", subjects: ["Hukum", "PKN", "Civic"] },
            { emoji: "🎨", subjects: ["Seni", "Desain", "Musik"] },
            { emoji: "🏥", subjects: ["Kedokteran", "Kesehatan", "Farmasi"] },
            { emoji: "🕌", subjects: ["Agama", "Islam", "Bahasa Arab", "Fiqh"] },
            { emoji: "🔬", subjects: ["Penelitian", "Metodologi", "Riset"] },
            { emoji: "📝", subjects: ["Umum", "Lainnya", "General"] },
        ];
    }
}

export const coursesService = new CoursesService();
