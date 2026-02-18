import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './db';
import { ensureAdminUser } from './models/User';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import venueRoutes from './routes/venues';
import productRoutes from './routes/products';
import teamRoutes from './routes/teams';
import matchRoutes from './routes/matches';
import adminRoutes from './routes/admin';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration — allow Vite dev server + production origins
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            config.corsOrigin,
        ].filter(Boolean),
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint — used by frontend to verify backend is alive
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        port: config.port,
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/products', productRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin/dashboard', adminRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = config.port;

const startServer = async () => {
    console.log('\n🔄 Starting BookNSmash Backend...');
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${config.nodeEnv}`);

    try {
        // Step 1: Test database
        console.log('\n📦 Connecting to database...');
        await testConnection();

        // Step 2: Seed admin user
        console.log('👤 Ensuring admin user exists...');
        await ensureAdminUser();

        // Step 3: Bind to port
        app.listen(PORT, () => {
            console.log(`\n✅ Backend server is READY`);
            console.log(`   📡 http://localhost:${PORT}`);
            console.log(`   🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`   🔗 CORS origins: localhost:5173, localhost:3000`);
            console.log(`   🔐 Admin: admin@booknsmash.com / admin123\n`);
        });
    } catch (error) {
        console.error('\n❌ FATAL: Failed to start server');
        console.error('   Error:', error instanceof Error ? error.message : error);

        if (error instanceof Error && error.message.includes('EADDRINUSE')) {
            console.error(`\n⚠️  Port ${PORT} is already in use!`);
            console.error(`   Fix: kill the process using port ${PORT}, or change PORT in .env`);
        }

        if (error instanceof Error && error.message.includes('DATABASE_URL')) {
            console.error(`\n⚠️  Database connection failed!`);
            console.error(`   Fix: check DATABASE_URL in backend/.env`);
        }

        process.exit(1);
    }
};

startServer();
