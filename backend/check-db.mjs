import postgres from 'postgres';
import { config } from 'dotenv';
config();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function check() {
  // Check events table columns
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'events'
    ORDER BY ordinal_position
  `;
  console.log('Events table columns:');
  cols.forEach(c => console.log(` - ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`));

  // Check if image_url exists
  const hasImageUrl = cols.some(c => c.column_name === 'image_url');
  if (!hasImageUrl) {
    console.log('\n⚠️  MISSING COLUMN: image_url — Adding it now...');
    await sql`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "image_url" text`;
    console.log('✅ image_url column added!');
  } else {
    console.log('\n✅ image_url column already exists');
  }

  await sql.end();
}

check().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
