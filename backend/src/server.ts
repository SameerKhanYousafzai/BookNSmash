import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './db';
import { ensureAdminUser } from './models/User';
import { findAvailablePort, writePortFile, cleanPortFile } from './utils/port';
import { initializeStorage, LOCAL_UPLOADS_DIR } from './utils/storage';
import path from 'path';

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

// Trust reverse proxies (Railway/Heroku/Vercel) to properly extract client IPs for rate-limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration — hardcoded allowed origins for reliability across deployments
const allowedOrigins = [
    'http://localhost:5173',
    'https://book-n-smash.vercel.app',
    'https://booknsmash.antigravity.in',
    'https://booknsmash-backend.pxxl.click',
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. curl, Postman, server-to-server)
            if (!origin) return callback(null, true);

            // Also allow any localhost port (for dynamic port resolution)
            if (origin.match(/^http:\/\/localhost:\d+$/)) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
    message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Body parser and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve locally uploaded event images as static files
// (used when Supabase Storage is not configured — see utils/storage.ts)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

let server: ReturnType<typeof app.listen> | null = null;

function gracefulShutdown(signal: string) {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    cleanPortFile();

    if (server) {
        server.close(() => {
            console.log('👋 Server closed. Goodbye!\n');
            process.exit(0);
        });

        // Force exit after 5 seconds if connections are hanging
        setTimeout(() => {
            console.warn('⚠️  Forcing shutdown after timeout');
            process.exit(1);
        }, 5000);
    } else {
        process.exit(0);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Windows: handle Ctrl+C properly
if (process.platform === 'win32') {
    process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));
}

// Clean up .port file on unexpected exits
process.on('exit', () => cleanPortFile());
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    cleanPortFile();
    process.exit(1);
});

// ─── Start server ────────────────────────────────────────────────────────────

const startServer = async () => {
    const preferredPort = config.port;

    console.log('\n🔄 Starting BookNSmash Backend...');
    console.log(`   Preferred port: ${preferredPort}`);
    console.log(`   Environment: ${config.nodeEnv}`);

    try {
        // Step 1: Resolve port — in production (Railway), use the assigned PORT directly;
        // in development, scan for an available port if the preferred one is busy.
        const isProduction = config.nodeEnv === 'production';
        const resolvedPort = isProduction
            ? preferredPort
            : await findAvailablePort(preferredPort);

        if (resolvedPort !== preferredPort) {
            console.log(`\n📌 Using port ${resolvedPort} (preferred port ${preferredPort} was in use)`);
        }

        // Step 2: Test database
        console.log('\n📦 Connecting to database...');
        await testConnection();

        // Step 3: Seed admin user
        console.log('👤 Ensuring admin user exists...');
        await ensureAdminUser();

        // Step 3.5: Initialize Supabase storage
        console.log('🪣 Initializing Supabase storage...');
        await initializeStorage();

        // Step 4: Bind to the resolved port
        const host = config.nodeEnv === 'production' ? '0.0.0.0' : '127.0.0.1';
        server = app.listen(resolvedPort, host, () => {
            // Write the port file for Vite proxy
            writePortFile(resolvedPort);

            console.log(`\n✅ Backend server is READY`);
            console.log(`   📡 http://localhost:${resolvedPort}`);
            console.log(`   🏥 Health check: http://localhost:${resolvedPort}/health`);
            console.log(`   🔗 CORS: localhost:5173 + dynamic localhost ports`);
            console.log(`   🔐 Admin: admin@booknsmash.com / admin123\n`);
        });

        // Handle port-in-use error that slips past the probe (race condition)
        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ Port ${resolvedPort} became unavailable (race condition).`);
                console.error(`   Restart to auto-select another port.\n`);
                cleanPortFile();
                process.exit(1);
            }
            throw err;
        });

    } catch (error) {
        console.error('\n❌ FATAL: Failed to start server');
        console.error('   Error:', error instanceof Error ? error.message : error);

        if (error instanceof Error && error.message.includes('DATABASE_URL')) {
            console.error(`\n⚠️  Database connection failed!`);
            console.error(`   Fix: check DATABASE_URL in backend/.env`);
        }

        cleanPortFile();
        process.exit(1);
    }
};

// Global unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
    console.error('Promise:', promise);
});

startServer();
