const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testWithdrawalEndpoint() {
  console.log('🧪 Testing Withdrawal Requirements Endpoint...\n');

  try {
    // Step 1: Test if backend is running
    console.log('1. Testing backend connectivity...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend is running');
      console.log('Health status:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend not accessible:', error.message);
      return;
    }

    // Step 2: Register a test user
    console.log('\n2. Registering a test user...');
    const testEmail = `withdrawaltest${Date.now()}@example.com`;
    const registrationResponse = await axios.post(`${BASE_URL}/register`, {
      username: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      email: testEmail
    });
    
    console.log('✅ Registration successful');

    // Step 3: Login the user
    console.log('\n3. Logging in the user...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: testEmail,
      password: 'password123'
    }, {
      withCredentials: true
    });
    
    console.log('✅ Login successful');

    // Step 4: Test withdrawal requirements endpoint
    console.log('\n4. Testing withdrawal requirements endpoint...');
    try {
      const requirementsResponse = await axios.get(`${BASE_URL}/api/withdrawal-requirements`, {
        withCredentials: true
      });
      
      console.log('✅ Withdrawal requirements endpoint working!');
      console.log('Response:', JSON.stringify(requirementsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Withdrawal requirements endpoint failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      console.log('Message:', error.message);
    }

    // Step 5: Test withdrawal history endpoint
    console.log('\n5. Testing withdrawal history endpoint...');
    try {
      const historyResponse = await axios.get(`${BASE_URL}/api/withdrawal-history`, {
        withCredentials: true
      });
      
      console.log('✅ Withdrawal history endpoint working!');
      console.log('Response:', JSON.stringify(historyResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Withdrawal history endpoint failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      console.log('Message:', error.message);
    }

    console.log('\n🎉 Withdrawal endpoint test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testWithdrawalEndpoint(); 