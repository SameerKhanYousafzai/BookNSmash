import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validators';
import { createUser, findUserByEmail, findUserById, sanitizeUser } from '../models/User';
import { comparePassword } from '../services/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt';

const router = Router();

// POST /api/auth/register - User registration
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                error: 'Registration failed',
                message: 'Email already registered',
            });
        }

        // Create user
        const user = await createUser({ name, email, password });

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role, user.name);
        const refreshToken = generateRefreshToken(user.id);

        res.status(201).json({
            message: 'Registration successful',
            user: sanitizeUser(user),
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Registration failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/auth/login - User login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid email or password',
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid email or password',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role, user.name);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            message: 'Login successful',
            user: sanitizeUser(user),
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Login failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/auth/admin/login - Admin login
router.post('/admin/login', validate(loginSchema), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await findUserByEmail(email);
        if (!user || user.role !== 'ADMIN') {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid admin credentials',
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Login failed',
                message: 'Invalid admin credentials',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role, user.name);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            message: 'Admin login successful',
            user: sanitizeUser(user),
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Login failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', validate(refreshTokenSchema), async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Find user
        const user = await findUserById(payload.userId);
        if (!user) {
            return res.status(401).json({
                error: 'Token refresh failed',
                message: 'User not found',
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user.id, user.role, user.name);

        res.json({
            message: 'Token refreshed successfully',
            accessToken,
        });
    } catch (error) {
        res.status(401).json({
            error: 'Token refresh failed',
            message: 'Invalid or expired refresh token',
        });
    }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (_req: Request, res: Response) => {
    res.json({
        message: 'Logout successful. Please remove tokens from client storage.',
    });
});

export default router;
