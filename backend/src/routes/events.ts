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
    getAllRegistrations,
    getEventParticipantCount,
    RegistrationError,
} from '../models/Event';

const router = Router();

// GET /api/events - List all events (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { sport, status, limit, offset } = req.query;

        const currentEvents = await getAllEvents({
            sport: sport as string,
            status: status as string,
            limit: limit ? parseInt(limit as string, 10) : 50,
            offset: offset ? parseInt(offset as string, 10) : 0,
        });

        console.log(`📅 [GET /api/events] Found ${currentEvents.events.length} events in database`);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json(currentEvents);
    } catch (error) {
        console.error('❌ Failed to fetch events:', error);
        res.status(500).json({
            error: 'Failed to fetch events',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/events/registrations - All registrations (admin only)
router.get('/registrations', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const { eventId, status, limit, offset } = req.query;

        const result = await getAllRegistrations({
            eventId: eventId as string,
            status: status as string,
            limit: limit ? parseInt(limit as string, 10) : 50,
            offset: offset ? parseInt(offset as string, 10) : 0,
        });

        res.json(result);
    } catch (error) {
        console.error('❌ Failed to fetch registrations:', error);
        res.status(500).json({
            error: 'Failed to fetch registrations',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/events/registrations/export - CSV export (admin only)
router.get('/registrations/export', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const { eventId, status } = req.query;

        const result = await getAllRegistrations({
            eventId: eventId as string,
            status: status as string,
            limit: 10000,
            offset: 0,
        });

        // Build CSV
        const header = 'Registration ID,User Name,User Email,Event Title,Sport,Event Date,Status,Registered At\n';
        const rows = result.registrations.map((r: any) =>
            [
                r.id,
                `"${r.userName}"`,
                r.userEmail,
                `"${r.eventTitle}"`,
                r.eventSport,
                r.eventStartDate ? new Date(r.eventStartDate).toISOString() : '',
                r.status,
                r.registeredAt ? new Date(r.registeredAt).toISOString() : '',
            ].join(',')
        );

        const csv = header + rows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
        res.send(csv);
    } catch (error) {
        console.error('❌ Failed to export registrations:', error);
        res.status(500).json({
            error: 'Failed to export registrations',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/events/:id - Get event details (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const event = await findEventById(req.params.id);

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'Event with specified ID not found',
            });
        }

        // Include participant count
        const participants = await getEventParticipantCount(req.params.id);

        res.json({ event, participants });
    } catch (error) {
        console.error('❌ Failed to fetch event:', error);
        res.status(500).json({
            error: 'Failed to fetch event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/events - Create event (admin only)
router.post('/', authenticate, requireRole('ADMIN'), validate(createEventSchema), async (req: Request, res: Response) => {
    try {
        console.log('📬 Received event creation request:', JSON.stringify(req.body, null, 2));

        const eventData = {
            ...req.body,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            status: (req.body.status || 'UPCOMING') as any,
        };

        const event = await createEvent(eventData);

        res.status(201).json({
            message: 'Event created successfully',
            event,
        });
    } catch (error) {
        console.error('❌ Failed to create event:', error);
        res.status(500).json({
            error: 'Failed to create event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', authenticate, requireRole('ADMIN'), validate(updateEventSchema), async (req: Request, res: Response) => {
    try {
        console.log(`📬 Updating event ${req.params.id}:`, JSON.stringify(req.body, null, 2));
        const updateData: any = { ...req.body };

        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

        const event = await updateEvent(req.params.id, updateData);

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
        console.error('❌ Failed to update event:', error);
        res.status(500).json({
            error: 'Failed to update event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const success = await deleteEvent(req.params.id);

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
        console.error('❌ Failed to delete event:', error);
        res.status(500).json({
            error: 'Failed to delete event',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/events/:id/register - Register for event (authenticated)
router.post('/:id/register', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const event = await registerUserForEvent(req.params.id, userId);

        res.status(201).json({
            message: 'Successfully registered for event',
            event,
        });
    } catch (error) {
        if (error instanceof RegistrationError) {
            const statusMap = { DUPLICATE: 409, FULL: 400, NOT_FOUND: 404 };
            return res.status(statusMap[error.code]).json({
                error: 'Registration failed',
                code: error.code,
                message: error.message,
            });
        }

        console.error('❌ Registration failed:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/events/:id/register - Unregister from event (authenticated)
router.delete('/:id/register', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const event = await unregisterUserFromEvent(req.params.id, userId);

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
        console.error('❌ Unregistration failed:', error);
        res.status(400).json({
            error: 'Unregistration failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
