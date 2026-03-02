import net from 'net';
import fs from 'fs';
import path from 'path';

/** Default fallback port chain */
const FALLBACK_PORTS = [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010];

/** Path to the .port file that communicates the resolved port to the frontend proxy */
const PORT_FILE = path.resolve(__dirname, '../../.port');

/**
 * Probes whether a TCP port is available on localhost.
 * Resolves `true` if the port is free, `false` if it's in use.
 */
function isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                resolve(false); // treat any error as unavailable
            }
        });

        server.once('listening', () => {
            server.close(() => resolve(true));
        });

        server.listen(port, '0.0.0.0');
    });
}

/**
 * Finds the first available port from the preferred port + fallback chain.
 *
 * Resolution order:
 * 1. Try the `preferred` port (from PORT env var)
 * 2. Walk through FALLBACK_PORTS (5000–5010)
 * 3. If all are taken, request an OS-assigned ephemeral port (0)
 *
 * @param preferred - The port specified in the environment (e.g. 5000)
 * @returns The resolved available port number
 */
export async function findAvailablePort(preferred: number): Promise<number> {
    // 1. Try the preferred port first
    if (await isPortAvailable(preferred)) {
        return preferred;
    }

    console.warn(`⚠️  Port ${preferred} is in use. Searching for an available port...`);

    // 2. Walk through fallback chain (skip preferred if it's already in the list)
    for (const port of FALLBACK_PORTS) {
        if (port === preferred) continue;
        if (await isPortAvailable(port)) {
            console.log(`✅ Found available port: ${port}`);
            return port;
        }
    }

    // 3. Last resort: OS-assigned ephemeral port
    console.warn('⚠️  All fallback ports are in use. Requesting OS-assigned port...');
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, '0.0.0.0', () => {
            const addr = server.address();
            if (addr && typeof addr === 'object') {
                const port = addr.port;
                server.close(() => resolve(port));
            } else {
                server.close(() => reject(new Error('Failed to get OS-assigned port')));
            }
        });
        server.once('error', reject);
    });
}

/**
 * Writes the resolved port to a `.port` file so the Vite dev proxy
 * can read it and forward requests to the correct backend.
 */
export function writePortFile(port: number): void {
    try {
        fs.writeFileSync(PORT_FILE, String(port), 'utf-8');
    } catch {
        // Non-fatal — Vite will fall back to the default port
        console.warn('⚠️  Could not write .port file (non-fatal)');
    }
}

/**
 * Removes the .port file on shutdown so stale ports aren't read.
 */
export function cleanPortFile(): void {
    try {
        if (fs.existsSync(PORT_FILE)) {
            fs.unlinkSync(PORT_FILE);
        }
    } catch {
        // Ignore cleanup errors
    }
}
