const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function simpleTest() {
  console.log('🧪 Simple Referral System Test...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data.status);

    // Test 2: Test referral validation endpoint
    console.log('\n2. Testing referral validation endpoint...');
    const validationResponse = await axios.get(`${BASE_URL}/api/referrals/validate/TEST123`);
    console.log('✅ Validation endpoint working:', validationResponse.data);

    // Test 3: Test registration endpoint (without referral)
    console.log('\n3. Testing registration endpoint...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'testuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'testuser@example.com'
    });
    console.log('✅ Registration successful:', registerResponse.data.success);

    console.log('\n🎉 Basic tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

simpleTest(); 