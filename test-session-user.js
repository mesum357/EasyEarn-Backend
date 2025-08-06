const axios = require('axios');

const API_BASE_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

async function testSessionUser() {
  console.log('🧪 Testing session user object...\n');
  
  try {
    // Create a test user
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
    
    // Test /me endpoint before any changes
    console.log('\n3️⃣ Testing /me endpoint before changes...');
    const meResponse1 = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    
    console.log('✅ /me response before changes:', {
      balance: meResponse1.data.user.balance,
      hasDeposited: meResponse1.data.user.hasDeposited,
      email: meResponse1.data.user.email
    });
    
    // Create and confirm a deposit to update the user
    console.log('\n4️⃣ Creating and confirming deposit...');
    const depositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, {
      amount: 10,
      receiptUrl: 'https://example.com/receipt.jpg',
      notes: 'Test deposit'
    }, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    
    await axios.put(`${API_BASE_URL}/api/admin/deposits/${depositResponse.data.deposit.id}/confirm`, {
      notes: 'Test confirmation'
    });
    
    // Test /me endpoint after changes
    console.log('\n5️⃣ Testing /me endpoint after changes...');
    const meResponse2 = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    
    console.log('✅ /me response after changes:', {
      balance: meResponse2.data.user.balance,
      hasDeposited: meResponse2.data.user.hasDeposited,
      email: meResponse2.data.user.email
    });
    
    // Check if the session user object was updated
    if (meResponse2.data.user.hasDeposited !== undefined) {
      console.log('✅ Session user object was updated properly');
    } else {
      console.log('❌ Session user object was not updated - hasDeposited is still undefined');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSessionUser(); 