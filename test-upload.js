const form = new FormData();
form.append('title', 'Test Event');
form.append('sport', 'Badminton');
form.append('description', 'Test desc');

const now = new Date();
const end = new Date(now.getTime() + 2 * 3600 * 1000);

form.append('startDate', now.toISOString());
form.append('endDate', end.toISOString());
form.append('entryFee', '100');
form.append('maxParticipants', '20');
form.append('venueId', '1bc4b5b8-5be0-410a-aca6-b3e15dd6cd9e'); 
form.append('status', 'UPCOMING');

const dummy = new Blob(['x'.repeat(1024)], { type: 'image/jpeg' });
form.append('image', dummy, 'dummy.jpg');

async function test() {
    try {
        const portStr = require('fs').readFileSync('./backend/.port', 'utf-8');
        console.log("Port:", portStr.trim());
        
        // Let's first log in as admin to get token
        const loginRes = await fetch(`http://localhost:${portStr.trim()}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@booknsmash.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log("Token acquired.");

        const res = await fetch(`http://localhost:${portStr.trim()}/api/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });
        
        console.log(res.status, await res.text());
    } catch(err) {
        console.error("Test failed", err);
    }
}

test();
