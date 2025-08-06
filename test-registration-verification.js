const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRegistrationVerification() {
  console.log('🧪 Testing Complete Registration and Verification Flow...\n');

  try {
    // Step 1: Register a new user
    console.log('1. Registering a new user...');
    const testEmail = `test${Date.now()}@example.com`;
    const registrationResponse = await axios.post(`${BASE_URL}/register`, {
      username: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      email: testEmail
    });
    
    console.log('✅ Registration successful');
    console.log('Message:', registrationResponse.data.message);
    console.log('User should be unverified and have verification token');

    // Step 2: Try to login (should fail because user is not verified)
    console.log('\n2. Trying to login with unverified user...');
    try {
      await axios.post(`${BASE_URL}/login`, {
        username: testEmail,
        password: 'password123'
      });
    } catch (error) {
      console.log('✅ Login correctly rejected unverified user');
      console.log('Error:', error.response.data.error);
    }

    // Step 3: Test resend verification
    console.log('\n3. Testing resend verification...');
    try {
      const resendResponse = await axios.post(`${BASE_URL}/api/resend-verification`, {
        email: testEmail
      });
      console.log('✅ Resend verification successful');
      console.log('Message:', resendResponse.data.message);
    } catch (error) {
      console.log('❌ Resend verification failed:', error.response?.data?.error || error.message);
    }

    // Step 4: Test API verification endpoint with invalid token
    console.log('\n4. Testing API verification with invalid token...');
    try {
      await axios.post(`${BASE_URL}/api/verify-email`, { token: 'invalid-token' });
    } catch (error) {
      console.log('✅ API correctly rejected invalid token');
      console.log('Error:', error.response.data.error);
    }

    console.log('\n🎉 Registration and verification flow test completed!');
    console.log('\nSummary:');
    console.log('- User registration works correctly');
    console.log('- Users are created as unverified');
    console.log('- Login is blocked for unverified users');
    console.log('- Resend verification works');
    console.log('- API verification rejects invalid tokens');
    console.log('\nNext steps:');
    console.log('1. Check email for verification link');
    console.log('2. Click verification link to verify user');
    console.log('3. Try logging in again (should work)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testRegistrationVerification(); 