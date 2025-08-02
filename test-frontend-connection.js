const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testFrontendConnection() {
  console.log('🔍 Testing Frontend Connection to Backend...\n');

  try {
    // Step 1: Test basic connectivity
    console.log('1. Testing basic connectivity...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend health:', healthResponse.data.status);

    // Step 2: Test CORS preflight
    console.log('\n2. Testing CORS preflight...');
    try {
      const optionsResponse = await axios.options(`${BASE_URL}/api/withdrawal-requirements`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS preflight successful');
      console.log('CORS headers:', optionsResponse.headers);
    } catch (error) {
      console.log('❌ CORS preflight failed:', error.response?.status, error.response?.data);
    }

    // Step 3: Test with a real user session
    console.log('\n3. Testing with real user session...');
    
    // Register a user
    const testEmail = `frontendtest${Date.now()}@test.com`;
    console.log('Registering user:', testEmail);
    
    await axios.post(`${BASE_URL}/register`, {
      username: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      email: testEmail
    });
    console.log('✅ Registration successful');

    // Verify user manually
    console.log('Verifying user...');
    await axios.post(`${BASE_URL}/api/admin/verify-user`, {
      email: testEmail
    });
    console.log('✅ User verified');

    // Login with cookie handling
    console.log('Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: testEmail,
      password: 'password123'
    }, {
      withCredentials: true,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ Login successful:', loginResponse.data);

    // Extract cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    console.log('Cookies received:', cookies);

    // Test authenticated endpoint with cookies
    console.log('\n4. Testing authenticated endpoint with cookies...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/api/withdrawal-requirements`, {
        withCredentials: true,
        headers: {
          'Origin': 'http://localhost:3000',
          'Cookie': cookies ? cookies.join('; ') : ''
        }
      });
      console.log('✅ Authenticated request successful:', authResponse.data);
    } catch (error) {
      console.log('❌ Authenticated request failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      console.log('Headers:', error.response?.headers);
    }

    console.log('\n🎉 Frontend connection test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testFrontendConnection(); 