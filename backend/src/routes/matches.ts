import { Router, Request, Response } from 'express';
import {
    createMatch,
    getAllMatches,
    findMatchById,
    updateMatch,
    deleteMatch
} from '../models/Match';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// GET all matches
router.get('/', async (req: Request, res: Response) => {
    try {
        const { eventId, status } = req.query;
        const matches = await getAllMatches({
            eventId: eventId as string,
            status: status as string
        });

        console.log(`⚽ [GET /api/matches] Found ${matches.length} matches in database`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({ matches });
    } catch (error) {
        console.error('❌ Failed to fetch matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// GET match by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const match = await findMatchById(req.params.id);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json({ match });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch match' });
    }
});

// POST create match (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
    try {
        const match = await createMatch(req.body);
        res.status(201).json({ match });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match' });
    }
});

// PUT update match (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
    try {
        const match = await updateMatch(req.params.id, req.body);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json({ match });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update match' });
    }
});

// DELETE match (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
    try {
        const success = await deleteMatch(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

export default router;
