import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../utils/validators';
import { findUserById, getAllUsers, updateUser, sanitizeUser } from '../models/User';

const router = Router();

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
router.get('/', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
    try {
        const users = (await getAllUsers()).map(sanitizeUser);
        res.json({
            users,
            total: users.length,
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

export default router;
