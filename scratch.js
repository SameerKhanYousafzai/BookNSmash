const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
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
    form.append('venueId', '1bc4b5b8-5be0-410a-aca6-b3e15dd6cd9e'); // Any valid UUID format is fine for string test
    form.append('status', 'UPCOMING');

    // Make a dummy 1KB text file masquerading as an image
    fs.writeFileSync('/tmp/dummy.jpg', 'A'.repeat(1024));
    form.append('image', fs.createReadStream('/tmp/dummy.jpg'), { filename: 'dummy.jpg', contentType: 'image/jpeg' });

    // Assuming the backend is running on 3000 or whatever port it uses, wait, which port? 
    // We can read the port from .port or just assume it is the one we see
    // wait, where's the .port file located? In BookNSmash/backend/.port
    try {
        const portStr = fs.readFileSync('./backend/.port', 'utf-8');
        const API_URL = `http://localhost:${portStr}/api/events`;
        console.log("Posting to", API_URL);

        // the headers need admin token!
        // where to get an admin token? We can sign one.
        // I'll sign a token using JWT and process.env.JWT_SECRET...
    } catch(err) {
        console.error("Read .port or fetch failed:", err);
    }
}
run();
