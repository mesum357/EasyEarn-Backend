const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function testSessionWithLogin() {
    console.log('🔐 Testing Session with Actual Login');
    console.log('=====================================');
    
    try {
        // Step 1: Perform login
        console.log('\n1. Performing Login');
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
                        console.log(`     Cookie ${index + 1}: ${cookie}`);
                        
                        // Check if this is a session cookie
                        if (cookie.includes('easyearn.sid')) {
                            sessionCookie = cookie;
                            console.log(`     ✅ Session cookie identified: ${cookie.split('=')[0]}`);
                        }
                    });
                } else {
                    console.log('   ❌ No Set-Cookie headers found');
                    console.log('   Available headers:', Object.keys(loginResponse.headers));
                }
                
                // Check all response headers for debugging
                console.log('\n   All response headers:');
                Object.entries(loginResponse.headers).forEach(([key, value]) => {
                    if (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('session')) {
                        console.log(`     ${key}: ${value}`);
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
        
        if (!sessionCookie) {
            console.log('\n❌ No session cookie found - cannot test session persistence');
            console.log('   This suggests the session middleware might not be setting cookies properly');
            return;
        }
        
        // Step 2: Test session persistence
        console.log('\n2. Testing Session Persistence');
        console.log('-------------------------------');
        
        const cookies = [sessionCookie];
        
        for (let i = 1; i <= 3; i++) {
            console.log(`\n   Request ${i}: Testing /me endpoint`);
            
            try {
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    headers: {
                        Cookie: cookies.join('; ')
                    },
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    console.log(`   ✅ Request ${i} successful`);
                    console.log(`   User authenticated:`, meResponse.data.user.username);
                    
                    // Check if we're getting the same user data
                    if (meResponse.data.user.email === TEST_USER.username) {
                        console.log(`   ✅ Same user data maintained`);
                    } else {
                        console.log(`   ❌ User data changed:`, meResponse.data.user.email);
                    }
                    
                    // Check if session cookie is still valid
                    const responseCookies = meResponse.headers['set-cookie'];
                    if (responseCookies) {
                        console.log(`   ℹ️  Response cookies:`, responseCookies.length);
                    }
                    
                } else {
                    console.log(`   ❌ Request ${i} failed:`, meResponse.status);
                }
                
            } catch (error) {
                if (error.response) {
                    console.log(`   ❌ Request ${i} error:`, error.response.status, error.response.data.error);
                } else {
                    console.log(`   ❌ Request ${i} error:`, error.message);
                }
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Step 3: Test logout
        console.log('\n3. Testing Logout');
        console.log('-----------------');
        
        try {
            const logoutResponse = await axios.get(`${BASE_URL}/logout`, {
                headers: {
                    Cookie: cookies.join('; ')
                },
                withCredentials: true
            });
            
            if (logoutResponse.status === 200) {
                console.log('   ✅ Logout successful');
                
                // Try to access /me after logout
                try {
                    const meAfterLogout = await axios.get(`${BASE_URL}/me`, {
                        headers: {
                            Cookie: cookies.join('; ')
                        },
                        withCredentials: true
                    });
                    
                    if (meAfterLogout.status === 401) {
                        console.log('   ✅ Session properly destroyed - /me returns 401');
                    } else {
                        console.log('   ❌ Session still active after logout');
                    }
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        console.log('   ✅ Session properly destroyed - /me returns 401');
                    } else {
                        console.log('   ❌ Unexpected error after logout:', error.message);
                    }
                }
                
            } else {
                console.log('   ❌ Logout failed:', logoutResponse.status);
            }
            
        } catch (error) {
            console.log('   ❌ Logout error:', error.message);
        }
        
        console.log('\n=====================================');
        console.log('✅ Session with login test completed!');
        
        if (sessionCookie) {
            console.log('\n🎯 Session Cookie Found!');
            console.log('   This confirms that:');
            console.log('   - Login is working correctly');
            console.log('   - Session middleware is active');
            console.log('   - Session cookies are being set');
            console.log('   - Session persistence can be tested');
        } else {
            console.log('\n⚠️  No Session Cookie Found');
            console.log('   This suggests:');
            console.log('   - Session middleware might not be working');
            console.log('   - Cookie settings might be incorrect');
            console.log('   - Need to check session configuration');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSessionWithLogin();

