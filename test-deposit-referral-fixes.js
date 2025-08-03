const axios = require('axios');

const API_BASE_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

// Test configuration
const testConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000
};

async function testDepositAndReferralFixes() {
  console.log('🧪 Testing Deposit and Referral Fixes\n');
  
  try {
    // Test 1: Create test users
    console.log('1️⃣ Creating test users...');
    
    const user1Data = {
      username: `testuser1_${Date.now()}`,
      email: `testuser1_${Date.now()}@test.com`,
      password: 'testpass123',
      confirmPassword: 'testpass123'
    };
    
    const user2Data = {
      username: `testuser2_${Date.now()}`,
      email: `testuser2_${Date.now()}@test.com`,
      password: 'testpass123',
      confirmPassword: 'testpass123'
    };
    
    // Register user1
    const user1Response = await axios.post(`${API_BASE_URL}/register`, user1Data, testConfig);
    console.log('✅ User1 created:', user1Response.data.user?.username || 'User created');
    console.log('User1 response data:', JSON.stringify(user1Response.data, null, 2));
    
    // Register user2 with user1 as referrer
    const user2Response = await axios.post(`${API_BASE_URL}/register`, {
      ...user2Data,
      referralCode: user1Response.data.user?._id || user1Response.data.referralCode
    }, testConfig);
    console.log('✅ User2 created with referral:', user2Response.data.user?.username || 'User created');
    console.log('User2 response data:', JSON.stringify(user2Response.data, null, 2));
    
    // Test 2: Login users
    console.log('\n2️⃣ Logging in users...');
    
    const user1Login = await axios.post(`${API_BASE_URL}/login`, {
      username: user1Data.email,
      password: user1Data.password
    }, testConfig);
    console.log('✅ User1 logged in');
    
    const user2Login = await axios.post(`${API_BASE_URL}/login`, {
      username: user2Data.email,
      password: user2Data.password
    }, testConfig);
    console.log('✅ User2 logged in');
    
    // Test 3: Check initial user states
    console.log('\n3️⃣ Checking initial user states...');
    
    const user1Initial = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: user1Login.headers['set-cookie']?.join('; ') }
    });
    console.log('User1 initial state:', {
      balance: user1Initial.data.user.balance,
      hasDeposited: user1Initial.data.user.hasDeposited
    });
    
    const user2Initial = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: user2Login.headers['set-cookie']?.join('; ') }
    });
    console.log('User2 initial state:', {
      balance: user2Initial.data.user.balance,
      hasDeposited: user2Initial.data.user.hasDeposited
    });
    
    // Test 4: Check referral status before deposit
    console.log('\n4️⃣ Checking referral status before deposit...');
    
    const referralInfoBefore = await axios.get(`${API_BASE_URL}/api/referrals/my-info`, {
      ...testConfig,
      headers: { Cookie: user1Login.headers['set-cookie']?.join('; ') }
    });
    console.log('Referral info before deposit:', {
      totalReferrals: referralInfoBefore.data.totalReferrals,
      recentReferrals: referralInfoBefore.data.recentReferrals.length
    });
    
    // Test 5: User2 makes first $10 deposit
    console.log('\n5️⃣ User2 making first $10 deposit...');
    
    const depositData = {
      amount: 10,
      receiptUrl: 'https://example.com/receipt.jpg',
      notes: 'Test deposit for referral verification'
    };
    
    const depositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, depositData, {
      ...testConfig,
      headers: { Cookie: user2Login.headers['set-cookie']?.join('; ') }
    });
    console.log('✅ Deposit request created:', depositResponse.data.deposit.id);
    
    // Test 6: Admin confirms the deposit
    console.log('\n6️⃣ Admin confirming deposit...');
    
    const confirmResponse = await axios.put(`${API_BASE_URL}/api/admin/deposits/${depositResponse.data.deposit.id}/confirm`, {
      notes: 'Test confirmation'
    }, testConfig);
    console.log('✅ Deposit confirmed');
    
    // Test 7: Check user2 state after deposit
    console.log('\n7️⃣ Checking User2 state after deposit...');
    
    const user2AfterDeposit = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: user2Login.headers['set-cookie']?.join('; ') }
    });
    console.log('User2 after deposit:', {
      balance: user2AfterDeposit.data.user.balance,
      hasDeposited: user2AfterDeposit.data.user.hasDeposited
    });
    
    // Verify the fix: balance should be 0, hasDeposited should be true
    if (user2AfterDeposit.data.user.balance === 0 && user2AfterDeposit.data.user.hasDeposited === true) {
      console.log('✅ FIX VERIFIED: First $10 deposit unlocks tasks but doesn\'t add to balance');
    } else {
      console.log('❌ FIX FAILED: Expected balance=0, hasDeposited=true');
      console.log('   Actual:', { balance: user2AfterDeposit.data.user.balance, hasDeposited: user2AfterDeposit.data.user.hasDeposited });
    }
    
    // Test 8: Check referral status after deposit
    console.log('\n8️⃣ Checking referral status after deposit...');
    
    const referralInfoAfter = await axios.get(`${API_BASE_URL}/api/referrals/my-info`, {
      ...testConfig,
      headers: { Cookie: user1Login.headers['set-cookie']?.join('; ') }
    });
    console.log('Referral info after deposit:', {
      totalReferrals: referralInfoAfter.data.totalReferrals,
      recentReferrals: referralInfoAfter.data.recentReferrals.length
    });
    
    // Verify the fix: referral should now show as completed
    if (referralInfoAfter.data.recentReferrals.length > 0) {
      const referral = referralInfoAfter.data.recentReferrals[0];
      console.log('Referral status:', referral.status);
      
      if (referral.status === 'completed') {
        console.log('✅ FIX VERIFIED: Referral shows as completed after $10 deposit');
      } else {
        console.log('❌ FIX FAILED: Referral should be completed');
      }
    } else {
      console.log('❌ FIX FAILED: No referrals found after deposit');
    }
    
    // Test 9: User2 makes second deposit
    console.log('\n9️⃣ User2 making second deposit...');
    
    const secondDepositData = {
      amount: 20,
      receiptUrl: 'https://example.com/receipt2.jpg',
      notes: 'Second test deposit'
    };
    
    const secondDepositResponse = await axios.post(`${API_BASE_URL}/api/deposits`, secondDepositData, {
      ...testConfig,
      headers: { Cookie: user2Login.headers['set-cookie']?.join('; ') }
    });
    
    // Confirm second deposit
    await axios.put(`${API_BASE_URL}/api/admin/deposits/${secondDepositResponse.data.deposit.id}/confirm`, {
      notes: 'Second deposit confirmation'
    }, testConfig);
    
    // Test 10: Check user2 state after second deposit
    console.log('\n🔟 Checking User2 state after second deposit...');
    
    const user2AfterSecondDeposit = await axios.get(`${API_BASE_URL}/me`, {
      ...testConfig,
      headers: { Cookie: user2Login.headers['set-cookie']?.join('; ') }
    });
    console.log('User2 after second deposit:', {
      balance: user2AfterSecondDeposit.data.user.balance,
      hasDeposited: user2AfterSecondDeposit.data.user.hasDeposited
    });
    
    // Verify: balance should be 20, hasDeposited should be true
    if (user2AfterSecondDeposit.data.user.balance === 20 && user2AfterSecondDeposit.data.user.hasDeposited === true) {
      console.log('✅ FIX VERIFIED: Second deposit adds to balance normally');
    } else {
      console.log('❌ FIX FAILED: Expected balance=20, hasDeposited=true');
      console.log('   Actual:', { balance: user2AfterSecondDeposit.data.user.balance, hasDeposited: user2AfterSecondDeposit.data.user.hasDeposited });
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDepositAndReferralFixes(); 