const axios = require('axios');

const PRODUCTION_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

async function testProductionMe() {
    console.log('🧪 Testing production /me endpoint...\n');

    try {
        // Create axios instance with cookie handling
        const client = axios.create({
            baseURL: PRODUCTION_URL,
            withCredentials: true,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('1️⃣ Testing direct /me call (should fail)...');
        try {
            const response = await client.get('/me');
            console.log('✅ Unexpected success:', response.data);
        } catch (error) {
            console.log('❌ Expected failure:', error.response?.data);
            console.log('   Status:', error.response?.status);
        }

        console.log('\n2️⃣ Creating test user...');
        const testUser = {
            username: `testuser_${Date.now()}`,
            email: `testuser_${Date.now()}@test.com`,
            password: 'testpass123',
            confirmPassword: 'testpass123'
        };

        const registerResponse = await client.post('/register', testUser);
        console.log('✅ User registered:', {
            success: registerResponse.data.success,
            autoVerified: registerResponse.data.autoVerified,
            referralCode: registerResponse.data.referralCode
        });

        console.log('\n3️⃣ Logging in...');
        const loginResponse = await client.post('/login', {
            username: testUser.email,
            password: testUser.password
        });

        console.log('✅ Login response:', {
            success: loginResponse.data.success,
            user: loginResponse.data.user,
            sessionId: loginResponse.data.session?.id
        });

        // Check cookies from login response
        const setCookieHeaders = loginResponse.headers['set-cookie'];
        console.log('🍪 Login response cookies:', setCookieHeaders);
        console.log('🍪 All response headers:', Object.keys(loginResponse.headers));
        
        // Check specific headers
        console.log('🍪 Access-Control-Allow-Credentials:', loginResponse.headers['access-control-allow-credentials']);
        console.log('🍪 Access-Control-Expose-Headers:', loginResponse.headers['access-control-expose-headers']);
        console.log('🍪 Set-Cookie header explicitly:', loginResponse.headers['set-cookie']);
        
        // Check if cookie is actually being returned
        const cookieRegex = /easyearn\.sid=([^;]+)/;
        const allHeaders = JSON.stringify(loginResponse.headers, null, 2);
        console.log('🍪 Full headers object:', allHeaders);

        console.log('\n4️⃣ Testing /me endpoint after login...');
        
        // Test with explicit cookie forwarding
        let cookieHeader = '';
        if (setCookieHeaders && setCookieHeaders.length > 0) {
            cookieHeader = setCookieHeaders
                .map(cookie => cookie.split(';')[0])
                .join('; ');
        }

        console.log('🍪 Sending cookies:', cookieHeader);

        const meResponse = await client.get('/me', {
            headers: {
                'Cookie': cookieHeader
            }
        });

        console.log('✅ /me response:', {
            user: meResponse.data.user,
            sessionId: meResponse.data.sessionId,
            recovered: meResponse.data.recovered
        });

        console.log('\n5️⃣ Testing without explicit cookie header...');
        try {
            const meResponse2 = await client.get('/me');
            console.log('✅ /me response (no explicit cookies):', {
                user: meResponse2.data.user ? 'present' : 'missing',
                sessionId: meResponse2.data.sessionId,
                recovered: meResponse2.data.recovered
            });
        } catch (error) {
            console.log('❌ /me failed without cookies:', error.response?.data);
        }

    } catch (error) {
        console.error('❌ Test failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
    }
}

testProductionMe();
