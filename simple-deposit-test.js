const axios = require('axios');

const API_BASE_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

async function testDepositLogic() {
  console.log('🧪 Testing Deposit Logic\n');
  
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
    
    // Check initial state
    console.log('\n3️⃣ Checking initial state...');
    const initialState = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    console.log('Initial state:', {
      balance: initialState.data.user.balance,
      hasDeposited: initialState.data.user.hasDeposited
    });
    
    // Create first $10 deposit
    console.log('\n4️⃣ Creating first $10 deposit...');
    const depositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, {
      amount: 10,
      receiptUrl: 'https://example.com/receipt.jpg',
      notes: 'Test deposit'
    }, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    console.log('✅ Deposit created:', depositResponse.data.deposit.id);
    
    // Confirm the deposit
    console.log('\n5️⃣ Confirming deposit...');
    const confirmResponse = await axios.put(`${API_BASE_URL}/api/admin/deposits/${depositResponse.data.deposit.id}/confirm`, {
      notes: 'Test confirmation'
    });
    console.log('✅ Deposit confirmed');
    
    // Check state after first deposit
    console.log('\n6️⃣ Checking state after first deposit...');
    const afterFirstDeposit = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
      headers: { Cookie: loginResponse.headers['set-cookie']?.join('; ') }
    });
    console.log('After first deposit:', {
      balance: afterFirstDeposit.data.user.balance,
      hasDeposited: afterFirstDeposit.data.user.hasDeposited
    });
    
    // Verify the fix
    if (afterFirstDeposit.data.user.balance === 0 && afterFirstDeposit.data.user.hasDeposited === true) {
      console.log('✅ FIX VERIFIED: First $10 deposit unlocks tasks but doesn\'t add to balance');
    } else {
      console.log('❌ FIX FAILED: Expected balance=0, hasDeposited=true');
      console.log('   Actual:', { 
        balance: afterFirstDeposit.data.user.balance, 
        hasDeposited: afterFirstDeposit.data.user.hasDeposited 
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDepositLogic(); 