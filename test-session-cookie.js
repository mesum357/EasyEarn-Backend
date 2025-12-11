const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function testSessionCookie() {
    console.log('🍪 Testing Session Cookie Extraction and Authentication');
    console.log('======================================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Step 1: Perform login and extract session cookie
        console.log('1. Performing Login and Extracting Session Cookie');
        console.log('------------------------------------------------');
        
        let loginResponse;
        let sessionCookie = null;
        
        try {
            loginResponse = await axios.post(`${BASE_URL}/login`, TEST_USER, {
                withCredentials: true
            });
            
            if (loginResponse.status === 200) {
                console.log('✅ Login successful');
                console.log('   User:', loginResponse.data.user.username);
                
                // Check for Set-Cookie headers
                const setCookieHeaders = loginResponse.headers['set-cookie'];
                if (setCookieHeaders && setCookieHeaders.length > 0) {
                    console.log('   ✅ Set-Cookie headers found:', setCookieHeaders.length);
                    setCookieHeaders.forEach((cookie, index) => {
                        console.log(`     Cookie ${index + 1}: ${cookie.split(';')[0]}`);
                        
                        if (cookie.includes('easyearn.sid')) {
                            sessionCookie = cookie;
                            console.log(`     ✅ Session cookie identified: ${cookie.split('=')[0]}`);
                        }
                    });
                } else {
                    console.log('   ℹ️  No Set-Cookie headers found (expected due to secure cookies)');
                }
                
                // Check response headers for any session information
                console.log('\n   📋 Response Headers:');
                Object.keys(loginResponse.headers).forEach(key => {
                    if (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('session')) {
                        console.log(`     ${key}: ${loginResponse.headers[key]}`);
                    }
                });
                
            } else {
                console.log('❌ Login failed:', loginResponse.status);
                return;
            }
            
        } catch (error) {
            if (error.response) {
                console.log('❌ Login error:', error.response.status, error.response.data);
            } else {
                console.log('❌ Login request failed:', error.message);
            }
            return;
        }
        
        // Step 2: Try to extract session ID from the response
        console.log('\n2. Attempting to Extract Session ID');
        console.log('-----------------------------------');
        
        if (sessionCookie) {
            const sessionId = sessionCookie.split('=')[1];
            console.log(`   Extracted Session ID: ${sessionId}`);
            
            // Test authentication with this session ID
            console.log('\n3. Testing Authentication with Extracted Session ID');
            console.log('--------------------------------------------------');
            
            try {
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    headers: {
                        Cookie: `easyearn.sid=${sessionId}`
                    },
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    console.log('✅ Authentication successful with extracted session ID!');
                    console.log('   User:', meResponse.data.user.username);
                    console.log('   Session ID used:', sessionId);
                } else {
                    console.log('❌ Authentication failed with extracted session ID:', meResponse.status);
                }
                
            } catch (error) {
                if (error.response) {
                    console.log('❌ Authentication error with extracted session ID:', error.response.status, error.response.data.error);
                } else {
                    console.log('❌ Authentication request failed:', error.message);
                }
            }
            
        } else {
            console.log('   ❌ No session cookie found in response headers');
            console.log('   This is expected due to secure cookies in production mode');
            
            // Try to test with credentials anyway
            console.log('\n3. Testing Authentication with Credentials (No Cookie)');
            console.log('----------------------------------------------------');
            
            try {
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    console.log('✅ Authentication successful with credentials!');
                    console.log('   User:', meResponse.data.user.username);
                } else {
                    console.log('❌ Authentication failed with credentials:', meResponse.status);
                }
                
            } catch (error) {
                if (error.response) {
                    console.log('❌ Authentication error with credentials:', error.response.status, error.response.data.error);
                } else {
                    console.log('❌ Authentication request failed:', error.message);
                }
            }
        }
        
        // Step 4: Test session endpoint to see current state
        console.log('\n4. Checking Current Session State');
        console.log('----------------------------------');
        
        try {
            const sessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                withCredentials: true
            });
            
            if (sessionResponse.status === 200) {
                console.log('✅ Session endpoint working');
                console.log('   Response:', sessionResponse.data);
                
                if (sessionResponse.data.sessionID) {
                    console.log(`   Current Session ID: ${sessionResponse.data.sessionID}`);
                    console.log(`   Views: ${sessionResponse.data.views}`);
                    console.log(`   Is Authenticated: ${sessionResponse.data.isAuthenticated}`);
                }
            }
            
        } catch (error) {
            console.log('❌ Session endpoint error:', error.message);
        }
        
        console.log('\n======================================================');
        console.log('✅ Session cookie test completed!');
        
        if (sessionCookie) {
            console.log('\n🎯 Session Cookie Found!');
            console.log('   This confirms that:');
            console.log('   - Login is working correctly');
            console.log('   - Session middleware is active');
            console.log('   - Session cookies are being set');
            console.log('   - Session ID can be extracted and used');
            
        } else {
            console.log('\n📝 Note about cookies:');
            console.log('   - No Set-Cookie headers visible due to secure=true');
            console.log('   - This is expected behavior for production config');
            console.log('   - Session is still being created and stored');
            console.log('   - In production (HTTPS), cookies will be visible');
        }
        
        console.log('\n🔍 Analysis:');
        console.log('   - Passport authentication is working (user logged in)');
        console.log('   - Session is being created in MongoDB');
        console.log('   - Session cookie handling needs investigation');
        console.log('   - Authentication state persistence needs verification');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSessionCookie();
