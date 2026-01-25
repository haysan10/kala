const https = require('https');

const BASE_URL = 'https://kala-webapp.vercel.app';

console.log(`🔍 Verifying deployment at: ${BASE_URL}`);

function checkOAuth() {
    console.log('\n[2] Checking /api/auth/google...');
    const req = https.get(`${BASE_URL}/api/auth/google`, (res) => {
        if (res.statusCode === 307 || res.statusCode === 302) {
            const location = res.headers.location;
            const url = new URL(location);
            const redirectUri = url.searchParams.get('redirect_uri');
            const clientId = url.searchParams.get('client_id');
            
            console.log(`\n📋 CONFIGURATION DUMP:`);
            console.log(`   Client ID:    ${clientId}`);
            console.log(`   Redirect URI: ${redirectUri}`);
            
            console.log(`\n👉 PLEASE CHECK GOOGLE CONSOLE:`);
            console.log(`   1. Is the Client ID in Console: ${clientId} ?`);
            console.log(`   2. Is the Redirect URI in Console: ${redirectUri} ?`);
            
            if (!clientId || clientId.trim() === '') {
                console.log('❌ CRITICAL: Client ID is EMPTY! Check GOOGLE_CLIENT_ID env var.');
            }
        } else {
            console.log(`❌ Failed to get redirect. Status: ${res.statusCode}`);
        }
    });
}

checkOAuth();
