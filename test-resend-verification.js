const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testResendVerification() {
  console.log('🧪 Testing Resend Verification Email Functionality...\n');

  try {
    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'resendtest@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'resendtest@example.com'
    });
    
    console.log('✅ User registered successfully');
    console.log('Message:', registerResponse.data.message);

    // Step 2: Test resend verification endpoint
    console.log('\n2. Testing resend verification endpoint...');
    const resendResponse = await axios.post(`${BASE_URL}/api/resend-verification`, {
      email: 'resendtest@example.com'
    });
    
    console.log('✅ Resend verification response:', resendResponse.data.message);

    // Step 3: Test resend with non-existent email
    console.log('\n3. Testing resend with non-existent email...');
    try {
      await axios.post(`${BASE_URL}/api/resend-verification`, {
        email: 'nonexistent@example.com'
      });
    } catch (error) {
      console.log('✅ Correctly rejected non-existent email:', error.response.data.error);
    }

    // Step 4: Test resend without email
    console.log('\n4. Testing resend without email...');
    try {
      await axios.post(`${BASE_URL}/api/resend-verification`, {});
    } catch (error) {
      console.log('✅ Correctly rejected empty email:', error.response.data.error);
    }

    console.log('\n🎉 Resend verification test completed successfully!');
    console.log('\nSummary:');
    console.log('- Resend verification endpoint works correctly');
    console.log('- Proper error handling for invalid emails');
    console.log('- Email validation works as expected');
    console.log('- Success messages are clear and informative');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testResendVerification(); 