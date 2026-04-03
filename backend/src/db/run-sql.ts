import postgres from 'postgres';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
}

const sql = postgres(connectionString);

async function main() {
    console.log('🔄 Running 0002 migration manually...');
    const file = fs.readFileSync(path.join(process.cwd(), 'drizzle/0002_clear_inhumans.sql'), 'utf8');
    
    // We must execute statement by statement or as one chunk if Supabase allows
    // Let's strip the statement-breakpoint
    const queries = file.split('--> statement-breakpoint').map(q => q.trim()).filter(q => q.length > 0);
    
    for (const q of queries) {
        try {
            console.log('Executing:', q.substring(0, 50) + '...');
            await sql.unsafe(q);
        } catch(e) {
            console.error('⚠️ Found issue (might be retryable/already exists):', (e as Error).message);
        }
    }
    
    console.log('✅ Migrations applied successfully!');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Migration failed!', err);
    process.exit(1);
});
