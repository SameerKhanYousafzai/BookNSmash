import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    corsOrigin: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validate required environment variables
if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'default-secret-key' || config.jwtRefreshSecret === 'default-refresh-secret-key') {
        throw new Error('JWT secrets must be set in production environment');
    }
}

export default config;
