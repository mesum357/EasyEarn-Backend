const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function simpleLoginTest() {
    console.log('🔍 Simple Login Test');
    console.log('====================');
    
    try {
        // Test 1: Basic login with minimal data
        console.log('\n1. Testing basic login...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/login`, {
                username: 'massux357@gmail.com',
                password: '123456'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            console.log('✅ Login successful:', loginResponse.status);
            console.log('Response:', loginResponse.data);
            
        } catch (error) {
            console.log('❌ Login failed');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response data:', error.response.data);
                console.log('Response headers:', JSON.stringify(error.response.headers, null, 2));
            } else if (error.request) {
                console.log('Request error (no response):', error.request);
            } else {
                console.log('Error:', error.message);
            }
        }
        
        // Test 2: Try with different credentials format
        console.log('\n2. Testing with email as username...');
        try {
            const loginResponse2 = await axios.post(`${BASE_URL}/login`, {
                username: 'massux357@gmail.com',
                password: '123456'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Login successful:', loginResponse2.status);
            
        } catch (error) {
            console.log('❌ Login failed with email format');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response data:', error.response.data);
            }
        }
        
        // Test 3: Check if there are any other endpoints that might work
        console.log('\n3. Testing other endpoints...');
        try {
            const testResponse = await axios.get(`${BASE_URL}/test-session`);
            console.log('✅ /test-session working:', testResponse.status);
        } catch (error) {
            console.log('❌ /test-session failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
simpleLoginTest();
