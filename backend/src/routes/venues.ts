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
router.get('/', async (req: Request, res: Response) => {
    try {
        const { sport, location } = req.query;

        const currentVenues = await getAllVenues({
            sport: sport as string,
            location: location as string,
        });

        console.log(`🏢 [GET /api/venues] Found ${currentVenues.length} venues in database`);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({
            venues: currentVenues,
            total: currentVenues.length,
        });
    } catch (error) {
        console.error('❌ Failed to fetch venues:', error);
        res.status(500).json({
            error: 'Failed to fetch venues',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/venues/:id - Get venue details (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const venue = await findVenueById(req.params.id);

        if (!venue) {
            return res.status(404).json({
                error: 'Venue not found',
                message: 'Venue with specified ID not found',
            });
        }

        res.json({ venue });
    } catch (error) {
        console.error('❌ Failed to fetch venue:', error);
        res.status(500).json({
            error: 'Failed to fetch venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/venues - Create venue (admin only)
router.post('/', authenticate, requireRole('ADMIN'), validate(createVenueSchema), async (req: Request, res: Response) => {
    try {
        console.log('🏢 Received venue creation request:', JSON.stringify(req.body, null, 2));
        const venue = await createVenue(req.body);

        res.status(201).json({
            message: 'Venue created successfully',
            venue,
        });
    } catch (error) {
        console.error('❌ Failed to create venue:', error);
        res.status(500).json({
            error: 'Failed to create venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// PUT /api/venues/:id - Update venue (admin only)
router.put('/:id', authenticate, requireRole('ADMIN'), validate(updateVenueSchema), async (req: Request, res: Response) => {
    try {
        console.log(`🏢 Updating venue ${req.params.id}:`, JSON.stringify(req.body, null, 2));
        const venue = await updateVenue(req.params.id, req.body);

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
        console.error('❌ Failed to update venue:', error);
        res.status(500).json({
            error: 'Failed to update venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/venues/:id - Delete venue (admin only)
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const success = await deleteVenue(req.params.id);

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
        console.error('❌ Failed to delete venue:', error);
        res.status(500).json({
            error: 'Failed to delete venue',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
