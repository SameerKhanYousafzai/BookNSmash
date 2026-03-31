import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let token: string | undefined;

        // 1. Check cookies for HTTP-only token
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } 
        // 2. Fallback to Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided',
            });
            return;
        }

        // Verify token
        const payload = verifyAccessToken(token);

        // Attach user info to request
        (req as any).user = payload;

        next();
    } catch (error) {
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid or expired token',
        });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || (roles.length > 0 && !roles.includes(user.role))) {
            return res.status(403).json({
                error: 'Unauthorized',
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
};
