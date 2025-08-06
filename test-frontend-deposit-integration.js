const axios = require('axios');

const API_BASE_URL = 'http://localhost:3005';

// Test configuration
const testConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000
};

async function testFrontendDepositIntegration() {
  console.log('🧪 Testing Frontend Deposit Integration Issue\n');
  
  try {
    // Test 1: Create test user
    console.log('1️⃣ Creating test user...');
    
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@test.com`,
      password: 'testpass123',
      confirmPassword: 'testpass123'
    };
    
    // Register user
    const userResponse = await axios.post(`${API_BASE_URL}/register`, userData, testConfig);
    console.log('✅ User created:', userResponse.data.message);
    console.log('User auto-verified:', userResponse.data.autoVerified);
    
    // Test 2: Login user
    console.log('\n2️⃣ Logging in user...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: userData.email,
      password: userData.password
    }, testConfig);
    console.log('✅ User logged in successfully');
    console.log('Session ID:', loginResponse.data.session?.id);
    
    // Extract session cookie for subsequent requests
    const sessionCookie = loginResponse.headers['set-cookie']?.join('; ');
    console.log('Session cookie:', sessionCookie ? 'Present' : 'Missing');
    
    // Test 3: Check initial user state via /me endpoint
    console.log('\n3️⃣ Checking initial user state...');
    
    const userInfoResponse = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('Initial user state:', {
      username: userInfoResponse.data.user.username,
      balance: userInfoResponse.data.user.balance,
      hasDeposited: userInfoResponse.data.user.hasDeposited
    });
    
    // Verify initial state is correct
    if (userInfoResponse.data.user.balance === 0 && userInfoResponse.data.user.hasDeposited === false) {
      console.log('✅ Initial state correct: balance=0, hasDeposited=false');
    } else {
      console.log('❌ Initial state incorrect:', userInfoResponse.data.user);
    }
    
    // Test 4: Create deposit request
    console.log('\n4️⃣ Creating deposit request...');
    
    const depositData = {
      amount: 10,
      receiptUrl: 'https://example.com/test-receipt.jpg',
      transactionHash: 'test-hash-123',
      notes: 'Test deposit for frontend integration'
    };
    
    const depositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, depositData, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('✅ Deposit request created:', {
      id: depositResponse.data.deposit.id,
      amount: depositResponse.data.deposit.amount,
      status: depositResponse.data.deposit.status
    });
    
    // Test 5: Check user state before approval (should be unchanged)
    console.log('\n5️⃣ Checking user state before approval...');
    
    const userBeforeApproval = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('User state before approval:', {
      balance: userBeforeApproval.data.user.balance,
      hasDeposited: userBeforeApproval.data.user.hasDeposited
    });
    
    // Test 6: Admin confirms the deposit (simulating admin panel)
    console.log('\n6️⃣ Admin confirming deposit (simulating admin panel)...');
    
    const confirmResponse = await axios.put(`${API_BASE_URL}/api/admin/deposits/${depositResponse.data.deposit.id}/confirm`, {
      notes: 'Test confirmation via admin panel'
    }, testConfig);
    
    console.log('✅ Deposit confirmed by admin panel');
    console.log('Confirmation response:', confirmResponse.data.message);
    
    // Test 7: Check user state after approval (CRITICAL TEST)
    console.log('\n7️⃣ Checking user state after approval (CRITICAL TEST)...');
    
    const userAfterApproval = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('User state after approval:', {
      balance: userAfterApproval.data.user.balance,
      hasDeposited: userAfterApproval.data.user.hasDeposited
    });
    
    // CRITICAL VERIFICATION: This is where the bug should be fixed
    console.log('\n🔍 CRITICAL VERIFICATION:');
    if (userAfterApproval.data.user.hasDeposited === true && userAfterApproval.data.user.balance === 0) {
      console.log('✅ SUCCESS: First $10 deposit correctly unlocks tasks and balance=0');
      console.log('   - hasDeposited: true (tasks should be unlocked)');
      console.log('   - balance: 0 (first $10 is for unlocking)');
    } else {
      console.log('❌ ISSUE FOUND:');
      console.log('   Expected: hasDeposited=true, balance=0');
      console.log('   Actual:', {
        hasDeposited: userAfterApproval.data.user.hasDeposited,
        balance: userAfterApproval.data.user.balance
      });
      
      if (userAfterApproval.data.user.hasDeposited === false) {
        console.log('   🚨 FRONTEND ISSUE: Tasks will remain locked in frontend');
      }
      if (userAfterApproval.data.user.balance !== 0) {
        console.log('   ⚠️  BALANCE ISSUE: Balance calculation incorrect');
      }
    }
    
    // Test 8: Test task access simulation
    console.log('\n8️⃣ Testing task access (simulating frontend logic)...');
    
    const shouldTasksBeUnlocked = userAfterApproval.data.user.hasDeposited;
    console.log('Frontend tasks should be:', shouldTasksBeUnlocked ? 'UNLOCKED 🔓' : 'LOCKED 🔒');
    
    if (shouldTasksBeUnlocked) {
      // Try to access tasks endpoint
      try {
        const tasksResponse = await axios.get(`${API_BASE_URL}/api/tasks`, {
          ...testConfig,
          headers: { Cookie: sessionCookie }
        });
        console.log('✅ Tasks API accessible:', tasksResponse.data.tasks?.length || 0, 'tasks found');
      } catch (taskError) {
        console.log('❌ Tasks API error:', taskError.response?.data?.error || taskError.message);
      }
    }
    
    // Test 9: Test second deposit (should add to balance)
    console.log('\n9️⃣ Testing second deposit (should add to balance)...');
    
    const secondDepositData = {
      amount: 15,
      receiptUrl: 'https://example.com/test-receipt-2.jpg',
      transactionHash: 'test-hash-456',
      notes: 'Second test deposit'
    };
    
    const secondDepositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, secondDepositData, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    // Confirm second deposit
    await axios.put(`${API_BASE_URL}/api/admin/deposits/${secondDepositResponse.data.deposit.id}/confirm`, {
      notes: 'Second deposit confirmation'
    }, testConfig);
    
    // Check user state after second deposit
    const userAfterSecondDeposit = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('User state after second deposit:', {
      balance: userAfterSecondDeposit.data.user.balance,
      hasDeposited: userAfterSecondDeposit.data.user.hasDeposited
    });
    
    // Verify second deposit logic
    if (userAfterSecondDeposit.data.user.balance === 15 && userAfterSecondDeposit.data.user.hasDeposited === true) {
      console.log('✅ Second deposit logic correct: balance=$15, tasks remain unlocked');
    } else {
      console.log('❌ Second deposit logic incorrect:', {
        expected: { balance: 15, hasDeposited: true },
        actual: { 
          balance: userAfterSecondDeposit.data.user.balance, 
          hasDeposited: userAfterSecondDeposit.data.user.hasDeposited 
        }
      });
    }
    
    console.log('\n🎉 Frontend integration test completed!');
    console.log('\n📋 SUMMARY:');
    console.log('- User created and logged in: ✅');
    console.log('- First deposit unlocks tasks:', userAfterApproval.data.user.hasDeposited ? '✅' : '❌');
    console.log('- First deposit balance logic:', userAfterApproval.data.user.balance === 0 ? '✅' : '❌');
    console.log('- Second deposit adds to balance:', userAfterSecondDeposit.data.user.balance === 15 ? '✅' : '❌');
    
    // Frontend simulation
    console.log('\n🖥️  FRONTEND SIMULATION:');
    console.log('- Navbar "Tasks" menu would be:', userAfterApproval.data.user.hasDeposited ? 'UNLOCKED' : 'LOCKED with "Need $10" badge');
    console.log('- TaskPage would show:', userAfterApproval.data.user.hasDeposited ? 'Available tasks' : 'Tasks locked message');
    console.log('- User balance displayed:', `$${userAfterSecondDeposit.data.user.balance.toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Run the test
console.log('Starting test with backend at:', API_BASE_URL);
testFrontendDepositIntegration();
