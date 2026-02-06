import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createVenueSchema, updateVenueSchema } from '../utils/validators';
import {
    createVenue,
    findVenueById,
    getAllVenues,
    updateVenue,
    deleteVenue,
} from '../models/Venue';

const router = Router();

// GET /api/venues - List all venues (public)
router.get('/', (req: Request, res: Response) => {
    try {
        const { sport, location } = req.query;

        const venues = getAllVenues({
            sport: sport as string,
            location: location as string,
        });

        res.json({
            venues,
            total: venues.length,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch venues',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/venues/:id - Get venue details (public)
router.get('/:id', (req: Request, res: Response) => {
    try {
        const venue = findVenueById(req.params.id);

        if (!venue) {
            return res.status(404).json({
                error: 'Venue not found',
                message: 'Venue with specified ID not found',
            });
        }

        res.json({ venue });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/venues - Create venue (admin only)
router.post('/', authenticate, requireRole('ADMIN'), validate(createVenueSchema), (req: Request, res: Response) => {
    try {
        const venue = createVenue(req.body);

        res.status(201).json({
            message: 'Venue created successfully',
            venue,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// PUT /api/venues/:id - Update venue (admin only)
router.put('/:id', authenticate, requireRole('ADMIN'), validate(updateVenueSchema), (req: Request, res: Response) => {
    try {
        const venue = updateVenue(req.params.id, req.body);

        if (!venue) {
            return res.status(404).json({
                error: 'Venue not found',
                message: 'Venue with specified ID not found',
            });
        }

        res.json({
            message: 'Venue updated successfully',
            venue,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/venues/:id - Delete venue (admin only)
router.delete('/:id', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
    try {
        const success = deleteVenue(req.params.id);

        if (!success) {
            return res.status(404).json({
                error: 'Venue not found',
                message: 'Venue with specified ID not found',
            });
        }

        res.json({
            message: 'Venue deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
