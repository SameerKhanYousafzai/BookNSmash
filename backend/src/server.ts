import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import venueRoutes from './routes/venues';
import teamRoutes from './routes/teams';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: config.corsOrigin,
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/teams', teamRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 BookNSmash Backend Server`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 CORS enabled for: ${config.corsOrigin}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   POST   /api/auth/admin/login`);
    console.log(`   POST   /api/auth/refresh`);
    console.log(`   POST   /api/auth/logout`);
    console.log(`   GET    /api/users/me`);
    console.log(`   PUT    /api/users/me`);
    console.log(`   GET    /api/events`);
    console.log(`   POST   /api/events`);
    console.log(`   GET    /api/venues`);
    console.log(`   POST   /api/venues`);
    console.log(`   GET    /api/teams`);
    console.log(`   POST   /api/teams`);
    console.log(`\n🔐 Admin credentials: admin@booknsmash.com / admin123`);
});

export default app;
