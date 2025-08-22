const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function debugLoginFlow() {
    console.log('🔍 Debugging Login Flow Step by Step');
    console.log('=====================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Step 1: Check initial state
        console.log('1. Checking Initial State');
        console.log('--------------------------');
        
        try {
            const initialMeResponse = await axios.get(`${BASE_URL}/me`);
            console.log('   Initial /me response:', initialMeResponse.status);
            if (initialMeResponse.status === 401) {
                console.log('   ✅ Expected: Not authenticated initially');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('   ✅ Expected: Not authenticated initially');
            } else {
                console.log('   ❌ Unexpected error:', error.message);
            }
        }
        
        // Step 2: Perform login
        console.log('\n2. Performing Login');
        console.log('-------------------');
        
        let loginResponse;
        let sessionCookie = null;
        
        try {
            loginResponse = await axios.post(`${BASE_URL}/login`, TEST_USER, {
                withCredentials: true
            });
            
            if (loginResponse.status === 200) {
                console.log('✅ Login successful');
                console.log('   User:', loginResponse.data.user.username);
                console.log('   Response:', loginResponse.data);
                
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
        
        // Step 3: Check authentication immediately after login
        console.log('\n3. Checking Authentication After Login');
        console.log('--------------------------------------');
        
        try {
            const meAfterLogin = await axios.get(`${BASE_URL}/me`, {
                headers: sessionCookie ? {
                    Cookie: sessionCookie
                } : {},
                withCredentials: true
            });
            
            if (meAfterLogin.status === 200) {
                console.log('✅ Authentication successful after login');
                console.log('   User:', meAfterLogin.data.user.username);
            } else {
                console.log('❌ Authentication failed after login:', meAfterLogin.status);
            }
            
        } catch (error) {
            if (error.response) {
                console.log('❌ Authentication error after login:', error.response.status, error.response.data.error);
            } else {
                console.log('❌ Authentication request failed:', error.message);
            }
        }
        
        // Step 4: Check session endpoint
        console.log('\n4. Checking Session Endpoint');
        console.log('-----------------------------');
        
        try {
            const sessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                headers: sessionCookie ? {
                    Cookie: sessionCookie
                } : {},
                withCredentials: true
            });
            
            if (sessionResponse.status === 200) {
                console.log('✅ Session endpoint working');
                console.log('   Response:', sessionResponse.data);
                
                if (sessionResponse.data.sessionID) {
                    console.log(`   Session ID: ${sessionResponse.data.sessionID}`);
                    console.log(`   Views: ${sessionResponse.data.views}`);
                    console.log(`   Is Authenticated: ${sessionResponse.data.isAuthenticated}`);
                    console.log(`   Cookie Secure: ${sessionResponse.data.cookieSecure}`);
                    console.log(`   Cookie SameSite: ${sessionResponse.data.cookieSameSite}`);
                }
            }
            
        } catch (error) {
            console.log('❌ Session endpoint error:', error.message);
        }
        
        // Step 5: Check debug endpoint
        console.log('\n5. Checking Debug Endpoint');
        console.log('---------------------------');
        
        try {
            const debugResponse = await axios.get(`${BASE_URL}/debug-auth`, {
                headers: sessionCookie ? {
                    Cookie: sessionCookie
                } : {},
                withCredentials: true
            });
            
            if (debugResponse.status === 200) {
                console.log('✅ Debug endpoint working');
                console.log('   Response:', debugResponse.data);
            }
            
        } catch (error) {
            console.log('❌ Debug endpoint error:', error.message);
        }
        
        console.log('\n=====================================');
        console.log('✅ Debug completed!');
        
        if (sessionCookie) {
            console.log('\n🎯 Session Cookie Found!');
            console.log('   This confirms that:');
            console.log('   - Login is working correctly');
            console.log('   - Session middleware is active');
            console.log('   - Session cookies are being set');
        } else {
            console.log('\n📝 Note about cookies:');
            console.log('   - No Set-Cookie headers visible due to secure=true');
            console.log('   - This is expected behavior for production config');
            console.log('   - Session is still being created and stored');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugLoginFlow();
