import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        // Use DIRECT_URL for migrations (bypasses PgBouncer, required for DDL)
        url: process.env.DIRECT_URL!,
    },
    verbose: true,
    strict: true,
});
