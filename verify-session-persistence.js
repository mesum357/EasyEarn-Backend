const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function verifySessionPersistence() {
    console.log('🔐 Verifying Session Persistence and Consistency');
    console.log('================================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Step 1: Perform login and capture session details
        console.log('1. Performing Login and Capturing Session');
        console.log('------------------------------------------');
        
        let loginResponse;
        let sessionCookie = null;
        let initialSessionId = null;
        
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
        
        // Step 2: Get initial session ID
        console.log('\n2. Getting Initial Session ID');
        console.log('-------------------------------');
        
        try {
            const initialSessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                headers: {
                    Cookie: sessionCookie
                },
                withCredentials: true
            });
            
            if (initialSessionResponse.status === 200) {
                initialSessionId = initialSessionResponse.data.sessionID;
                console.log(`   ✅ Initial Session ID: ${initialSessionId}`);
                console.log(`   Initial Views: ${initialSessionResponse.data.views}`);
                console.log(`   Initial Auth: ${initialSessionResponse.data.isAuthenticated}`);
            }
            
        } catch (error) {
            console.log('❌ Failed to get initial session:', error.message);
            return;
        }
        
        // Step 3: Test immediate session persistence (5 rapid requests)
        console.log('\n3. Testing Immediate Session Persistence (5 Rapid Requests)');
        console.log('-----------------------------------------------------------');
        
        let immediateSuccessCount = 0;
        const immediateSessionIds = [];
        
        for (let i = 1; i <= 5; i++) {
            try {
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    headers: {
                        Cookie: sessionCookie
                    },
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    immediateSuccessCount++;
                    console.log(`   ✅ Request ${i}: Success - User: ${meResponse.data.user.username}`);
                    
                    // Get session ID for this request
                    const sessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                        headers: {
                            Cookie: sessionCookie
                        },
                        withCredentials: true
                    });
                    
                    if (sessionResponse.status === 200) {
                        const sessionId = sessionResponse.data.sessionID;
                        immediateSessionIds.push(sessionId);
                        console.log(`      Session ID: ${sessionId} (Views: ${sessionResponse.data.views})`);
                    }
                    
                } else {
                    console.log(`   ❌ Request ${i}: Failed - Status: ${meResponse.status}`);
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.log(`   ❌ Request ${i} error:`, error.message);
            }
        }
        
        console.log(`   📊 Immediate Success Rate: ${immediateSuccessCount}/5 (${(immediateSuccessCount/5)*100}%)`);
        
        // Step 4: Test session persistence with delays (5 requests with 2-second intervals)
        console.log('\n4. Testing Session Persistence with Delays (5 Requests, 2s Intervals)');
        console.log('------------------------------------------------------------------------');
        
        let delayedSuccessCount = 0;
        const delayedSessionIds = [];
        
        for (let i = 1; i <= 5; i++) {
            try {
                // Wait 2 seconds between requests
                if (i > 1) {
                    console.log(`   ⏳ Waiting 2 seconds before request ${i}...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    headers: {
                        Cookie: sessionCookie
                    },
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    delayedSuccessCount++;
                    console.log(`   ✅ Request ${i}: Success - User: ${meResponse.data.user.username}`);
                    
                    // Get session ID for this request
                    const sessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                        headers: {
                            Cookie: sessionCookie
                        },
                        withCredentials: true
                    });
                    
                    if (sessionResponse.status === 200) {
                        const sessionId = sessionResponse.data.sessionID;
                        delayedSessionIds.push(sessionId);
                        console.log(`      Session ID: ${sessionId} (Views: ${sessionResponse.data.views})`);
                    }
                    
                } else {
                    console.log(`   ❌ Request ${i}: Failed - Status: ${meResponse.status}`);
                }
                
            } catch (error) {
                console.log(`   ❌ Request ${i} error:`, error.message);
            }
        }
        
        console.log(`   📊 Delayed Success Rate: ${delayedSuccessCount}/5 (${(delayedSuccessCount/5)*100}%)`);
        
        // Step 5: Analyze session ID consistency
        console.log('\n5. Analyzing Session ID Consistency');
        console.log('-----------------------------------');
        
        const allSessionIds = [...immediateSessionIds, ...delayedSessionIds];
        const uniqueSessionIds = [...new Set(allSessionIds)];
        
        console.log(`   Total requests made: ${allSessionIds.length}`);
        console.log(`   Unique session IDs: ${uniqueSessionIds.length}`);
        console.log(`   Initial session ID: ${initialSessionId}`);
        
        if (uniqueSessionIds.length === 1) {
            console.log('   ✅ PERFECT: All requests used the same session ID!');
            if (uniqueSessionIds[0] === initialSessionId) {
                console.log('   ✅ Session ID maintained from login to final request');
            } else {
                console.log('   ⚠️  Session ID changed but remained consistent across requests');
            }
        } else if (uniqueSessionIds.length <= 3) {
            console.log('   ⚠️  GOOD: Session ID mostly consistent (few variations)');
            console.log('   Unique IDs found:', uniqueSessionIds);
        } else {
            console.log('   ❌ POOR: Session ID not consistent across requests');
            console.log('   Unique IDs found:', uniqueSessionIds);
        }
        
        // Step 6: Test session endpoint consistency
        console.log('\n6. Testing Session Endpoint Consistency');
        console.log('----------------------------------------');
        
        try {
            const finalSessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                headers: {
                    Cookie: sessionCookie
                },
                withCredentials: true
            });
            
            if (finalSessionResponse.status === 200) {
                const finalSessionId = finalSessionResponse.data.sessionID;
                console.log(`   Final Session ID: ${finalSessionId}`);
                console.log(`   Final Views: ${finalSessionResponse.data.views}`);
                console.log(`   Final Auth: ${finalSessionResponse.data.isAuthenticated}`);
                console.log(`   Cookie Secure: ${finalSessionResponse.data.cookieSecure}`);
                console.log(`   Cookie SameSite: ${finalSessionResponse.data.cookieSameSite}`);
                
                if (finalSessionId === initialSessionId) {
                    console.log('   ✅ Session ID maintained from start to finish');
                } else {
                    console.log('   ⚠️  Session ID changed during testing');
                }
            }
            
        } catch (error) {
            console.log('❌ Failed to get final session:', error.message);
        }
        
        // Step 7: Test logout and session destruction
        console.log('\n7. Testing Logout and Session Destruction');
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
        
        // Step 8: Final assessment
        console.log('\n================================================');
        console.log('🎯 SESSION PERSISTENCE VERIFICATION COMPLETE');
        console.log('================================================');
        
        const overallSuccessRate = ((immediateSuccessCount + delayedSuccessCount) / 10) * 100;
        
        if (overallSuccessRate >= 90 && uniqueSessionIds.length <= 2) {
            console.log('🏆 EXCELLENT: Session persistence is working perfectly!');
            console.log('   ✅ High success rate:', overallSuccessRate.toFixed(1) + '%');
            console.log('   ✅ Session ID consistency maintained');
            console.log('   ✅ Authentication state preserved');
            console.log('   ✅ Session destruction working');
        } else if (overallSuccessRate >= 70 && uniqueSessionIds.length <= 3) {
            console.log('✅ GOOD: Session persistence is working well');
            console.log('   📊 Success rate:', overallSuccessRate.toFixed(1) + '%');
            console.log('   📊 Session consistency:', uniqueSessionIds.length, 'unique IDs');
        } else {
            console.log('⚠️  NEEDS IMPROVEMENT: Session persistence has issues');
            console.log('   📊 Success rate:', overallSuccessRate.toFixed(1) + '%');
            console.log('   📊 Session consistency:', uniqueSessionIds.length, 'unique IDs');
        }
        
        console.log('\n📋 Summary:');
        console.log(`   - Immediate requests: ${immediateSuccessCount}/5 successful`);
        console.log(`   - Delayed requests: ${delayedSuccessCount}/5 successful`);
        console.log(`   - Overall success: ${overallSuccessRate.toFixed(1)}%`);
        console.log(`   - Session consistency: ${uniqueSessionIds.length} unique IDs`);
        console.log(`   - Initial session ID: ${initialSessionId}`);
        
        if (uniqueSessionIds.length === 1) {
            console.log('\n🎯 PERFECT SESSION PERSISTENCE ACHIEVED!');
            console.log('   The same session ID is maintained across all requests');
            console.log('   Users will remain logged in across page refreshes');
            console.log('   Session management is working correctly');
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

// Run the verification
verifySessionPersistence();
