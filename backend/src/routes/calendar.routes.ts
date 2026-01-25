/**
 * Calendar Routes
 * 
 * API endpoints for calendar events management
 */

import { Router, Request, Response } from 'express';
import { calendarService } from '../services/calendar.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth middleware to all calendar routes
router.use(authMiddleware);

// ==================== GET EVENTS ====================

/**
 * GET /api/calendar/events
 * Get events for user with optional date range
 */
router.get('/events', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { start, end } = req.query;
        const range = start && end
            ? { start: start as string, end: end as string }
            : undefined;

        const events = await calendarService.getEvents(userId, range);
        res.json({ data: events });
    } catch (error: any) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/calendar/events/upcoming
 * Get upcoming events for dashboard widget
 */
router.get('/events/upcoming', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 5;
        const events = await calendarService.getUpcomingEvents(userId, limit);
        res.json({ data: events });
    } catch (error: any) {
        console.error('Error getting upcoming events:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/calendar/events/overdue
 * Get overdue events
 */
router.get('/events/overdue', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const events = await calendarService.getOverdueEvents(userId);
        res.json({ data: events });
    } catch (error: any) {
        console.error('Error getting overdue events:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/calendar/events/:id
 * Get single event
 */
router.get('/events/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await calendarService.getEvent(req.params.id);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Verify ownership
        if (event.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        res.json({ data: event });
    } catch (error: any) {
        console.error('Error getting event:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== CREATE/UPDATE/DELETE ====================

/**
 * POST /api/calendar/events
 * Create a new event
 */
router.post('/events', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { title, description, startTime, endTime, allDay, type, color, assignmentId, milestoneId, courseId } = req.body;

        if (!title?.trim()) {
            res.status(400).json({ error: 'Event title is required' });
            return;
        }

        if (!startTime) {
            res.status(400).json({ error: 'Start time is required' });
            return;
        }

        const event = await calendarService.createEvent({
            userId,
            title: title.trim(),
            description,
            startTime,
            endTime,
            allDay,
            type,
            color,
            assignmentId,
            milestoneId,
            courseId,
        });

        res.status(201).json({ data: event });
    } catch (error: any) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/calendar/events/:id
 * Update an event
 */
router.patch('/events/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await calendarService.getEvent(req.params.id);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (event.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { title, description, startTime, endTime, allDay, type, color, status } = req.body;

        const updated = await calendarService.updateEvent(req.params.id, {
            title,
            description,
            startTime,
            endTime,
            allDay,
            type,
            color,
            status,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/calendar/events/:id/complete
 * Mark event as completed
 */
router.post('/events/:id/complete', async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await calendarService.getEvent(req.params.id);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (event.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const updated = await calendarService.completeEvent(req.params.id);
        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error completing event:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/calendar/events/:id
 * Delete an event
 */
router.delete('/events/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await calendarService.getEvent(req.params.id);
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (event.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        await calendarService.deleteEvent(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== SYNC ====================

/**
 * POST /api/calendar/sync
 * Sync events from assignments/milestones
 */
router.post('/sync', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await calendarService.syncUserEvents(userId);
        res.json({
            success: true,
            data: result,
            message: `Synced ${result.assignmentEvents} assignment events and ${result.milestoneEvents} milestone events`
        });
    } catch (error: any) {
        console.error('Error syncing events:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/calendar/sync/:assignmentId
 * Sync events for a specific assignment
 */
router.post('/sync/:assignmentId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { assignmentId } = req.params;

        const deadlineEvent = await calendarService.generateAssignmentDeadlineEvent(assignmentId, userId);
        const milestoneEvents = await calendarService.generateMilestoneEvents(assignmentId, userId);

        res.json({
            success: true,
            data: {
                deadlineEvent,
                milestoneEvents,
            }
        });
    } catch (error: any) {
        console.error('Error syncing assignment events:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
