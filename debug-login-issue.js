const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function debugLoginIssue() {
    console.log('🔍 Debugging Login Issue');
    console.log('==========================');
    
    try {
        // Test 1: Check if server is responding
        console.log('\n1. Testing server connectivity...');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/health`);
            console.log('✅ Health endpoint working:', healthResponse.status);
        } catch (error) {
            console.log('❌ Health endpoint failed:', error.message);
            return;
        }
        
        // Test 2: Try to access a simple endpoint
        console.log('\n2. Testing simple endpoint...');
        try {
            const rootResponse = await axios.get(`${BASE_URL}/`);
            console.log('✅ Root endpoint working:', rootResponse.status);
        } catch (error) {
            console.log('❌ Root endpoint failed:', error.message);
        }
        
        // Test 3: Test login with detailed error logging
        console.log('\n3. Testing login endpoint...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/login`, {
                username: 'massux357@gmail.com',
                password: '123456'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Login successful:', loginResponse.status);
            console.log('Response data:', loginResponse.data);
            
        } catch (error) {
            console.log('❌ Login failed');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response data:', error.response.data);
                console.log('Response headers:', error.response.headers);
            } else if (error.request) {
                console.log('Request error:', error.request);
            } else {
                console.log('Error:', error.message);
            }
        }
        
        // Test 4: Check if user exists by trying to access user-related endpoint
        console.log('\n4. Testing user endpoint...');
        try {
            const userResponse = await axios.get(`${BASE_URL}/me`);
            console.log('✅ /me endpoint working:', userResponse.status);
        } catch (error) {
            if (error.response) {
                console.log('✅ /me endpoint responded (expected 401):', error.response.status);
            } else {
                console.log('❌ /me endpoint failed:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug script failed:', error.message);
    }
}

// Run the debug
debugLoginIssue();
