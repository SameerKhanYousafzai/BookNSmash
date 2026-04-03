import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../utils/validators';
import { findUserById, getAllUsers, updateUser, sanitizeUser, deleteUser, getUserDashboardData } from '../models/User';

const router = Router();

// GET /api/users/me/dashboard - Get user data for Profile dashboard
router.get('/me/dashboard', authenticate, async (req: Request, res: Response) => {
    try {
        const dashboardData = await getUserDashboardData(req.user!.userId);
        res.json(dashboardData);
    } catch (error) {
        console.error('❌ Failed to fetch user dashboard data:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await findUserById(req.user!.userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile not found',
            });
        }

        res.json({
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// PUT /api/users/me - Update current user profile
router.put('/me', authenticate, validate(updateUserSchema), async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const userId = req.user!.userId;

        // Check if email is already taken by another user
        if (email) {
            const allUsers = await getAllUsers();
            const existingUser = allUsers.find(
                (u) => u.email === email.toLowerCase() && u.id !== userId
            );
            if (existingUser) {
                return res.status(400).json({
                    error: 'Update failed',
                    message: 'Email already in use',
                });
            }
        }

        const updatedUser = await updateUser(userId, { name, email });

        if (!updatedUser) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile not found',
            });
        }

        res.json({
            message: 'Profile updated successfully',
            user: sanitizeUser(updatedUser),
        });
    } catch (error) {
        res.status(500).json({
            error: 'Update failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/users - List all users (admin only)
router.get('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const users = (await getAllUsers(limit, offset)).map(sanitizeUser);
        res.json({
            users,
            total: users.length,
            limit,
            offset
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const user = await findUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User with specified ID not found',
            });
        }

        res.json({
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        if (req.params.id === req.user!.userId) {
            return res.status(400).json({
                error: 'Action denied',
                message: 'You cannot delete your own admin account while logged in.',
            });
        }

        const success = await deleteUser(req.params.id);

        if (!success) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User with specified ID not found',
            });
        }

        res.json({
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('❌ Failed to delete user:', error);
        if (error instanceof Error && error.message.includes('last admin user')) {
            return res.status(400).json({
                error: 'Action denied',
                message: error.message,
            });
        }
        res.status(500).json({
            error: 'Failed to delete user',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
