import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres.js client
const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});

// Create Drizzle instance with schema and relations for type-safe queries
export const db = drizzle(client, {
    schema: { ...schema, ...relations },
});

// Connection test — call once at startup
export const testConnection = async (): Promise<void> => {
    try {
        await client`SELECT 1`;
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

// Export schema for convenience
export * from './schema';
