const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function testCookieHandling() {
    console.log('🍪 Testing Cookie Handling and Session Persistence');
    console.log('==================================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Step 1: Create an axios instance with cookie handling
        console.log('1. Creating Axios Instance with Cookie Handling');
        console.log('------------------------------------------------');
        
        const axiosInstance = axios.create({
            baseURL: BASE_URL,
            withCredentials: true,
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 500; // Accept all status codes less than 500
            }
        });
        
        console.log('✅ Axios instance created with withCredentials: true');
        
        // Step 2: Check initial state
        console.log('\n2. Checking Initial State');
        console.log('--------------------------');
        
        try {
            const initialMeResponse = await axiosInstance.get('/me');
            console.log('   Initial /me response:', initialMeResponse.status);
            if (initialMeResponse.status === 401) {
                console.log('   ✅ Expected: Not authenticated initially');
            }
        } catch (error) {
            console.log('   ❌ Initial request failed:', error.message);
        }
        
        // Step 3: Perform login
        console.log('\n3. Performing Login');
        console.log('-------------------');
        
        let loginResponse;
        
        try {
            loginResponse = await axiosInstance.post('/login', TEST_USER);
            
            if (loginResponse.status === 200) {
                console.log('✅ Login successful');
                console.log('   User:', loginResponse.data.user.username);
                
                // Check for Set-Cookie headers
                const setCookieHeaders = loginResponse.headers['set-cookie'];
                if (setCookieHeaders && setCookieHeaders.length > 0) {
                    console.log('   ✅ Set-Cookie headers found:', setCookieHeaders.length);
                    setCookieHeaders.forEach((cookie, index) => {
                        console.log(`     Cookie ${index + 1}: ${cookie.split(';')[0]}`);
                    });
                } else {
                    console.log('   ℹ️  No Set-Cookie headers found (expected due to secure cookies)');
                }
                
                // Check if axios instance has cookies
                console.log('   📋 Axios instance cookies:', axiosInstance.defaults.headers.Cookie || 'None');
                
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
        
        // Step 4: Test authentication immediately after login
        console.log('\n4. Testing Authentication After Login');
        console.log('--------------------------------------');
        
        try {
            const meAfterLogin = await axiosInstance.get('/me');
            
            if (meAfterLogin.status === 200) {
                console.log('✅ Authentication successful after login!');
                console.log('   User:', meAfterLogin.data.user.username);
                console.log('   Session maintained successfully');
            } else {
                console.log('❌ Authentication failed after login:', meAfterLogin.status);
                console.log('   Response:', meAfterLogin.data);
            }
            
        } catch (error) {
            if (error.response) {
                console.log('❌ Authentication error after login:', error.response.status, error.response.data.error);
            } else {
                console.log('❌ Authentication request failed:', error.message);
            }
        }
        
        // Step 5: Test multiple requests to verify session persistence
        console.log('\n5. Testing Session Persistence Across Multiple Requests');
        console.log('------------------------------------------------------');
        
        for (let i = 1; i <= 3; i++) {
            try {
                const meResponse = await axiosInstance.get('/me');
                
                if (meResponse.status === 200) {
                    console.log(`   ✅ Request ${i}: Authentication successful`);
                    console.log(`      User: ${meResponse.data.user.username}`);
                } else {
                    console.log(`   ❌ Request ${i}: Authentication failed (${meResponse.status})`);
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.log(`   ❌ Request ${i} failed:`, error.message);
            }
        }
        
        // Step 6: Test session endpoint
        console.log('\n6. Testing Session Endpoint');
        console.log('-----------------------------');
        
        try {
            const sessionResponse = await axiosInstance.get('/test-session');
            
            if (sessionResponse.status === 200) {
                console.log('✅ Session endpoint working');
                console.log('   Response:', sessionResponse.data);
                
                if (sessionResponse.data.sessionID) {
                    console.log(`   Session ID: ${sessionResponse.data.sessionID}`);
                    console.log(`   Views: ${sessionResponse.data.views}`);
                    console.log(`   Is Authenticated: ${sessionResponse.data.isAuthenticated}`);
                }
            }
            
        } catch (error) {
            console.log('❌ Session endpoint error:', error.message);
        }
        
        // Step 7: Test logout
        console.log('\n7. Testing Logout');
        console.log('-----------------');
        
        try {
            const logoutResponse = await axiosInstance.get('/logout');
            
            if (logoutResponse.status === 200) {
                console.log('   ✅ Logout successful');
                
                // Try to access /me after logout
                try {
                    const meAfterLogout = await axiosInstance.get('/me');
                    
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
        
        console.log('\n==================================================');
        console.log('✅ Cookie handling test completed!');
        
        console.log('\n🔍 Analysis:');
        console.log('   - Axios instance with withCredentials: true created');
        console.log('   - Login successful and session created');
        console.log('   - Session persistence tested across multiple requests');
        console.log('   - Logout and session destruction verified');
        
        console.log('\n🎯 Expected Results:');
        console.log('   - Session should persist across multiple requests');
        console.log('   - Authentication state should be maintained');
        console.log('   - Same session ID should be used');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCookieHandling();
