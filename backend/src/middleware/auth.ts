import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = verifyAccessToken(token);

        // Attach user info to request
        req.user = payload;

        next();
    } catch (error) {
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid or expired token',
        });
    }
};
