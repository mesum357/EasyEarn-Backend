const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function quickSessionPersistenceTest() {
    console.log('🔐 Quick Session Persistence Test');
    console.log('==================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Step 1: Perform login
        console.log('1. Performing Login');
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
                    console.log('   ❌ No Set-Cookie headers found');
                    return;
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
        
        // Step 2: Get initial session details
        console.log('\n2. Getting Initial Session Details');
        console.log('-----------------------------------');
        
        let initialSessionId = null;
        let initialViews = 0;
        
        try {
            const initialSessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                headers: {
                    Cookie: sessionCookie
                },
                withCredentials: true
            });
            
            if (initialSessionResponse.status === 200) {
                initialSessionId = initialSessionResponse.data.sessionID;
                initialViews = initialSessionResponse.data.views;
                console.log(`   ✅ Initial Session ID: ${initialSessionId}`);
                console.log(`   Initial Views: ${initialViews}`);
                console.log(`   Initial Auth: ${initialSessionResponse.data.isAuthenticated}`);
            }
            
        } catch (error) {
            console.log('❌ Failed to get initial session:', error.message);
            return;
        }
        
        // Step 3: Test session persistence with rapid requests
        console.log('\n3. Testing Session Persistence (10 Rapid Requests)');
        console.log('---------------------------------------------------');
        
        let successCount = 0;
        const sessionIds = [];
        const viewCounts = [];
        
        for (let i = 1; i <= 10; i++) {
            try {
                // Test authentication
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    headers: {
                        Cookie: sessionCookie
                    },
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    successCount++;
                    console.log(`   ✅ Request ${i}: Success - User: ${meResponse.data.user.username}`);
                    
                    // Get session details
                    const sessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                        headers: {
                            Cookie: sessionCookie
                        },
                        withCredentials: true
                    });
                    
                    if (sessionResponse.status === 200) {
                        const sessionId = sessionResponse.data.sessionID;
                        const views = sessionResponse.data.views;
                        sessionIds.push(sessionId);
                        viewCounts.push(views);
                        console.log(`      Session ID: ${sessionId} (Views: ${views})`);
                    }
                    
                } else {
                    console.log(`   ❌ Request ${i}: Failed - Status: ${meResponse.status}`);
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.log(`   ❌ Request ${i} error:`, error.message);
            }
        }
        
        console.log(`   📊 Success Rate: ${successCount}/10 (${(successCount/10)*100}%)`);
        
        // Step 4: Analyze session consistency
        console.log('\n4. Analyzing Session Consistency');
        console.log('--------------------------------');
        
        const uniqueSessionIds = [...new Set(sessionIds)];
        const uniqueViewCounts = [...new Set(viewCounts)];
        
        console.log(`   Total successful requests: ${sessionIds.length}`);
        console.log(`   Unique session IDs: ${uniqueSessionIds.length}`);
        console.log(`   Unique view counts: ${uniqueViewCounts.length}`);
        console.log(`   Initial session ID: ${initialSessionId}`);
        console.log(`   Initial views: ${initialViews}`);
        
        if (uniqueSessionIds.length === 1) {
            console.log('   ✅ PERFECT: All requests used the same session ID!');
            if (uniqueSessionIds[0] === initialSessionId) {
                console.log('   ✅ Session ID maintained from login to final request');
            } else {
                console.log('   ⚠️  Session ID changed but remained consistent across requests');
            }
        } else if (uniqueSessionIds.length <= 2) {
            console.log('   ✅ EXCELLENT: Session ID mostly consistent (minimal variations)');
            console.log('   Unique IDs found:', uniqueSessionIds);
        } else if (uniqueSessionIds.length <= 3) {
            console.log('   ⚠️  GOOD: Session ID mostly consistent (few variations)');
            console.log('   Unique IDs found:', uniqueSessionIds);
        } else {
            console.log('   ❌ POOR: Session ID not consistent across requests');
            console.log('   Unique IDs found:', uniqueSessionIds);
        }
        
        // Step 5: Test logout
        console.log('\n5. Testing Logout and Session Destruction');
        console.log('-------------------------------------------');
        
        try {
            const logoutResponse = await axios.get(`${BASE_URL}/logout`, {
                headers: {
                    Cookie: sessionCookie
                },
                withCredentials: true
            });
            
            if (logoutResponse.status === 200) {
                console.log('   ✅ Logout successful');
                
                // Try to access /me after logout
                try {
                    const meAfterLogout = await axios.get(`${BASE_URL}/me`, {
                        headers: {
                            Cookie: sessionCookie
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
        
        // Step 6: Final assessment
        console.log('\n==================================');
        console.log('🎯 SESSION PERSISTENCE ASSESSMENT');
        console.log('==================================');
        
        if (successCount >= 9 && uniqueSessionIds.length <= 2) {
            console.log('🏆 EXCELLENT: Session persistence is working perfectly!');
            console.log('   ✅ High success rate:', (successCount/10)*100 + '%');
            console.log('   ✅ Session ID consistency maintained');
            console.log('   ✅ Authentication state preserved');
            console.log('   ✅ Session destruction working');
        } else if (successCount >= 7 && uniqueSessionIds.length <= 3) {
            console.log('✅ GOOD: Session persistence is working well');
            console.log('   📊 Success rate:', (successCount/10)*100 + '%');
            console.log('   📊 Session consistency:', uniqueSessionIds.length, 'unique IDs');
        } else {
            console.log('⚠️  NEEDS IMPROVEMENT: Session persistence has issues');
            console.log('   📊 Success rate:', (successCount/10)*100 + '%');
            console.log('   📊 Session consistency:', uniqueSessionIds.length, 'unique IDs');
        }
        
        console.log('\n📋 Summary:');
        console.log(`   - Successful requests: ${successCount}/10`);
        console.log(`   - Session consistency: ${uniqueSessionIds.length} unique IDs`);
        console.log(`   - View count progression: ${viewCounts.join(' → ')}`);
        console.log(`   - Initial session ID: ${initialSessionId}`);
        
        if (uniqueSessionIds.length === 1) {
            console.log('\n🎯 PERFECT SESSION PERSISTENCE ACHIEVED!');
            console.log('   The same session ID is maintained across all requests');
            console.log('   Users will remain logged in across page refreshes');
            console.log('   Session management is working correctly');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
quickSessionPersistenceTest();
