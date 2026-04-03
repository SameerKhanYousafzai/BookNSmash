require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { randomUUID } = require('crypto');

async function test() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const buffer = Buffer.from('x'.repeat(1024));

    console.log("Starting upload...");
    const fileName = `${randomUUID()}.jpg`;

    try {
        const { data, error } = await supabaseAdmin.storage
            .from('event-images')
            .upload(fileName, buffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.error("Upload error details:", error);
        } else {
            console.log("Success:", data);
        }
    } catch (e) {
        console.error("Caught exception:", e);
    }
}
test();
