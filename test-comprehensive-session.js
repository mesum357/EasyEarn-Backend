const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Test user credentials
const testUser = {
    username: 'testuser@example.com',
    password: 'testpassword123',
    email: 'testuser@example.com'
};

// Cookie jar to maintain cookies between requests
let cookieJar = '';

function extractCookies(response) {
    if (response.headers['set-cookie']) {
        cookieJar = response.headers['set-cookie'].join('; ');
        console.log('🍪 Cookies extracted:', cookieJar);
    }
    return cookieJar;
}

function logResponse(step, response, showData = true) {
    console.log(`\n📋 ${step}:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, {
        'set-cookie': response.headers['set-cookie'] || 'none',
        'access-control-allow-credentials': response.headers['access-control-allow-credentials'] || 'none'
    });
    if (showData && response.data) {
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    }
}

async function makeRequest(method, url, data = null, description = '') {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                ...(cookieJar && { 'Cookie': cookieJar })
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        console.log(`\n🔍 ${description} - Making ${method.toUpperCase()} request to ${url}`);
        console.log(`   Sending cookies: ${cookieJar || 'none'}`);
        
        const response = await axios(config);
        extractCookies(response);
        logResponse(description, response);
        
        return response;
    } catch (error) {
        console.log(`\n❌ ${description} - ERROR:`);
        console.log(`   Status: ${error.response?.status || 'No response'}`);
        console.log(`   Message: ${error.response?.data?.error || error.message}`);
        if (error.response?.headers['set-cookie']) {
            extractCookies(error.response);
        }
        return error.response;
    }
}

async function testSessionPersistence() {
    console.log('🚀 COMPREHENSIVE SESSION PERSISTENCE TEST');
    console.log('==========================================');
    
    try {
        // Step 1: Health check
        await makeRequest('GET', '/health', null, 'Step 1: Health Check');
        
        // Step 2: Initial session test
        await makeRequest('GET', '/test-session', null, 'Step 2: Initial Session Test');
        
        // Step 3: Login
        const loginResponse = await makeRequest('POST', '/login', testUser, 'Step 3: Login');
        
        if (loginResponse.status !== 200) {
            console.log('\n⚠️ Login failed, continuing with test to see session behavior...');
        }
        
        // Wait a moment for session to be saved
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 4: Verify authentication with /me endpoint
        await makeRequest('GET', '/me', null, 'Step 4: Verify Auth with /me');
        
        // Step 5: Test session endpoint after login
        await makeRequest('GET', '/test-session', null, 'Step 5: Test Session After Login');
        
        // Step 6: Debug auth endpoint
        await makeRequest('GET', '/debug-auth', null, 'Step 6: Debug Auth Status');
        
        // Step 7: Test authenticated endpoint
        await makeRequest('GET', '/api/my-participations', null, 'Step 7: Test Authenticated Endpoint');
        
        // Step 8: Wait and test again (simulating time delay)
        console.log('\n⏰ Waiting 2 seconds to simulate delay...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await makeRequest('GET', '/me', null, 'Step 8: Re-verify Auth After Delay');
        
        // Step 9: Test with fresh request (clear cookies temporarily)
        const originalCookies = cookieJar;
        cookieJar = '';
        await makeRequest('GET', '/me', null, 'Step 9: Test Without Cookies');
        
        // Step 10: Restore cookies and test again
        cookieJar = originalCookies;
        await makeRequest('GET', '/me', null, 'Step 10: Test With Restored Cookies');
        
        // Step 11: Debug session details
        await makeRequest('GET', '/debug/session', null, 'Step 11: Session Debug Details');
        
        // Step 12: Cookie debug
        await makeRequest('GET', '/debug/cookies', null, 'Step 12: Cookie Debug');
        
    } catch (error) {
        console.error('\n💥 Test failed with error:', error.message);
    }
    
    console.log('\n✅ Test completed!');
    console.log('==========================================');
}

// Run the test
testSessionPersistence();
