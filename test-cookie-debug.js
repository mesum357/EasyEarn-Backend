const axios = require('axios');

const PRODUCTION_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

async function testCookieDebug() {
    console.log('🔍 Testing cookie debugging...\n');

    try {
        // Create axios instance with proper headers
        const client = axios.create({
            baseURL: PRODUCTION_URL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('1️⃣ Testing cookie debug endpoint...');
        const debugResponse = await client.get('/debug/cookies');
        
        console.log('✅ Debug response:', debugResponse.data);
        console.log('🍪 Debug response headers:', debugResponse.headers['set-cookie']);

        console.log('\n2️⃣ Testing session test endpoint...');
        const sessionResponse = await client.get('/test-session');
        
        console.log('✅ Session response:', sessionResponse.data);
        console.log('🍪 Session response headers:', sessionResponse.headers['set-cookie']);

    } catch (error) {
        console.error('❌ Test failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testCookieDebug();
