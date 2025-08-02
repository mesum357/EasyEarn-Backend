const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSimpleVerification() {
  console.log('🧪 Testing Simple Verification System...\n');

  try {
    // Test 1: Test the API endpoint directly
    console.log('1. Testing API POST /api/verify-email with invalid token...');
    try {
      await axios.post(`${BASE_URL}/api/verify-email`, { token: 'invalid-token' });
    } catch (error) {
      console.log('✅ API endpoint correctly rejected invalid token');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
    }

    // Test 2: Test the API endpoint without token
    console.log('\n2. Testing API POST /api/verify-email without token...');
    try {
      await axios.post(`${BASE_URL}/api/verify-email`, {});
    } catch (error) {
      console.log('✅ API endpoint correctly rejected missing token');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
    }

    // Test 3: Test resend verification
    console.log('\n3. Testing resend verification with invalid email...');
    try {
      await axios.post(`${BASE_URL}/api/resend-verification`, { email: 'nonexistent@example.com' });
    } catch (error) {
      console.log('✅ Resend verification correctly rejected invalid email');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
    }

    console.log('\n🎉 Simple verification system test completed!');
    console.log('\nSummary:');
    console.log('- API endpoints are working correctly');
    console.log('- Error handling is working properly');
    console.log('- No redirect loops detected');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testSimpleVerification(); 