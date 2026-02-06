import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTeamSchema, updateTeamSchema, addTeamMemberSchema } from '../utils/validators';
import {
    createTeam,
    findTeamById,
    getAllTeams,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    isTeamCaptain,
} from '../models/Team';

const router = Router();

// GET /api/teams - List all teams (public)
router.get('/', (req: Request, res: Response) => {
    try {
        const { sport } = req.query;

        const teams = getAllTeams({
            sport: sport as string,
        });

        res.json({
            teams,
            total: teams.length,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch teams',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/teams/:id - Get team details (public)
router.get('/:id', (req: Request, res: Response) => {
    try {
        const team = findTeamById(req.params.id);

        if (!team) {
            return res.status(404).json({
                error: 'Team not found',
                message: 'Team with specified ID not found',
            });
        }

        res.json({ team });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch team',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/teams - Create team (authenticated)
router.post('/', authenticate, validate(createTeamSchema), (req: Request, res: Response) => {
    try {
        const { name, sport } = req.body;
        const captainId = req.user!.userId;

        const team = createTeam({ name, captainId, sport });

        res.status(201).json({
            message: 'Team created successfully',
            team,
        });
    } catch (error) {
        res.status(400).json({
            error: 'Failed to create team',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// PUT /api/teams/:id - Update team (captain only)
router.put('/:id', authenticate, validate(updateTeamSchema), (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = req.user!.userId;

        // Check if user is team captain
        if (!isTeamCaptain(teamId, userId)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only team captain can update team details',
            });
        }

        const team = updateTeam(teamId, req.body);

        if (!team) {
            return res.status(404).json({
                error: 'Team not found',
                message: 'Team with specified ID not found',
            });
        }

        res.json({
            message: 'Team updated successfully',
            team,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update team',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/teams/:id - Delete team (captain only)
router.delete('/:id', authenticate, (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = req.user!.userId;

        // Check if user is team captain
        if (!isTeamCaptain(teamId, userId)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only team captain can delete the team',
            });
        }

        const success = deleteTeam(teamId);

        if (!success) {
            return res.status(404).json({
                error: 'Team not found',
                message: 'Team with specified ID not found',
            });
        }

        res.json({
            message: 'Team deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete team',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/teams/:id/members - Add team member (captain only)
router.post('/:id/members', authenticate, validate(addTeamMemberSchema), (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = req.user!.userId;
        const { userId: newMemberId } = req.body;

        // Check if user is team captain
        if (!isTeamCaptain(teamId, userId)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only team captain can add members',
            });
        }

        const team = addTeamMember(teamId, newMemberId);

        if (!team) {
            return res.status(404).json({
                error: 'Team not found',
                message: 'Team with specified ID not found',
            });
        }

        res.json({
            message: 'Member added successfully',
            team,
        });
    } catch (error) {
        res.status(400).json({
            error: 'Failed to add member',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/teams/:id/members/:userId - Remove team member (captain only)
router.delete('/:id/members/:userId', authenticate, (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = req.user!.userId;
        const memberToRemove = req.params.userId;

        // Check if user is team captain
        if (!isTeamCaptain(teamId, userId)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only team captain can remove members',
            });
        }

        const team = removeTeamMember(teamId, memberToRemove);

        if (!team) {
            return res.status(404).json({
                error: 'Team not found',
                message: 'Team with specified ID not found',
            });
        }

        res.json({
            message: 'Member removed successfully',
            team,
        });
    } catch (error) {
        res.status(400).json({
            error: 'Failed to remove member',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
