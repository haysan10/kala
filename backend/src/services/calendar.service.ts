/**
 * Calendar Service
 * 
 * Handles CRUD for calendar events, auto-generation from assignments/milestones,
 * and event-task synchronization
 */

import { eq, and, gte, lte, or, desc, asc } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
    calendarEvents,
    assignments,
    milestones,
    courses,
    miniCourses,
    scaffoldingTasks,
    CalendarEvent,
    NewCalendarEvent,
} from '../db/schema.js';

// ==================== TYPES ====================

export interface CalendarEventWithDetails extends CalendarEvent {
    assignment?: {
        id: string;
        title: string;
        course: string | null;
        overallProgress: number | null;
    };
    milestone?: {
        id: string;
        title: string;
        status: string | null;
    };
    course?: {
        id: string;
        name: string;
        color: string | null;
    };
}

export interface CreateEventInput {
    userId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    allDay?: boolean;
    type?: string;
    color?: string;
    assignmentId?: string;
    milestoneId?: string;
    courseId?: string;
    status?: string;
}

export interface DateRange {
    start: string;
    end: string;
}

// ==================== EVENT CRUD ====================

/**
 * Get events for a user within a date range
 */
export async function getEvents(
    userId: string,
    range?: DateRange
): Promise<CalendarEventWithDetails[]> {
    let conditions = [eq(calendarEvents.userId, userId)];

    if (range) {
        conditions.push(
            or(
                and(
                    gte(calendarEvents.startTime, range.start),
                    lte(calendarEvents.startTime, range.end)
                ),
                and(
                    gte(calendarEvents.endTime, range.start),
                    lte(calendarEvents.endTime, range.end)
                )
            )!
        );
    }

    const events = await db
        .select()
        .from(calendarEvents)
        .where(and(...conditions))
        .orderBy(asc(calendarEvents.startTime));

    // Fetch related data for each event
    const results: CalendarEventWithDetails[] = [];

    for (const event of events) {
        const eventWithDetails: CalendarEventWithDetails = { ...event };

        if (event.assignmentId) {
            const [assignment] = await db
                .select({
                    id: assignments.id,
                    title: assignments.title,
                    course: assignments.course,
                    overallProgress: assignments.overallProgress,
                })
                .from(assignments)
                .where(eq(assignments.id, event.assignmentId));
            if (assignment) eventWithDetails.assignment = assignment;
        }

        if (event.milestoneId) {
            const [milestone] = await db
                .select({
                    id: milestones.id,
                    title: milestones.title,
                    status: milestones.status,
                })
                .from(milestones)
                .where(eq(milestones.id, event.milestoneId));
            if (milestone) eventWithDetails.milestone = milestone;
        }

        if (event.courseId) {
            const [course] = await db
                .select({
                    id: courses.id,
                    name: courses.name,
                    color: courses.color,
                })
                .from(courses)
                .where(eq(courses.id, event.courseId));
            if (course) eventWithDetails.course = course;
        }

        results.push(eventWithDetails);
    }

    return results;
}

/**
 * Get a single event
 */
export async function getEvent(eventId: string): Promise<CalendarEventWithDetails | null> {
    const [event] = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.id, eventId));

    if (!event) return null;

    const eventWithDetails: CalendarEventWithDetails = { ...event };

    if (event.assignmentId) {
        const [assignment] = await db
            .select({
                id: assignments.id,
                title: assignments.title,
                course: assignments.course,
                overallProgress: assignments.overallProgress,
            })
            .from(assignments)
            .where(eq(assignments.id, event.assignmentId));
        if (assignment) eventWithDetails.assignment = assignment;
    }

    if (event.milestoneId) {
        const [milestone] = await db
            .select({
                id: milestones.id,
                title: milestones.title,
                status: milestones.status,
            })
            .from(milestones)
            .where(eq(milestones.id, event.milestoneId));
        if (milestone) eventWithDetails.milestone = milestone;
    }

    return eventWithDetails;
}

/**
 * Create a new event
 */
export async function createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    const [event] = await db
        .insert(calendarEvents)
        .values({
            userId: input.userId,
            title: input.title,
            description: input.description,
            startTime: input.startTime,
            endTime: input.endTime,
            allDay: input.allDay ?? false,
            type: input.type ?? 'custom',
            color: input.color ?? '#3B82F6',
            assignmentId: input.assignmentId,
            milestoneId: input.milestoneId,
            courseId: input.courseId,
            status: input.status ?? 'scheduled',
        })
        .returning();

    return event;
}

/**
 * Update an event
 */
export async function updateEvent(
    eventId: string,
    data: Partial<NewCalendarEvent>
): Promise<CalendarEvent | null> {
    const [event] = await db
        .update(calendarEvents)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(calendarEvents.id, eventId))
        .returning();

    return event || null;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
    const result = await db
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, eventId));

    return true;
}

/**
 * Mark event as completed
 */
export async function completeEvent(eventId: string): Promise<CalendarEvent | null> {
    return updateEvent(eventId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
    });
}

// ==================== AUTO-GENERATION ====================

/**
 * Generate calendar events from an assignment's deadline
 */
export async function generateAssignmentDeadlineEvent(
    assignmentId: string,
    userId: string
): Promise<CalendarEvent | null> {
    const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, assignmentId));

    if (!assignment?.deadline) return null;

    // Check if event already exists
    const existing = await db
        .select()
        .from(calendarEvents)
        .where(
            and(
                eq(calendarEvents.assignmentId, assignmentId),
                eq(calendarEvents.type, 'assignment_deadline')
            )
        );

    if (existing.length > 0) {
        // Update existing event
        return updateEvent(existing[0].id, {
            title: `📌 Due: ${assignment.title}`,
            startTime: assignment.deadline,
            status: assignment.atRisk ? 'at_risk' : 'scheduled',
        });
    }

    // Create new event
    return createEvent({
        userId,
        title: `📌 Due: ${assignment.title}`,
        startTime: assignment.deadline,
        allDay: true,
        type: 'assignment_deadline',
        color: assignment.atRisk ? '#EF4444' : '#8B5CF6',
        assignmentId,
        courseId: assignment.courseId || undefined,
    });
}

/**
 * Generate calendar events from all milestones of an assignment
 */
export async function generateMilestoneEvents(
    assignmentId: string,
    userId: string
): Promise<CalendarEvent[]> {
    const assignmentMilestones = await db
        .select()
        .from(milestones)
        .where(eq(milestones.assignmentId, assignmentId));

    const events: CalendarEvent[] = [];

    for (const milestone of assignmentMilestones) {
        if (!milestone.deadline) continue;

        // Check if event already exists
        const existing = await db
            .select()
            .from(calendarEvents)
            .where(
                and(
                    eq(calendarEvents.milestoneId, milestone.id),
                    eq(calendarEvents.type, 'milestone')
                )
            );

        if (existing.length > 0) {
            // Update existing
            const updated = await updateEvent(existing[0].id, {
                title: milestone.title,
                startTime: milestone.deadline,
                status: milestone.status === 'completed' ? 'completed' : 'scheduled',
            });
            if (updated) events.push(updated);
        } else {
            // Create new
            const event = await createEvent({
                userId,
                title: milestone.title,
                startTime: milestone.deadline,
                allDay: true,
                type: 'milestone',
                color: '#10B981',
                assignmentId,
                milestoneId: milestone.id,
            });
            events.push(event);
        }
    }

    return events;
}

/**
 * Generate calendar events from mini course formative actions
 */
export async function generateMiniCourseTaskEvents(
    assignmentId: string,
    userId: string
): Promise<CalendarEvent[]> {
    const mstones = await db
        .select()
        .from(milestones)
        .where(eq(milestones.assignmentId, assignmentId));

    const events: CalendarEvent[] = [];

    for (const mstone of mstones) {
        const [miniCourse] = await db
            .select()
            .from(miniCourses)
            .where(eq(miniCourses.milestoneId, mstone.id));

        if (!miniCourse || !miniCourse.formativeAction) continue;

        // Use milestone deadline or milestone date - 1 day for the task
        let taskTime = mstone.deadline;
        if (taskTime) {
            const date = new Date(taskTime);
            date.setDate(date.getDate() - 1);
            date.setHours(10, 0, 0, 0);
            taskTime = date.toISOString();
        } else {
            // If no deadline, skip for now or use created_at + 1 day
            continue;
        }

        // Check if event already exists
        const existing = await db
            .select()
            .from(calendarEvents)
            .where(
                and(
                    eq(calendarEvents.milestoneId, mstone.id),
                    eq(calendarEvents.type, 'mini_course_task')
                )
            );

        if (existing.length > 0) {
            const updated = await updateEvent(existing[0].id, {
                title: `🛠️ Practice: ${mstone.title}`,
                startTime: taskTime,
                status: miniCourse.formativeTaskCompleted ? 'completed' : 'scheduled',
            });
            if (updated) events.push(updated);
        } else {
            const event = await createEvent({
                userId,
                title: `🛠️ Practice: ${mstone.title}`,
                description: miniCourse.formativeAction,
                startTime: taskTime,
                type: 'mini_course_task',
                color: '#F59E0B',
                assignmentId,
                milestoneId: mstone.id,
            });
            events.push(event);
        }
    }

    return events;
}

/**
 * Generate calendar events from scaffolding tasks
 */
export async function generateScaffoldingTaskEvents(
    assignmentId: string,
    userId: string
): Promise<CalendarEvent[]> {
    const sTasks = await db
        .select()
        .from(scaffoldingTasks)
        .where(eq(scaffoldingTasks.assignmentId, assignmentId));

    const events: CalendarEvent[] = [];

    for (const task of sTasks) {
        // Find a suitable time: created_at or relative to assignment
        const taskTime = task.createdAt || new Date().toISOString();

        // Check if event already exists
        const existing = await db
            .select()
            .from(calendarEvents)
            .where(
                and(
                    eq(calendarEvents.description, task.instruction), // Use instruction as unique identifier for generated tasks
                    eq(calendarEvents.type, 'study_session'),
                    eq(calendarEvents.assignmentId, assignmentId)
                )
            );

        if (existing.length > 0) {
            const updated = await updateEvent(existing[0].id, {
                status: task.completed ? 'completed' : 'scheduled',
            });
            if (updated) events.push(updated);
        } else {
            const event = await createEvent({
                userId,
                title: `🚀 Sprint: ${task.instruction.substring(0, 30)}...`,
                description: task.instruction,
                startTime: taskTime,
                type: 'study_session',
                color: '#3B82F6',
                assignmentId,
            });
            events.push(event);
        }
    }

    return events;
}

/**
 * Sync all events for a user's assignments
 */
export async function syncUserEvents(userId: string): Promise<{
    assignmentEvents: number;
    milestoneEvents: number;
    miniCourseEvents: number;
    scaffoldingEvents: number;
}> {
    const userAssignments = await db
        .select()
        .from(assignments)
        .where(eq(assignments.userId, userId));

    let assignmentEvents = 0;
    let milestoneEvents = 0;
    let miniCourseEvents = 0;
    let scaffoldingEvents = 0;

    for (const assignment of userAssignments) {
        const deadlineEvent = await generateAssignmentDeadlineEvent(assignment.id, userId);
        if (deadlineEvent) assignmentEvents++;

        const mEvents = await generateMilestoneEvents(assignment.id, userId);
        milestoneEvents += mEvents.length;

        const mcEvents = await generateMiniCourseTaskEvents(assignment.id, userId);
        miniCourseEvents += mcEvents.length;

        const sEvents = await generateScaffoldingTaskEvents(assignment.id, userId);
        scaffoldingEvents += sEvents.length;
    }

    return {
        assignmentEvents,
        milestoneEvents,
        miniCourseEvents,
        scaffoldingEvents
    };
}

// ==================== UPCOMING EVENTS ====================

/**
 * Get upcoming events for dashboard widget
 */
export async function getUpcomingEvents(
    userId: string,
    limit: number = 5
): Promise<CalendarEventWithDetails[]> {
    const now = new Date().toISOString();

    const events = await db
        .select()
        .from(calendarEvents)
        .where(
            and(
                eq(calendarEvents.userId, userId),
                gte(calendarEvents.startTime, now),
                eq(calendarEvents.isVisible, true)
            )
        )
        .orderBy(asc(calendarEvents.startTime))
        .limit(limit);

    // Fetch related data
    const results: CalendarEventWithDetails[] = [];
    for (const event of events) {
        const eventWithDetails: CalendarEventWithDetails = { ...event };

        if (event.assignmentId) {
            const [assignment] = await db
                .select({
                    id: assignments.id,
                    title: assignments.title,
                    course: assignments.course,
                    overallProgress: assignments.overallProgress,
                })
                .from(assignments)
                .where(eq(assignments.id, event.assignmentId));
            if (assignment) eventWithDetails.assignment = assignment;
        }

        results.push(eventWithDetails);
    }

    return results;
}

/**
 * Get overdue events
 */
export async function getOverdueEvents(userId: string): Promise<CalendarEventWithDetails[]> {
    const now = new Date().toISOString();

    const events = await db
        .select()
        .from(calendarEvents)
        .where(
            and(
                eq(calendarEvents.userId, userId),
                lte(calendarEvents.startTime, now),
                eq(calendarEvents.status, 'scheduled'),
                or(
                    eq(calendarEvents.type, 'assignment_deadline'),
                    eq(calendarEvents.type, 'milestone')
                )
            )
        )
        .orderBy(desc(calendarEvents.startTime));

    return events;
}

export const calendarService = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    generateAssignmentDeadlineEvent,
    generateMilestoneEvents,
    syncUserEvents,
    getUpcomingEvents,
    getOverdueEvents,
};
