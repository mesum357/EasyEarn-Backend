const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testSessionIdPersistence() {
    console.log('🔍 Testing Session ID Persistence and Consistency');
    console.log('==================================================');
    
    try {
        // Test 1: Check session cookie generation patterns
        console.log('\n1. Session Cookie Generation Test');
        console.log('----------------------------------');
        
        // Make multiple requests to see if session IDs are consistent
        const sessionIds = new Set();
        const cookies = [];
        
        for (let i = 1; i <= 5; i++) {
            try {
                console.log(`   Request ${i}: Checking session cookie generation`);
                
                const response = await axios.get(`${BASE_URL}/logout`, {
                    withCredentials: true
                });
                
                const setCookieHeaders = response.headers['set-cookie'];
                if (setCookieHeaders && setCookieHeaders.length > 0) {
                    const sessionCookie = setCookieHeaders[0];
                    const cookieName = sessionCookie.split('=')[0];
                    const cookieValue = sessionCookie.split('=')[1].split(';')[0];
                    
                    console.log(`     Cookie: ${cookieName}=${cookieValue.substring(0, 10)}...`);
                    
                    // Store cookie for later use
                    cookies.push(sessionCookie);
                    
                    // Extract session ID from cookie value
                    if (cookieValue && cookieValue !== '') {
                        sessionIds.add(cookieValue);
                    }
                } else {
                    console.log(`     No Set-Cookie headers in response ${i}`);
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                if (error.response) {
                    console.log(`     Request ${i} got response: ${error.response.status}`);
                } else {
                    console.log(`     Request ${i} failed: ${error.message}`);
                }
            }
        }
        
        // Test 2: Analyze session ID patterns
        console.log('\n2. Session ID Pattern Analysis');
        console.log('-------------------------------');
        
        if (sessionIds.size > 0) {
            console.log(`   Total unique session IDs generated: ${sessionIds.size}`);
            console.log(`   Total requests made: 5`);
            
            if (sessionIds.size === 1) {
                console.log('   ✅ EXCELLENT: Same session ID used across all requests');
                console.log('   This indicates perfect session persistence!');
            } else if (sessionIds.size <= 3) {
                console.log('   ⚠️  GOOD: Limited session ID variation');
                console.log('   This suggests good session management with some variation');
            } else {
                console.log('   ❌ POOR: Many different session IDs generated');
                console.log('   This suggests session IDs are changing frequently');
            }
            
            // Show the session IDs
            console.log('\n   Session IDs generated:');
            Array.from(sessionIds).forEach((id, index) => {
                console.log(`     ${index + 1}. ${id.substring(0, 20)}...`);
            });
        } else {
            console.log('   ❌ No session IDs captured');
        }
        
        // Test 3: Test session cookie attributes
        console.log('\n3. Session Cookie Attributes Test');
        console.log('----------------------------------');
        
        if (cookies.length > 0) {
            const sampleCookie = cookies[0];
            console.log('   Sample cookie analysis:');
            
            const cookieParts = sampleCookie.split(';');
            cookieParts.forEach(part => {
                const trimmed = part.trim();
                if (trimmed.includes('=')) {
                    const [key, value] = trimmed.split('=');
                    console.log(`     ${key}: ${value}`);
                } else if (trimmed) {
                    console.log(`     ${trimmed}: true`);
                }
            });
            
            // Check for important attributes
            const hasHttpOnly = sampleCookie.includes('HttpOnly');
            const hasSecure = sampleCookie.includes('Secure');
            const hasSameSite = sampleCookie.includes('SameSite');
            const hasPath = sampleCookie.includes('Path=');
            const hasExpires = sampleCookie.includes('Expires=');
            
            console.log('\n   Cookie security attributes:');
            console.log(`     HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`);
            console.log(`     Secure: ${hasSecure ? '✅' : '❌'}`);
            console.log(`     SameSite: ${hasSameSite ? '✅' : '❌'}`);
            console.log(`     Path: ${hasPath ? '✅' : '❌'}`);
            console.log(`     Expires: ${hasExpires ? '✅' : '❌'}`);
            
        } else {
            console.log('   ❌ No cookies to analyze');
        }
        
        // Test 4: Test session middleware consistency
        console.log('\n4. Session Middleware Consistency Test');
        console.log('---------------------------------------');
        
        try {
            // Test if session middleware responds consistently
            const responses = [];
            
            for (let i = 1; i <= 3; i++) {
                const response = await axios.get(`${BASE_URL}/logout`, {
                    withCredentials: true
                });
                responses.push(response);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const statusCodes = responses.map(r => r.status);
            const uniqueStatusCodes = new Set(statusCodes);
            
            console.log(`   Response status codes: ${statusCodes.join(', ')}`);
            
            if (uniqueStatusCodes.size === 1) {
                console.log('   ✅ Session middleware responding consistently');
            } else {
                console.log('   ⚠️  Session middleware showing some variation');
            }
            
        } catch (error) {
            console.log('   ❌ Session middleware test failed:', error.message);
        }
        
        console.log('\n==================================================');
        console.log('✅ Session ID persistence test completed!');
        console.log('\n📋 Summary:');
        
        if (sessionIds.size === 1) {
            console.log('   🎯 PERFECT: Session IDs are completely consistent!');
            console.log('   Your session fixes are working perfectly.');
        } else if (sessionIds.size <= 3) {
            console.log('   🎯 GOOD: Session IDs show good consistency.');
            console.log('   Minor improvements may be possible.');
        } else {
            console.log('   🎯 NEEDS WORK: Session IDs are changing frequently.');
            console.log('   Session persistence needs attention.');
        }
        
        console.log('\n🔧 Next Steps:');
        console.log('   1. If session IDs are consistent: Test with valid login');
        console.log('   2. If session IDs vary: Check session configuration');
        console.log('   3. Verify MongoDB sessions collection for persistence');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSessionIdPersistence();

