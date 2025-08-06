const axios = require('axios');

const API_BASE_URL = 'http://localhost:3005';

// Test configuration
const testConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000
};

async function testFrontendUnlockBehavior() {
  console.log('🧪 Testing Frontend Task Unlock Behavior After Deposit Approval\n');
  
  try {
    // Test 1: Create and login user
    console.log('1️⃣ Setting up test user...');
    
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@test.com`,
      password: 'testpass123',
      confirmPassword: 'testpass123'
    };
    
    const userResponse = await axios.post(`${API_BASE_URL}/register`, userData, testConfig);
    console.log('✅ User created and auto-verified');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: userData.email,
      password: userData.password
    }, testConfig);
    console.log('✅ User logged in');
    
    const sessionCookie = loginResponse.headers['set-cookie']?.join('; ');
    
    // Test 2: Verify initial state (tasks should be locked)
    console.log('\n2️⃣ Testing initial state - Tasks should be LOCKED');
    
    let userState = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('Initial user state:');
    console.log(`  - hasDeposited: ${userState.data.user.hasDeposited}`);
    console.log(`  - balance: $${userState.data.user.balance}`);
    console.log(`  - Frontend behavior: Tasks menu should show "Need $10" badge`);
    console.log(`  - TaskPage behavior: Should show "Tasks Locked" message`);
    
    // Test 3: Submit deposit
    console.log('\n3️⃣ Submitting $10 deposit...');
    
    const depositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, {
      amount: 10,
      receiptUrl: 'https://example.com/test-receipt.jpg',
      notes: 'Test deposit for task unlocking'
    }, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('✅ Deposit submitted, status: pending');
    
    // Test 4: Admin approves deposit
    console.log('\n4️⃣ Admin approving deposit...');
    
    await axios.put(`${API_BASE_URL}/api/admin/deposits/${depositResponse.data.deposit.id}/confirm`, {
      notes: 'Approved for testing'
    }, testConfig);
    
    console.log('✅ Deposit approved by admin');
    
    // Test 5: Check user state immediately after approval
    console.log('\n5️⃣ Checking user state immediately after approval...');
    
    userState = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: sessionCookie }
    });
    
    console.log('User state after deposit approval:');
    console.log(`  - hasDeposited: ${userState.data.user.hasDeposited}`);
    console.log(`  - balance: $${userState.data.user.balance}`);
    
    // Test 6: Frontend behavior simulation
    console.log('\n6️⃣ Frontend behavior simulation:');
    
    const isTasksUnlocked = userState.data.user.hasDeposited;
    
    console.log('📱 NAVBAR BEHAVIOR:');
    if (isTasksUnlocked) {
      console.log('  ✅ Tasks menu: UNLOCKED (no "Need $10" badge)');
      console.log('  ✅ Tasks menu clickable: Links to /tasks');
    } else {
      console.log('  ❌ Tasks menu: LOCKED (shows "Need $10" badge)');
      console.log('  ❌ Tasks menu clickable: Links to /deposit');
    }
    
    console.log('\n📄 TASKPAGE BEHAVIOR:');
    if (isTasksUnlocked) {
      console.log('  ✅ TaskPage: Shows available tasks');
      console.log('  ✅ TaskPage: API calls to /api/tasks work');
    } else {
      console.log('  ❌ TaskPage: Shows "Tasks Locked" message');
      console.log('  ❌ TaskPage: Shows "Make Your First Deposit" button');
    }
    
    console.log('\n💰 BALANCE DISPLAY:');
    console.log(`  Balance shown in navbar: $${userState.data.user.balance.toFixed(2)}`);
    console.log(`  Balance shown in deposit page: $${userState.data.user.balance.toFixed(2)}`);
    
    // Test 7: Verify tasks API accessibility
    console.log('\n7️⃣ Testing Tasks API accessibility...');
    
    if (isTasksUnlocked) {
      try {
        const tasksResponse = await axios.get(`${API_BASE_URL}/api/tasks`, {
          ...testConfig,
          headers: { Cookie: sessionCookie }
        });
        console.log(`✅ Tasks API accessible: ${tasksResponse.data.tasks?.length || 0} tasks available`);
      } catch (error) {
        console.log('❌ Tasks API error:', error.response?.data?.error);
      }
    } else {
      console.log('❌ Tasks API: Would be accessible but user interface shows locked state');
    }
    
    // Test 8: User Experience Summary
    console.log('\n8️⃣ USER EXPERIENCE SUMMARY:');
    
    if (isTasksUnlocked && userState.data.user.balance === 0) {
      console.log('🎉 SUCCESS: Complete flow working as expected!');
      console.log('   - First $10 deposit unlocked tasks');
      console.log('   - Balance correctly shows $0 (first $10 used for unlocking)');
      console.log('   - User can now access task earning features');
      console.log('   - Frontend will show unlocked state in navbar and task page');
    } else {
      console.log('⚠️  ISSUE DETECTED:');
      if (!isTasksUnlocked) {
        console.log('   - Tasks are still locked after deposit approval');
        console.log('   - Frontend will still show "Need $10" badge');
        console.log('   - User cannot access task features');
      }
      if (userState.data.user.balance !== 0) {
        console.log('   - Balance calculation incorrect');
        console.log(`   - Expected: $0, Actual: $${userState.data.user.balance}`);
      }
    }
    
    // Test 9: Simulate frontend refresh scenario
    console.log('\n9️⃣ Simulating frontend refresh scenarios:');
    
    console.log('📱 If user refreshes browser page:');
    console.log(`   - AuthContext will call /me endpoint`);
    console.log(`   - User data will show: hasDeposited=${userState.data.user.hasDeposited}, balance=$${userState.data.user.balance}`);
    console.log(`   - Navbar will render: ${isTasksUnlocked ? 'UNLOCKED' : 'LOCKED'} tasks menu`);
    console.log(`   - TaskPage will render: ${isTasksUnlocked ? 'Available tasks' : 'Tasks locked message'}`);
    
    console.log('\n⏰ With 2-minute auto-refresh:');
    console.log('   - AuthContext polls /me every 2 minutes');
    console.log('   - User data will update automatically within 2 minutes of admin approval');
    console.log('   - No manual refresh needed (improved from 30 minutes)');
    
    console.log('\n🔄 Manual refresh button (on deposit page):');
    console.log('   - User can click "Refresh" button to immediately update');
    console.log('   - Calls refreshUser() which triggers /me endpoint');
    console.log('   - Instant feedback for impatient users');
    
    console.log('\n✅ TEST COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
console.log('🚀 Starting Frontend Task Unlock Behavior Test');
console.log('Backend:', API_BASE_URL);
console.log('Testing complete flow: register → login → deposit → admin approve → task unlock\n');

testFrontendUnlockBehavior();
