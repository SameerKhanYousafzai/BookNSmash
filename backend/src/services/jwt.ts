import jwt from 'jsonwebtoken';
import config from '../config/env';
import { AuthTokenPayload, RefreshTokenPayload } from '../types';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateAccessToken = (userId: string, role: 'USER' | 'ADMIN', name: string): string => {
    const payload: AuthTokenPayload = { userId, role, name };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (userId: string): string => {
    const payload: RefreshTokenPayload = { userId };
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
    return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
};
