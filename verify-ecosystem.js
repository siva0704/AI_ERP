const http = require('http');

async function checkUrl(url, name) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            console.log(`✅ ${name} is responsive (Status: ${res.statusCode})`);
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).on('error', (e) => {
            console.error(`❌ ${name} failed: ${e.message}`);
            resolve(false);
        });
    });
}

async function main() {
    console.log('🔍 verifying ecosystem health...');

    // Give services a moment to stabilize
    await new Promise(r => setTimeout(r, 15000));

    const apiHealthy = await checkUrl('http://localhost:3006/api/health', 'API Service');
    const webHealthy = await checkUrl('http://localhost:3005', 'Web Service');

    if (apiHealthy && webHealthy) {
        console.log('🚀 Ecosystem is healthy!');
        process.exit(0);
    } else {
        console.error('⚠️ Ecosystem check failed.');
        process.exit(1);
    }
}

main();
