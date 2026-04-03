import fs from 'fs';
import path from 'path';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const STORAGE_API = `${SUPABASE_URL}/storage/v1`;
const BUCKET = 'event-images';

/** Check if the service key is a real Supabase JWT (starts with eyJ). */
const isValidJwt = SUPABASE_SERVICE_KEY.startsWith('eyJ');

// Directory where images are stored locally when Supabase is not available
export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'event-images');

/**
 * Upload a file buffer to Supabase Storage via REST API OR to local disk.
 *
 * Strategy:
 *  - If SUPABASE_SERVICE_ROLE_KEY starts with "eyJ" (valid JWT) → uploads to Supabase.
 *  - Otherwise → saves to local disk at /uploads/event-images/ and returns a /uploads/ URL.
 *    Local images are served by Express's static middleware (configured in server.ts).
 *
 * Returns the public URL of the uploaded file.
 */
export async function uploadEventImage(
    fileName: string,
    buffer: Buffer,
    mimeType: string
): Promise<string> {
    // ── Supabase path ────────────────────────────────────────────────────────
    if (isValidJwt) {
        const uploadUrl = `${STORAGE_API}/object/${BUCKET}/${fileName}`;

        const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': mimeType,
                'x-upsert': 'true',
            },
            body: buffer,
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText);
            throw new Error(`Supabase Storage upload failed (${res.status}): ${errText}`);
        }

        return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
    }

    // ── Local disk path ──────────────────────────────────────────────────────
    // Ensure the uploads directory exists
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
        fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
    }

    const filePath = path.join(LOCAL_UPLOADS_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return a URL relative to the API server. In production this should be
    // overridden with a CDN / Supabase JWT. In dev, Express serves /uploads.
    return `/uploads/event-images/${fileName}`;
}

/**
 * Initializes storage. Uses Supabase if the JWT key is present,
 * otherwise creates the local uploads directory and logs a notice.
 */
export async function initializeStorage(): Promise<void> {
    if (!isValidJwt) {
        // Ensure local uploads directory exists
        if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
            fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
        }

        console.log('📁 Using LOCAL disk storage for event images (uploads/event-images/).');
        console.log('   ℹ️  To switch to Supabase Storage, update SUPABASE_SERVICE_ROLE_KEY in .env');
        console.log('      with the JWT key (starts with eyJ) from:');
        console.log('      Supabase Dashboard → Project Settings → API → service_role');
        return;
    }

    // Supabase path: ensure bucket exists
    try {
        const listRes = await fetch(`${STORAGE_API}/bucket`, {
            headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        });

        if (!listRes.ok) {
            const errText = await listRes.text().catch(() => listRes.statusText);
            console.warn(`⚠️ Supabase storage: could not list buckets (${listRes.status}): ${errText}. Falling back to local storage.`);
            return;
        }

        const buckets = await listRes.json() as Array<{ name: string }>;
        const bucketExists = buckets.some((b) => b.name === BUCKET);

        if (!bucketExists) {
            console.log(`🪣 Creating public "${BUCKET}" bucket in Supabase...`);
            const createRes = await fetch(`${STORAGE_API}/bucket`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: BUCKET,
                    name: BUCKET,
                    public: true,
                    file_size_limit: 5242880,
                    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
                }),
            });

            if (!createRes.ok) {
                const errText = await createRes.text().catch(() => createRes.statusText);
                console.error(`❌ Failed to create ${BUCKET} bucket: ${errText}`);
            } else {
                console.log(`✅ "${BUCKET}" bucket created and is public.`);
            }
        } else {
            console.log(`✅ "${BUCKET}" Supabase bucket exists and is ready.`);
        }
    } catch (error: any) {
        console.error('❌ Supabase storage initialization failed:', error?.message || error);
    }
}


