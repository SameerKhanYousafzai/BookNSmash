import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './db';
import { ensureAdminUser } from './models/User';
import { findAvailablePort, writePortFile, cleanPortFile } from './utils/port';

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

// CORS configuration — allow Vite dev server + production origins + dynamic port
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. curl, Postman, server-to-server)
            if (!origin) return callback(null, true);

            const allowed = [
                'http://localhost:5173',
                config.corsOrigin,
            ].filter(Boolean);

            // Also allow any localhost port (for dynamic port resolution)
            if (origin.match(/^http:\/\/localhost:\d+$/)) {
                return callback(null, true);
            }

            if (allowed.includes(origin)) {
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
        // Step 1: Find an available port
        const resolvedPort = await findAvailablePort(preferredPort);

        if (resolvedPort !== preferredPort) {
            console.log(`\n📌 Using port ${resolvedPort} (preferred port ${preferredPort} was in use)`);
        }

        // Step 2: Test database
        console.log('\n📦 Connecting to database...');
        await testConnection();

        // Step 3: Seed admin user
        console.log('👤 Ensuring admin user exists...');
        await ensureAdminUser();

        // Step 4: Bind to the resolved port
        server = app.listen(resolvedPort, () => {
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

startServer();
