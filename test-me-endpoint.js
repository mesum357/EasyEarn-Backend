const axios = require('axios');

const API_BASE_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

async function testMeEndpoint() {
  console.log('🧪 Testing /me endpoint...\n');
  
  try {
    // Find the most recent test user
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@test.com`,
      password: 'testpass123',
      confirmPassword: 'testpass123'
    };
    
    console.log('1️⃣ Creating test user...');
    const userResponse = await axios.post(`${API_BASE_URL}/register`, userData);
    console.log('✅ User created');
    
    // Login
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: userData.email,
      password: userData.password
    }, { withCredentials: true });
    console.log('✅ Logged in');
    
    // Test /me endpoint
    console.log('\n3️⃣ Testing /me endpoint...');
    const meResponse = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    
    console.log('✅ /me response:', {
      balance: meResponse.data.user.balance,
      hasDeposited: meResponse.data.user.hasDeposited,
      email: meResponse.data.user.email
    });
    
    // Check if hasDeposited is properly returned
    if (meResponse.data.user.hasDeposited !== undefined) {
      console.log('✅ hasDeposited field is properly returned');
    } else {
      console.log('❌ hasDeposited field is undefined');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMeEndpoint(); 