import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validators';
import { createUser, findUserByEmail, findUserById, sanitizeUser, setResetToken, findUserByResetToken, updatePassword } from '../models/User';
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

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

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

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

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

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

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
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Token refresh failed',
                message: 'No refresh token provided',
            });
        }

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
        
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });

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
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({
        message: 'Logout successful. Server cookies cleared.',
    });
});

// POST /api/auth/forgot-password - Generate Reset Token
router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await findUserByEmail(email);

        if (!user) {
            // Do not reveal if email exists or not
            return res.json({ message: 'If that email is registered, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

        await setResetToken(user.id, resetToken, expiry);

        // In a real app, send an email here.
        console.log(`✉️ [MOCK EMAIL] Password reset for ${user.email}. Token: ${resetToken}`);

        res.json({ message: 'If that email is registered, a password reset link has been sent.' });
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/auth/reset-password - Verify Token and update password
router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        const user = await findUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        await updatePassword(user.id, newPassword);

        res.json({ message: 'Password has been successfully reset' });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
