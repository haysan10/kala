/**
 * Calendar API Service
 * 
 * Frontend API client for calendar events
 */

import api from './api';

// ==================== TYPES ====================

export interface CalendarEvent {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    allDay: boolean;
    type: string; // custom, assignment_deadline, milestone, study_session
    color: string;
    assignmentId: string | null;
    milestoneId: string | null;
    courseId: string | null;
    status: string; // scheduled, in_progress, completed, cancelled
    isRecurring: boolean;
    recurrenceRule: string | null;
    completedAt: string | null;
    isVisible: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string | null;
    // Related data
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
}

export interface DateRange {
    start: string;
    end: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get calendar events with optional date range
 */
export async function getEvents(range?: DateRange): Promise<CalendarEvent[]> {
    const params: Record<string, string> = {};
    if (range) {
        params.start = range.start;
        params.end = range.end;
    }
    const response = await api.get<{ data: CalendarEvent[] }>('/api/calendar/events', { params });
    return response.data.data;
}

/**
 * Get upcoming events for dashboard
 */
export async function getUpcomingEvents(limit: number = 5): Promise<CalendarEvent[]> {
    const response = await api.get<{ data: CalendarEvent[] }>('/api/calendar/events/upcoming', {
        params: { limit },
    });
    return response.data.data;
}

/**
 * Get overdue events
 */
export async function getOverdueEvents(): Promise<CalendarEvent[]> {
    const response = await api.get<{ data: CalendarEvent[] }>('/api/calendar/events/overdue');
    return response.data.data;
}

/**
 * Get single event
 */
export async function getEvent(eventId: string): Promise<CalendarEvent> {
    const response = await api.get<{ data: CalendarEvent }>(`/api/calendar/events/${eventId}`);
    return response.data.data;
}

/**
 * Create a new event
 */
export async function createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    const response = await api.post<{ data: CalendarEvent }>('/api/calendar/events', input);
    return response.data.data;
}

/**
 * Update an event
 */
export async function updateEvent(
    eventId: string,
    data: Partial<CreateEventInput & { status: string }>
): Promise<CalendarEvent> {
    const response = await api.patch<{ data: CalendarEvent }>(`/api/calendar/events/${eventId}`, data);
    return response.data.data;
}

/**
 * Mark event as completed
 */
export async function completeEvent(eventId: string): Promise<CalendarEvent> {
    const response = await api.post<{ data: CalendarEvent }>(`/api/calendar/events/${eventId}/complete`);
    return response.data.data;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/api/calendar/events/${eventId}`);
}

/**
 * Sync all events from assignments/milestones
 */
export async function syncEvents(): Promise<{ assignmentEvents: number; milestoneEvents: number }> {
    const response = await api.post<{ data: { assignmentEvents: number; milestoneEvents: number } }>(
        '/api/calendar/sync'
    );
    return response.data.data;
}

/**
 * Sync events for a specific assignment
 */
export async function syncAssignmentEvents(assignmentId: string): Promise<{
    deadlineEvent: CalendarEvent | null;
    milestoneEvents: CalendarEvent[];
}> {
    const response = await api.post<{
        data: { deadlineEvent: CalendarEvent | null; milestoneEvents: CalendarEvent[] };
    }>(`/api/calendar/sync/${assignmentId}`);
    return response.data.data;
}

// ==================== HELPERS ====================

/**
 * Get color for event type
 */
export function getEventTypeColor(type: string): string {
    switch (type) {
        case 'assignment_deadline':
            return '#8B5CF6'; // Purple
        case 'milestone':
            return '#10B981'; // Green
        case 'study_session':
            return '#3B82F6'; // Blue
        case 'mini_course_task':
            return '#F59E0B'; // Amber
        default:
            return '#6B7280'; // Gray
    }
}

/**
 * Get icon for event type
 */
export function getEventTypeIcon(type: string): string {
    switch (type) {
        case 'assignment_deadline':
            return '📌';
        case 'milestone':
            return '🎯';
        case 'study_session':
            return '📖';
        case 'mini_course_task':
            return '📝';
        default:
            return '📅';
    }
}

/**
 * Format event time for display
 */
export function formatEventTime(event: CalendarEvent): string {
    if (event.allDay) return 'All day';

    const start = new Date(event.startTime);
    const format = (d: Date) =>
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (event.endTime) {
        const end = new Date(event.endTime);
        return `${format(start)} - ${format(end)}`;
    }

    return format(start);
}

/**
 * Check if event is today
 */
export function isEventToday(event: CalendarEvent): boolean {
    const today = new Date();
    const eventDate = new Date(event.startTime);
    return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if event is overdue
 */
export function isEventOverdue(event: CalendarEvent): boolean {
    if (event.status === 'completed' || event.status === 'cancelled') return false;
    return new Date(event.startTime) < new Date();
}

/**
 * Get range for a month
 */
export function getMonthRange(year: number, month: number): DateRange {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

/**
 * Get range for a week
 */
export function getWeekRange(date: Date): DateRange {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

export const calendarApi = {
    getEvents,
    getUpcomingEvents,
    getOverdueEvents,
    getEvent,
    createEvent,
    updateEvent,
    completeEvent,
    deleteEvent,
    syncEvents,
    syncAssignmentEvents,
    getEventTypeColor,
    getEventTypeIcon,
    formatEventTime,
    isEventToday,
    isEventOverdue,
    getMonthRange,
    getWeekRange,
};
