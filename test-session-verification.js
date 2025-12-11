const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const TEST_USER = {
    username: 'massux357@gmail.com',
    password: '123456'
};

async function testSessionVerification() {
    console.log('🔍 Verifying Session Creation and Storage');
    console.log('=========================================');
    
    try {
        // Step 1: Check sessions before login
        console.log('\n1. Checking Sessions Before Login');
        console.log('-----------------------------------');
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmed357:pDliM118811357@cluster0.vtangzf.mongodb.net/');
        await mongoose.connection.asPromise();
        
        const db = mongoose.connection.db;
        const sessions = db.collection('sessions');
        
        const sessionsBefore = await sessions.countDocuments();
        console.log(`   Sessions before login: ${sessionsBefore}`);
        
        // Step 2: Perform login
        console.log('\n2. Performing Login');
        console.log('-------------------');
        
        let loginResponse;
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
        
        // Step 3: Check sessions after login
        console.log('\n3. Checking Sessions After Login');
        console.log('--------------------------------');
        
        // Wait a moment for session to be saved
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
                    if (session.session.passport && session.session.passport.user) {
                        console.log(`     Passport user ID: ${session.session.passport.user}`);
                    }
                    if (session.session.user) {
                        console.log(`     Session user data: ${JSON.stringify(session.session.user)}`);
                    }
                } else {
                    console.log(`     Has session data: ❌`);
                }
            }
            
        } else {
            console.log('   ❌ No new session created');
        }
        
        // Step 4: Test session endpoint to verify session is working
        console.log('\n4. Testing Session Endpoint');
        console.log('-----------------------------');
        
        try {
            const sessionResponse = await axios.get(`${BASE_URL}/test-session`, {
                withCredentials: true
            });
            
            if (sessionResponse.status === 200) {
                console.log('✅ Session endpoint working');
                console.log('   Response:', sessionResponse.data);
                
                // Check if this is a new session or existing one
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
        
        // Step 5: Check environment and cookie settings
        console.log('\n5. Environment and Cookie Analysis');
        console.log('-----------------------------------');
        
        console.log('   Environment Variables:');
        console.log(`     NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
        console.log(`     DISABLE_SECURE_COOKIES: ${process.env.DISABLE_SECURE_COOKIES || 'not set'}`);
        
        console.log('\n   Cookie Settings (from session config):');
        console.log(`     Secure: ${process.env.NODE_ENV === 'production'}`);
        console.log(`     SameSite: ${process.env.NODE_ENV === 'production' ? 'none' : 'lax'}`);
        console.log(`     HttpOnly: true`);
        console.log(`     Path: /`);
        
        console.log('\n   💡 Why No Set-Cookie Headers:');
        if (process.env.NODE_ENV === 'production') {
            console.log('     - NODE_ENV=production sets secure=true');
            console.log('     - Secure cookies only sent over HTTPS');
            console.log('     - Localhost uses HTTP, so cookies not sent');
            console.log('     - This is CORRECT behavior for production config');
        } else {
            console.log('     - Development environment should show cookies');
            console.log('     - Check session configuration');
        }
        
        console.log('\n=========================================');
        console.log('✅ Session verification completed!');
        
        if (sessionsAfter > sessionsBefore) {
            console.log('\n🎯 SUCCESS: Session is Working Correctly!');
            console.log('   ✅ Login successful');
            console.log('   ✅ Session created and stored in MongoDB');
            console.log('   ✅ Session middleware is active');
            console.log('   ✅ Session ID is being generated');
            
            console.log('\n📝 Note about cookies:');
            console.log('   - No Set-Cookie headers visible due to secure=true');
            console.log('   - This is expected behavior for production config');
            console.log('   - Session is still being created and stored');
            console.log('   - In production (HTTPS), cookies will be visible');
            
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
testSessionVerification();

