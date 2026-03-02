#!/usr/bin/env node

/**
 * Cross-platform zombie Node.js process cleanup script.
 *
 * Kills any Node processes that are occupying ports in the
 * BookNSmash fallback range (5000–5010). Runs automatically
 * via the `predev` npm hook before `npm run dev`.
 *
 * Usage:  node scripts/cleanup.js [port]
 *         node scripts/cleanup.js          → cleans default range
 *         node scripts/cleanup.js 5000     → cleans only port 5000
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const DEFAULT_PORTS = [5000, 5001, 5002, 5003, 5004, 5005];
const isWindows = os.platform() === 'win32';

// Allow a single port override via CLI arg
const cliPort = parseInt(process.argv[2], 10);
const ports = cliPort ? [cliPort] : DEFAULT_PORTS;

/**
 * Clean up the .port file from a previous run.
 */
function cleanPortFile() {
    const portFile = path.resolve(__dirname, '..', 'backend', '.port');
    try {
        if (fs.existsSync(portFile)) {
            fs.unlinkSync(portFile);
            console.log('🗑️  Removed stale .port file');
        }
    } catch {
        // Ignore
    }
}

/**
 * On Windows: find the PID using a given port via netstat,
 * then kill it if it's a node.exe process.
 */
function cleanPortWindows(port) {
    try {
        const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        const lines = output.trim().split('\n');
        const pids = new Set();

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
                pids.add(pid);
            }
        }

        for (const pid of pids) {
            try {
                // Check if this PID is a node.exe process
                const taskInfo = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe'],
                });

                if (taskInfo.toLowerCase().includes('node.exe')) {
                    execSync(`taskkill /PID ${pid} /F`, {
                        stdio: ['pipe', 'pipe', 'pipe'],
                    });
                    console.log(`🔪 Killed zombie node.exe (PID ${pid}) on port ${port}`);
                }
            } catch {
                // Process may have already exited
            }
        }
    } catch {
        // No process found on this port — that's fine
    }
}

/**
 * On macOS/Linux: find the PID using lsof, then kill if it's a node process.
 */
function cleanPortUnix(port) {
    try {
        const output = execSync(`lsof -ti :${port}`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        const pids = output.trim().split('\n').filter(Boolean);

        for (const pid of pids) {
            try {
                const processName = execSync(`ps -p ${pid} -o comm=`, {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe'],
                }).trim();

                if (processName.includes('node')) {
                    execSync(`kill -9 ${pid}`, {
                        stdio: ['pipe', 'pipe', 'pipe'],
                    });
                    console.log(`🔪 Killed zombie node process (PID ${pid}) on port ${port}`);
                }
            } catch {
                // Process may have already exited
            }
        }
    } catch {
        // No process found on this port — that's fine
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('🧹 BookNSmash Port Cleanup');
console.log(`   Platform: ${os.platform()}`);
console.log(`   Checking ports: ${ports.join(', ')}\n`);

cleanPortFile();

for (const port of ports) {
    if (isWindows) {
        cleanPortWindows(port);
    } else {
        cleanPortUnix(port);
    }
}

console.log('\n✅ Port cleanup complete\n');
