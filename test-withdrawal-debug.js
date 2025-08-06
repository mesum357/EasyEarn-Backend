const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

// Create axios instance with cookie jar
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

async function testWithdrawalEndpoints() {
  console.log('🔍 Debugging Withdrawal Endpoints...\n');

  try {
    // Step 1: Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await axiosInstance.get('/health');
    console.log('✅ Backend health:', healthResponse.data.status);

    // Step 2: Test with a simple authenticated request
    console.log('\n2. Testing authenticated endpoints...');
    
    // First, let's try to register and login a user
    const testEmail = `debug${Date.now()}@test.com`;
    console.log('Registering user:', testEmail);
    
    await axiosInstance.post('/register', {
      username: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      email: testEmail
    });
    console.log('✅ Registration successful');

    // Login (this will fail due to email verification requirement)
    console.log('Logging in...');
    try {
      const loginResponse = await axiosInstance.post('/login', {
        username: testEmail,
        password: 'password123'
      });
      console.log('✅ Login response:', loginResponse.data);
    } catch (error) {
      console.log('⚠️ Login failed (expected):', error.response?.data?.error);
    }

    // Step 2.5: Verify the user manually (bypass email verification)
    console.log('\n2.5. Manually verifying user...');
    try {
      const verifyResponse = await axiosInstance.post('/api/admin/verify-user', {
        email: testEmail
      });
      console.log('✅ User verified manually:', verifyResponse.data);
    } catch (error) {
      console.log('❌ Manual verification failed:', error.response?.data);
      return; // Can't proceed if verification fails
    }

    // Step 2.6: Login again after verification
    console.log('\n2.6. Logging in after verification...');
    try {
      const loginResponse2 = await axiosInstance.post('/login', {
        username: testEmail,
        password: 'password123'
      });
      console.log('✅ Login successful after verification:', loginResponse2.data);
    } catch (error) {
      console.log('❌ Login after verification failed:', error.response?.data);
      return; // Can't proceed if login fails
    }

    // Step 3: Test withdrawal requirements endpoint
    console.log('\n3. Testing /api/withdrawal-requirements...');
    try {
      const startTime = Date.now();
      const requirementsResponse = await axiosInstance.get('/api/withdrawal-requirements');
      const endTime = Date.now();
      
      console.log(`✅ Requirements endpoint working! (${endTime - startTime}ms)`);
      console.log('Response:', JSON.stringify(requirementsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Requirements endpoint failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      console.log('Message:', error.message);
      console.log('Code:', error.code);
    }

    // Step 4: Test withdrawal history endpoint
    console.log('\n4. Testing /api/withdrawal-history...');
    try {
      const startTime = Date.now();
      const historyResponse = await axiosInstance.get('/api/withdrawal-history');
      const endTime = Date.now();
      
      console.log(`✅ History endpoint working! (${endTime - startTime}ms)`);
      console.log('Response:', JSON.stringify(historyResponse.data, null, 2));
    } catch (error) {
      console.log('❌ History endpoint failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      console.log('Message:', error.message);
      console.log('Code:', error.code);
    }

    console.log('\n🎉 Debug test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testWithdrawalEndpoints(); 