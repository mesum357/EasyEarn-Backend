const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function testSessionStorage() {
    console.log('🔍 Testing Session Storage in MongoDB');
    console.log('=====================================');
    console.log(`User: ${TEST_USER.username}`);
    console.log('');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmed357:pDliM118811357@cluster0.vtangzf.mongodb.net/');
        await mongoose.connection.asPromise();
        
        const db = mongoose.connection.db;
        const sessions = db.collection('sessions');
        
        // Step 1: Check sessions before login
        console.log('1. Checking Sessions Before Login');
        console.log('----------------------------------');
        
        const sessionsBefore = await sessions.countDocuments();
        console.log(`   Sessions before login: ${sessionsBefore}`);
        
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
        
        // Step 3: Wait for session to be saved
        console.log('\n3. Waiting for Session to be Saved');
        console.log('-----------------------------------');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 4: Check sessions after login
        console.log('\n4. Checking Sessions After Login');
        console.log('--------------------------------');
        
        const sessionsAfter = await sessions.countDocuments();
        console.log(`   Sessions after login: ${sessionsAfter}`);
        
        if (sessionsAfter > sessionsBefore) {
            console.log('   ✅ New session created!');
            console.log(`   Session count increased by: ${sessionsAfter - sessionsBefore}`);
            
            // Get the most recent session
            const recentSession = await sessions.find({})
                .sort({ _id: -1 })
                .limit(1)
                .toArray();
            
            if (recentSession.length > 0) {
                const session = recentSession[0];
                console.log('\n   📋 Most Recent Session Details:');
                console.log(`     Session ID: ${session._id}`);
                console.log(`     Expires: ${session.expires}`);
                console.log(`     Last Modified: ${session.lastModified}`);
                
                if (session.session) {
                    console.log(`     Has session data: ✅`);
                    console.log(`     Session data keys:`, Object.keys(session.session));
                    
                    if (session.session.passport) {
                        console.log(`     Passport data:`, session.session.passport);
                    } else {
                        console.log(`     ❌ No Passport data in session`);
                    }
                    
                    if (session.session.user) {
                        console.log(`     User data:`, session.session.user);
                    } else {
                        console.log(`     ❌ No user data in session`);
                    }
                    
                    // Check if this is the session we just created
                    if (session.session.user && session.session.user.email === TEST_USER.username) {
                        console.log(`     ✅ This appears to be our login session`);
                    }
                } else {
                    console.log(`     Has session data: ❌`);
                }
            }
            
        } else {
            console.log('   ❌ No new session created');
        }
        
        // Step 5: Test authentication with the session
        console.log('\n5. Testing Authentication with Session');
        console.log('--------------------------------------');
        
        if (sessionCookie) {
            try {
                const meResponse = await axios.get(`${BASE_URL}/me`, {
                    headers: {
                        Cookie: sessionCookie
                    },
                    withCredentials: true
                });
                
                if (meResponse.status === 200) {
                    console.log('✅ Authentication successful with session cookie');
                    console.log('   User:', meResponse.data.user.username);
                } else {
                    console.log('❌ Authentication failed with session cookie:', meResponse.status);
                }
                
            } catch (error) {
                if (error.response) {
                    console.log('❌ Authentication error with session cookie:', error.response.status, error.response.data.error);
                } else {
                    console.log('❌ Authentication request failed:', error.message);
                }
            }
        } else {
            console.log('   ℹ️  No session cookie to test with');
        }
        
        console.log('\n=====================================');
        console.log('✅ Session storage test completed!');
        
        if (sessionsAfter > sessionsBefore) {
            console.log('\n🎯 SUCCESS: Session Created in MongoDB!');
            console.log('   ✅ Login successful');
            console.log('   ✅ Session stored in database');
            console.log('   ✅ Session middleware is working');
            
            console.log('\n📝 Next Steps:');
            console.log('   - Check if Passport data is included in session');
            console.log('   - Verify session cookie handling');
            console.log('   - Test authentication persistence');
            
        } else {
            console.log('\n⚠️  ISSUE: Session Not Being Created');
            console.log('   - Check session middleware configuration');
            console.log('   - Verify MongoDB connection');
            console.log('   - Check for errors in server logs');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
}

// Run the test
testSessionStorage();
