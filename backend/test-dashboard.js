const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: 'generated-uuid-1', role: 'ADMIN', name: 'Admin' }, 
    'booknsmash-super-secret-jwt-key-2026'
);

const fetchUrl = (path) => {
    return new Promise((resolve) => {
        http.get(
            `http://localhost:5000/api/admin/dashboard/${path}`, 
            { headers: { 'Authorization': `Bearer ${token}` } }, 
            (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`\n=== ${path.toUpperCase()} STATS ===`);
                    console.log(JSON.stringify(JSON.parse(data), null, 2));
                    resolve();
                });
            }
        ).on('error', (e) => console.error(`Error on ${path}:`, e.message));
    });
};

(async () => {
    // Wait for nodemon to fully boot
    await new Promise(r => setTimeout(r, 2000));
    await fetchUrl('weekly');
    await fetchUrl('monthly');
    await fetchUrl('yearly');
    process.exit(0);
})();
