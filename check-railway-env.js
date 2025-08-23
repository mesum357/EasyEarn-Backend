const axios = require('axios');

const RAILWAY_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

console.log('🔍 Checking Railway Environment Variables and Configuration');
console.log('==========================================================');
console.log(`Testing URL: ${RAILWAY_URL}`);
console.log('');

async function checkRailwayEnvironment() {
    try {
        // Test 1: Check if backend is accessible
        console.log('1. 🚂 Backend Accessibility');
        console.log('----------------------------');
        
        try {
            const healthResponse = await axios.get(`${RAILWAY_URL}/health`, {
                timeout: 10000
            });
            console.log('✅ Backend is accessible');
            console.log('   Status:', healthResponse.status);
            console.log('   Environment:', healthResponse.data.environment);
            console.log('   Session Active:', healthResponse.data.session?.active ? 'Yes' : 'No');
        } catch (error) {
            console.log('❌ Backend not accessible:', error.message);
            return;
        }

        // Test 2: Check debug configuration
        console.log('\n2. ⚙️ Environment Configuration');
        console.log('--------------------------------');
        
        try {
            const configResponse = await axios.get(`${RAILWAY_URL}/debug-config`, {
                timeout: 10000
            });
            
            if (configResponse.status === 200) {
                const config = configResponse.data;
                console.log('✅ Configuration endpoint accessible');
                console.log('');
                console.log('📋 Environment Variables:');
                console.log(`   NODE_ENV: ${config.NODE_ENV}`);
                console.log(`   SESSION_SECRET: ${config.SESSION_SECRET}`);
                console.log(`   SESSION_NAME: ${config.SESSION_NAME}`);
                console.log(`   SESSION_MAX_AGE: ${config.SESSION_MAX_AGE}`);
                console.log(`   MONGODB_URI: ${config.MONGODB_URI}`);
                console.log('');
                console.log('🍪 Cookie Settings:');
                console.log(`   Secure: ${config.cookieSettings.secure}`);
                console.log(`   SameSite: ${config.cookieSettings.sameSite}`);
                console.log(`   HttpOnly: ${config.cookieSettings.httpOnly}`);
                console.log(`   MaxAge: ${config.cookieSettings.maxAge}ms`);
                console.log('');
                console.log('🔧 System Configuration:');
                console.log(`   Session Store: ${config.sessionStore}`);
                console.log(`   Trust Proxy: ${config.trustProxy}`);
                console.log('');
                console.log('📊 Current Session:');
                console.log(`   Session ID: ${config.currentSession.id}`);
                console.log(`   Has Session: ${config.currentSession.hasSession}`);
                console.log(`   Session Keys: ${config.currentSession.sessionKeys.join(', ') || 'none'}`);
                console.log(`   User: ${config.currentSession.user || 'none'}`);
                
                // Check for configuration issues
                console.log('');
                console.log('🔍 Configuration Analysis:');
                
                if (config.NODE_ENV === 'production') {
                    console.log('   ✅ NODE_ENV is set to production');
                } else {
                    console.log('   ❌ NODE_ENV should be set to "production" for Railway');
                }
                
                if (config.SESSION_SECRET === 'set') {
                    console.log('   ✅ SESSION_SECRET is configured');
                } else {
                    console.log('   ❌ SESSION_SECRET is not set - this is required');
                }
                
                if (config.MONGODB_URI === 'set') {
                    console.log('   ✅ MONGODB_URI is configured');
                } else {
                    console.log('   ❌ MONGODB_URI is not set - this is required');
                }
                
                if (config.cookieSettings.secure) {
                    console.log('   ✅ Cookies are secure (HTTPS only)');
                } else {
                    console.log('   ⚠️ Cookies are not secure - this may cause issues in production');
                }
                
                if (config.cookieSettings.sameSite === 'none') {
                    console.log('   ✅ SameSite is set to "none" for cross-domain cookies');
                } else {
                    console.log('   ⚠️ SameSite is not "none" - may cause cross-domain issues');
                }
                
            } else {
                console.log('❌ Configuration endpoint failed:', configResponse.status);
            }
        } catch (error) {
            console.log('❌ Configuration endpoint error:', error.message);
        }

        // Test 3: Check session creation
        console.log('\n3. 🍪 Session Creation Test');
        console.log('----------------------------');
        
        try {
            const sessionResponse = await axios.get(`${RAILWAY_URL}/test-session`, {
                timeout: 10000
            });
            
            if (sessionResponse.status === 200) {
                console.log('✅ Session endpoint working');
                console.log('   Session ID:', sessionResponse.data.sessionID);
                console.log('   Views:', sessionResponse.data.views);
                
                // Check for Set-Cookie header
                if (sessionResponse.headers['set-cookie']) {
                    console.log('   ✅ Set-Cookie header present');
                    const cookies = sessionResponse.headers['set-cookie'];
                    cookies.forEach((cookie, index) => {
                        console.log(`   Cookie ${index + 1}:`, cookie.split(';')[0]);
                        
                        // Parse cookie attributes
                        const cookieParts = cookie.split(';');
                        cookieParts.forEach(part => {
                            const trimmed = part.trim();
                            if (trimmed.startsWith('Secure')) {
                                console.log(`     Secure: Yes`);
                            }
                            if (trimmed.startsWith('SameSite=')) {
                                console.log(`     SameSite: ${trimmed.split('=')[1]}`);
                            }
                            if (trimmed.startsWith('HttpOnly')) {
                                console.log(`     HttpOnly: Yes`);
                            }
                        });
                    });
                } else {
                    console.log('   ❌ No Set-Cookie header found');
                }
                
                // Check for X-Session-ID header
                if (sessionResponse.headers['x-session-id']) {
                    console.log('   ✅ X-Session-ID header present:', sessionResponse.headers['x-session-id']);
                } else {
                    console.log('   ❌ X-Session-ID header not found');
                }
            } else {
                console.log('❌ Session endpoint failed:', sessionResponse.status);
            }
        } catch (error) {
            console.log('❌ Session endpoint error:', error.message);
        }

        // Summary and recommendations
        console.log('\n==========================================================');
        console.log('📋 RAILWAY ENVIRONMENT CHECK SUMMARY');
        console.log('==========================================================');
        
        console.log('\n🔧 Required Environment Variables:');
        console.log('   NODE_ENV=production');
        console.log('   SESSION_SECRET=<your-secret>');
        console.log('   MONGODB_URI=<your-mongodb-uri>');
        
        console.log('\n💡 To set Railway environment variables:');
        console.log('   1. Go to your Railway project dashboard');
        console.log('   2. Click on "Variables" tab');
        console.log('   3. Add the required variables');
        console.log('   4. Redeploy your application');
        
        console.log('\n🚀 After setting environment variables:');
        console.log('   1. Wait for Railway to redeploy');
        console.log('   2. Run this check again');
        console.log('   3. Test session functionality');
        console.log('   4. Monitor application logs');

    } catch (error) {
        console.error('❌ Environment check failed:', error.message);
    }
}

// Run the check
checkRailwayEnvironment();
