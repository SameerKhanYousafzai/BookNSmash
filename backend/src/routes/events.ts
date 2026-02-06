import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../utils/validators';
import {
    createEvent,
    findEventById,
    getAllEvents,
    updateEvent,
    deleteEvent,
    registerUserForEvent,
    unregisterUserFromEvent,
} from '../models/Event';

const router = Router();

// GET /api/events - List all events (public)
router.get('/', (req: Request, res: Response) => {
    try {
        const { sport, status } = req.query;

        const events = getAllEvents({
            sport: sport as string,
            status: status as string,
        });

        res.json({
            events,
            total: events.length,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch events',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/events/:id - Get event details (public)
router.get('/:id', (req: Request, res: Response) => {
    try {
        const event = findEventById(req.params.id);

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Event with specified ID not found',
            });
        }

        res.json({ event });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/events - Create event (admin only)
router.post('/', authenticate, requireRole('ADMIN'), validate(createEventSchema), (req: Request, res: Response) => {
    try {
        const eventData = {
            ...req.body,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            status: 'upcoming' as const,
        };

        const event = createEvent(eventData);

        res.status(201).json({
            message: 'Event created successfully',
            event,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', authenticate, requireRole('ADMIN'), validate(updateEventSchema), (req: Request, res: Response) => {
    try {
        const updateData: any = { ...req.body };

        // Convert date strings to Date objects if present
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

        const event = updateEvent(req.params.id, updateData);

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Event with specified ID not found',
            });
        }

        res.json({
            message: 'Event updated successfully',
            event,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
    try {
        const success = deleteEvent(req.params.id);

        if (!success) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Event with specified ID not found',
            });
        }

        res.json({
            message: 'Event deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/events/:id/register - Register for event (authenticated)
router.post('/:id/register', authenticate, (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const event = registerUserForEvent(req.params.id, userId);

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Event with specified ID not found',
            });
        }

        res.json({
            message: 'Successfully registered for event',
            event,
        });
    } catch (error) {
        res.status(400).json({
            error: 'Registration failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/events/:id/register - Unregister from event (authenticated)
router.delete('/:id/register', authenticate, (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const event = unregisterUserFromEvent(req.params.id, userId);

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Event with specified ID not found',
            });
        }

        res.json({
            message: 'Successfully unregistered from event',
            event,
        });
    } catch (error) {
        res.status(400).json({
            error: 'Unregistration failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
