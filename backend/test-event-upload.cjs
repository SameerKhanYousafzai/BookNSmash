// Test script: simulate POST /api/events with an image file
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Step 1: Login to get a token
async function run() {
    const baseUrl = 'http://localhost:5000';
    
    console.log('1. Logging in...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@booknsmash.com', password: 'admin123' }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login failed:', loginData);
        return;
    }
    const token = loginData.accessToken;
    console.log('✅ Logged in, token:', token.substring(0, 20) + '...');
    
    // Step 2: Get venues
    console.log('2. Getting venues...');
    const venuesRes = await fetch(`${baseUrl}/api/venues`);
    const venuesData = await venuesRes.json();
    const venueId = venuesData.venues?.[0]?.id;
    if (!venueId) { console.error('No venues found!'); return; }
    console.log('✅ Using venue:', venueId);
    
    // Step 3: Create a tiny fake PNG for testing (1x1 transparent pixel)
    const fakePng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
    );
    
    // Step 4: Post event WITH image
    console.log('3. Creating event with image...');
    const form = new FormData();
    form.append('title', 'Test Event With Image');
    form.append('sport', 'Cricket');
    form.append('startDate', new Date('2026-06-01T10:00:00').toISOString());
    form.append('endDate', new Date('2026-06-01T12:00:00').toISOString());
    form.append('venueId', venueId);
    form.append('maxParticipants', '20');
    form.append('entryFee', '500');
    form.append('description', 'Debug test event');
    form.append('status', 'UPCOMING');
    form.append('image', fakePng, { filename: 'test.png', contentType: 'image/png' });
    
    const createRes = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form.getHeaders(),
        },
        body: form,
    });
    
    const createData = await createRes.json().catch(e => ({ error: 'Non-JSON response: ' + e.message }));
    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createData, null, 2));
    
    if (createRes.ok) {
        console.log('\n✅ SUCCESS! Event created with imageUrl:', createData.event?.imageUrl);
    } else {
        console.log('\n❌ FAILED with status', createRes.status);
    }
}

run().catch(e => console.error('Script error:', e));
