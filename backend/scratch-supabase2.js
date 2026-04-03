require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

async function test() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const buffer = Buffer.from('x'.repeat(1024));
    
    try {
        const { error } = await supabaseAdmin.storage
            .from('event-images')
            .upload('test.jpg', buffer, { contentType: 'image/jpeg' });
            
        console.log("Error object message:", error?.message);
        console.log("Error status:", error?.statusCode);
    } catch (e) {
        console.error("Exception mapping:", e.message);
    }
}
test();
