const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials - verified to exist and work
const TEST_USER = {
    username: 'ishaqyash333@gmail.com',
    password: '123456'
};

async function testLoginWithExistingUser() {
    console.log('🔐 Testing Login with Existing User');
    console.log('====================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Step 1: Check server health
        console.log('1. Checking server health...');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/health`);
            console.log('✅ Server is healthy:', healthResponse.status);
        } catch (error) {
            console.log('❌ Server health check failed:', error.message);
            return;
        }
        
        // Step 2: Perform login
        console.log('\n2. Performing login...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/login`, TEST_USER, {
                withCredentials: true,
                timeout: 10000 // 10 second timeout
            });
            
            if (loginResponse.status === 200) {
                console.log('✅ Login successful!');
                console.log('   Response:', loginResponse.data);
                
                // Check for Set-Cookie headers
                const setCookieHeaders = loginResponse.headers['set-cookie'];
                if (setCookieHeaders && setCookieHeaders.length > 0) {
                    console.log('   ✅ Set-Cookie headers found:', setCookieHeaders.length);
                    setCookieHeaders.forEach((cookie, index) => {
                        console.log(`     Cookie ${index + 1}: ${cookie.split(';')[0]}`);
                    });
                } else {
                    console.log('   ❌ No Set-Cookie headers found');
                }
                
                // Step 3: Test authenticated request
                console.log('\n3. Testing authenticated request...');
                const sessionCookie = setCookieHeaders ? setCookieHeaders[0] : null;
                
                if (sessionCookie) {
                    try {
                        const meResponse = await axios.get(`${BASE_URL}/me`, {
                            headers: {
                                Cookie: sessionCookie
                            },
                            withCredentials: true
                        });
                        
                        if (meResponse.status === 200) {
                            console.log('✅ Authenticated request successful!');
                            console.log('   User data:', meResponse.data);
                        } else {
                            console.log('❌ Authenticated request failed:', meResponse.status);
                        }
                    } catch (error) {
                        console.log('❌ Authenticated request error:', error.message);
                    }
                }
                
            } else {
                console.log('❌ Login failed:', loginResponse.status);
            }
            
        } catch (error) {
            console.log('❌ Login failed');
            if (error.response) {
                console.log('   Status:', error.response.status);
                console.log('   Response data:', error.response.data);
            } else if (error.request) {
                console.log('   Request error (no response received)');
                console.log('   This suggests the server is not responding or crashed');
            } else {
                console.log('   Error:', error.message);
            }
        }
        
        console.log('\n====================================');
        console.log('🎯 Login Test Complete');
        console.log('====================================');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testLoginWithExistingUser();

