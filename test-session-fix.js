const axios = require('axios');

const BASE_URL = 'http://localhost:3005';
const testUser = {
    username: 'testuser@example.com',
    password: 'testpassword123'
};

let cookieJar = '';

function extractCookies(response) {
    if (response.headers['set-cookie']) {
        cookieJar = response.headers['set-cookie'].join('; ');
        console.log('🍪 Cookies extracted:', cookieJar);
    }
    return cookieJar;
}

async function testSessionFlow() {
    console.log('🚀 Testing Session Flow');
    console.log('========================');
    
    try {
        // Step 1: Basic connectivity check (use root endpoint)
        console.log('\n1. Connectivity Check');
        try {
            const rootResponse = await axios.get(`${BASE_URL}/`);
            console.log('✅ Backend is running, status:', rootResponse.status);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ Backend server is not running. Please start the server first.');
                console.log('   Run: npm start or node app.js');
                return;
            }
            console.log('✅ Backend is accessible (got response)');
        }
        
        // Step 2: Login
        console.log('\n2. Login');
        const loginResponse = await axios.post(`${BASE_URL}/login`, testUser, {
            withCredentials: true
        });
        
        if (loginResponse.status === 200 && loginResponse.data.success) {
            console.log('✅ Login successful');
            extractCookies(loginResponse);
            
            // Step 3: Verify authentication
            console.log('\n3. Verify Authentication');
            const meResponse = await axios.get(`${BASE_URL}/me`, {
                withCredentials: true,
                headers: { 'Cookie': cookieJar }
            });
            
            if (meResponse.status === 200 && meResponse.data.user) {
                console.log('✅ Authentication verified:', meResponse.data.user.username);
                
                // Step 4: Test session persistence
                console.log('\n4. Test Session Persistence');
                const meResponse2 = await axios.get(`${BASE_URL}/me`, {
                    withCredentials: true,
                    headers: { 'Cookie': cookieJar }
                });
                
                if (meResponse2.status === 200 && meResponse2.data.user) {
                    console.log('✅ Session persists:', meResponse2.data.user.username);
                    
                    // Step 5: Logout
                    console.log('\n5. Logout');
                    const logoutResponse = await axios.get(`${BASE_URL}/logout`, {
                        withCredentials: true,
                        headers: { 'Cookie': cookieJar }
                    });
                    
                    if (logoutResponse.status === 200 && logoutResponse.data.success) {
                        console.log('✅ Logout successful');
                        
                        // Step 6: Verify logout
                        console.log('\n6. Verify Logout');
                        try {
                            const meResponse3 = await axios.get(`${BASE_URL}/me`, {
                                withCredentials: true,
                                headers: { 'Cookie': cookieJar }
                            });
                            console.log('❌ Logout failed - still authenticated');
                        } catch (error) {
                            if (error.response && error.response.status === 401) {
                                console.log('✅ Logout verified - not authenticated');
                            } else {
                                console.log('❌ Unexpected error after logout:', error.message);
                            }
                        }
                    } else {
                        console.log('❌ Logout failed');
                    }
                } else {
                    console.log('❌ Session persistence failed');
                }
            } else {
                console.log('❌ Authentication verification failed');
            }
        } else {
            console.log('❌ Login failed:', loginResponse.data?.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
    
    console.log('\n========================');
    console.log('Test completed!');
}

// Run the test
testSessionFlow();
