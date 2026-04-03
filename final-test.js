require('dotenv').config();

async function test() {
    const portStr = require('fs').readFileSync('./backend/.port', 'utf-8').trim();
    const BASE = `http://localhost:${portStr}`;
    
    console.log('Testing on port:', portStr);
    
    // Step 1: Login as admin
    const login = await fetch(`${BASE}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@booknsmash.com', password: 'admin123' })
    });
    const loginData = await login.json();
    if (!login.ok) { console.error('Login failed:', loginData); return; }
    const cookie = login.headers.get('set-cookie') || '';
    const token = loginData.accessToken;
    console.log('✅ Logged in. Has token?', !!token, 'Has cookie?', !!cookie);
    
    // Step 2: Get venues 
    const venueRes = await fetch(`${BASE}/api/venues`);
    const venueData = await venueRes.json();
    const venueId = venueData.venues?.[0]?.id;
    console.log('Venue ID:', venueId);
    
    // Step 3: POST without image (no-image path)
    const formNoImg = new FormData();
    formNoImg.append('title', 'Automated Test - No Image');
    formNoImg.append('sport', 'Tennis');
    formNoImg.append('description', 'Auto test event');
    const now = new Date(Date.now() + 86400000);
    formNoImg.append('startDate', now.toISOString());
    formNoImg.append('endDate', new Date(now.getTime() + 7200000).toISOString());
    formNoImg.append('venueId', venueId);
    formNoImg.append('maxParticipants', '10');
    formNoImg.append('entryFee', '0');
    formNoImg.append('status', 'UPCOMING');
    
    const r1 = await fetch(`${BASE}/api/events`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Cookie': cookie },
        body: formNoImg
    });
    const d1 = await r1.json();
    console.log('\n📋 No-image result:', r1.status, d1.message || d1.error);
    
    // Step 4: POST WITH image (tests graceful degradation)
    const formWithImg = new FormData();
    formWithImg.append('title', 'Automated Test - With Image');
    formWithImg.append('sport', 'Cricket');
    formWithImg.append('description', 'Auto test with image');
    const now2 = new Date(Date.now() + 172800000);
    formWithImg.append('startDate', now2.toISOString());
    formWithImg.append('endDate', new Date(now2.getTime() + 7200000).toISOString());
    formWithImg.append('venueId', venueId);
    formWithImg.append('maxParticipants', '20');
    formWithImg.append('entryFee', '100');
    formWithImg.append('status', 'UPCOMING');
    // Attach a fake image blob
    const fakeImage = new Blob(['FAKE_IMAGE_DATA_x'.repeat(50)], { type: 'image/jpeg' });
    formWithImg.append('image', fakeImage, 'test.jpg');
    
    const r2 = await fetch(`${BASE}/api/events`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Cookie': cookie },
        body: formWithImg
    });
    const d2 = await r2.json();
    console.log('\n🖼️ With-image result:', r2.status, d2.message || d2.error);
    if (d2.warning) console.log('⚠️ Warning (expected):', d2.warning);
    if (d2.event) console.log('✅ Event created:', d2.event.id, d2.event.title);
}

test().catch(console.error);
