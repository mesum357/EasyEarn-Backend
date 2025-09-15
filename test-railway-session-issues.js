const axios = require('axios');

// Test configuration for Railway deployment
const RAILWAY_URL = 'https://easyearn-backend-production-01ac.up.railway.app';
const LOCAL_URL = 'http://localhost:3005';

// Test user credentials - update with valid user from your database
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

let sessionCookies = [];
let currentSessionId = null;

console.log('🚂 RAILWAY SESSION ISSUES DIAGNOSTIC TEST');
console.log('==========================================');
console.log(`Testing Railway URL: ${RAILWAY_URL}`);
console.log(`Testing Local URL: ${LOCAL_URL}`);
console.log('');

async function testRailwaySessionIssues() {
    try {
        // Test 1: Check Railway connectivity
        console.log('1. 🚂 Railway Connectivity Test');
        console.log('--------------------------------');
        
        try {
            const healthResponse = await axios.get(`${RAILWAY_URL}/health`, {
                timeout: 10000
            });
            console.log('✅ Railway backend is accessible');
            console.log('   Status:', healthResponse.status);
            console.log('   Response:', healthResponse.data);
        } catch (error) {
            console.log('❌ Railway backend connectivity issue:');
            if (error.code === 'ECONNRESET') {
                console.log('   - Connection reset (possible timeout)');
            } else if (error.code === 'ENOTFOUND') {
                console.log('   - Domain not found');
            } else if (error.response) {
                console.log('   - HTTP Error:', error.response.status);
            } else {
                console.log('   - Error:', error.message);
            }
            return;
        }

        // Test 2: Check session endpoint
        console.log('\n2. 🍪 Session Endpoint Test');
        console.log('----------------------------');
        
        try {
            const sessionResponse = await axios.get(`${RAILWAY_URL}/test-session`, {
                timeout: 10000
            });
            console.log('✅ Session endpoint accessible');
            console.log('   Status:', sessionResponse.status);
            console.log('   Session ID:', sessionResponse.data.sessionID);
            console.log('   Views:', sessionResponse.data.views);
            
            // Check for Set-Cookie header
            if (sessionResponse.headers['set-cookie']) {
                console.log('   ✅ Set-Cookie header present');
                sessionResponse.headers['set-cookie'].forEach((cookie, index) => {
                    console.log(`   Cookie ${index + 1}:`, cookie.split(';')[0]);
                });
            } else {
                console.log('   ❌ No Set-Cookie header found');
            }
        } catch (error) {
            console.log('❌ Session endpoint error:');
            if (error.response) {
                console.log('   - Status:', error.response.status);
                console.log('   - Error:', error.response.data);
            } else {
                console.log('   - Error:', error.message);
            }
        }

        // Test 3: Test login and session creation
        console.log('\n3. 🔐 Login and Session Creation Test');
        console.log('--------------------------------------');
        
        try {
            const loginResponse = await axios.post(`${RAILWAY_URL}/login`, TEST_USER, {
                withCredentials: true,
                timeout: 15000
            });
            
            if (loginResponse.status === 200) {
                console.log('✅ Login successful');
                console.log('   User:', loginResponse.data.user.username);
                console.log('   Session ID:', loginResponse.data.session?.id);
                
                // Extract and store cookies
                if (loginResponse.headers['set-cookie']) {
                    sessionCookies = loginResponse.headers['set-cookie'];
                    console.log('   ✅ Session cookies received:', sessionCookies.length);
                    sessionCookies.forEach((cookie, index) => {
                        console.log(`   Cookie ${index + 1}:`, cookie.split(';')[0]);
                    });
                    
                    // Extract session ID from cookie
                    const sessionCookie = sessionCookies.find(cookie => 
                        cookie.includes('easyearn.sid') || cookie.includes('connect.sid')
                    );
                    if (sessionCookie) {
                        const sidMatch = sessionCookie.match(/[^=]+=([^;]+)/);
                        if (sidMatch) {
                            currentSessionId = sidMatch[1];
                            console.log('   Session ID from cookie:', currentSessionId);
                        }
                    }
                } else {
                    console.log('   ❌ No session cookies received');
                }
            } else {
                console.log('❌ Login failed:', loginResponse.status);
                console.log('   Response:', loginResponse.data);
            }
        } catch (error) {
            console.log('❌ Login error:');
            if (error.response) {
                console.log('   - Status:', error.response.status);
                console.log('   - Error:', error.response.data);
            } else {
                console.log('   - Error:', error.message);
            }
            return;
        }

        // Test 4: Test session persistence
        if (sessionCookies.length > 0) {
            console.log('\n4. 🔄 Session Persistence Test');
            console.log('--------------------------------');
            
            const cookieHeader = sessionCookies.join('; ');
            
            for (let i = 1; i <= 3; i++) {
                console.log(`\n   Test ${i}: Accessing /me endpoint`);
                
                try {
                    const meResponse = await axios.get(`${RAILWAY_URL}/me`, {
                        headers: {
                            'Cookie': cookieHeader
                        },
                        withCredentials: true,
                        timeout: 10000
                    });
                    
                    if (meResponse.status === 200) {
                        console.log(`   ✅ Request ${i} successful`);
                        console.log(`   User authenticated:`, meResponse.data.user.username);
                        
                        // Check if session ID is consistent
                        if (meResponse.headers['x-session-id']) {
                            console.log(`   Session ID header:`, meResponse.headers['x-session-id']);
                        }
                    } else {
                        console.log(`   ❌ Request ${i} failed:`, meResponse.status);
                    }
                } catch (error) {
                    if (error.response) {
                        console.log(`   ❌ Request ${i} error:`, error.response.status);
                        if (error.response.status === 401) {
                            console.log('   - Unauthorized (session may have expired)');
                        }
                    } else {
                        console.log(`   ❌ Request ${i} error:`, error.message);
                    }
                }
                
                // Wait between requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Test 5: Check environment variables and configuration
        console.log('\n5. ⚙️ Environment and Configuration Check');
        console.log('------------------------------------------');
        
        try {
            const configResponse = await axios.get(`${RAILWAY_URL}/debug-config`, {
                timeout: 10000
            });
            
            if (configResponse.status === 200) {
                console.log('✅ Configuration endpoint accessible');
                console.log('   NODE_ENV:', configResponse.data.NODE_ENV);
                console.log('   Session Store:', configResponse.data.sessionStore);
                console.log('   Cookie Settings:', configResponse.data.cookieSettings);
                console.log('   Trust Proxy:', configResponse.data.trustProxy);
            }
        } catch (error) {
            console.log('ℹ️ Configuration endpoint not available (this is normal)');
        }

        // Test 6: Test CORS and cookie handling
        console.log('\n6. 🌐 CORS and Cookie Handling Test');
        console.log('-----------------------------------');
        
        try {
            const corsResponse = await axios.get(`${RAILWAY_URL}/api/test-cors`, {
                timeout: 10000
            });
            
            if (corsResponse.status === 200) {
                console.log('✅ CORS test successful');
                console.log('   Origin allowed:', corsResponse.data.origin);
                console.log('   Timestamp:', corsResponse.data.timestamp);
            }
        } catch (error) {
            console.log('ℹ️ CORS test endpoint not available');
        }

        // Test 7: Session cleanup test
        if (sessionCookies.length > 0) {
            console.log('\n7. 🧹 Session Cleanup Test');
            console.log('----------------------------');
            
            try {
                const logoutResponse = await axios.get(`${RAILWAY_URL}/logout`, {
                    headers: {
                        'Cookie': sessionCookies.join('; ')
                    },
                    withCredentials: true,
                    timeout: 10000
                });
                
                if (logoutResponse.status === 200) {
                    console.log('✅ Logout successful');
                    
                    // Try to access /me after logout
                    try {
                        const meAfterLogout = await axios.get(`${RAILWAY_URL}/me`, {
                            headers: {
                                'Cookie': sessionCookies.join('; ')
                            },
                            withCredentials: true,
                            timeout: 10000
                        });
                        
                        if (meAfterLogout.status === 401) {
                            console.log('✅ Session properly destroyed');
                        } else {
                            console.log('❌ Session still active after logout');
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 401) {
                            console.log('✅ Session properly destroyed');
                        } else {
                            console.log('❌ Unexpected error after logout:', error.message);
                        }
                    }
                } else {
                    console.log('❌ Logout failed:', logoutResponse.status);
                }
            } catch (error) {
                console.log('❌ Logout error:', error.message);
            }
        }

        // Summary and recommendations
        console.log('\n==========================================');
        console.log('📋 RAILWAY SESSION DIAGNOSTIC SUMMARY');
        console.log('==========================================');
        
        if (sessionCookies.length > 0) {
            console.log('✅ Session cookies are being set');
            console.log('✅ Session persistence appears to be working');
        } else {
            console.log('❌ No session cookies received');
            console.log('❌ Session creation may be failing');
        }
        
        console.log('\n🔧 Common Railway Session Issues:');
        console.log('1. NODE_ENV not set to "production"');
        console.log('2. Missing SESSION_SECRET environment variable');
        console.log('3. MongoDB connection issues');
        console.log('4. Cookie domain/path configuration');
        console.log('5. Trust proxy configuration');
        
        console.log('\n💡 Next Steps:');
        console.log('1. Check Railway environment variables');
        console.log('2. Verify MongoDB connection');
        console.log('3. Check session store configuration');
        console.log('4. Test with different browsers/clients');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testRailwaySessionIssues();
