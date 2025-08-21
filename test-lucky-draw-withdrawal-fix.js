const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testLuckyDrawWithdrawalFix() {
  console.log('🧪 Testing Lucky Draw Withdrawal Fix...\n');

  try {
    // Step 1: Login as a test user
    console.log('1. Logging in as test user...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'testuser',
      password: 'testpass'
    }, { withCredentials: true });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed, creating test user...');
      // Create test user if login fails
      await axios.post(`${BASE_URL}/register`, {
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com'
      });
      
      // Try login again
      const retryLogin = await axios.post(`${BASE_URL}/login`, {
        username: 'testuser',
        password: 'testpass'
      }, { withCredentials: true });
      
      if (retryLogin.data.success) {
        console.log('✅ Test user created and logged in');
      } else {
        throw new Error('Failed to create/login test user');
      }
    }

    // Step 2: Check initial withdrawal requirements
    console.log('\n2. Checking initial withdrawal requirements...');
    const initialRequirements = await axios.get(`${BASE_URL}/api/withdrawal-requirements`, {
      withCredentials: true
    });

    console.log('Initial lucky draw requirement:', initialRequirements.data.requirement.requirements.luckyDraw);

    // Step 3: Create a test lucky draw participation (pending)
    console.log('\n3. Creating test lucky draw participation (pending)...');
    const participationResponse = await axios.post(`${BASE_URL}/api/participate`, {
      prizeId: 1,
      prizeTitle: 'Test Prize',
      binanceUID: 'test123',
      receiptUrl: 'https://example.com/receipt.jpg'
    }, { withCredentials: true });

    if (participationResponse.data.success) {
      console.log('✅ Test participation created (pending approval)');
    } else {
      console.log('❌ Failed to create test participation');
    }

    // Step 4: Check withdrawal requirements after pending participation
    console.log('\n4. Checking withdrawal requirements after pending participation...');
    const pendingRequirements = await axios.get(`${BASE_URL}/api/withdrawal-requirements`, {
      withCredentials: true
    });

    console.log('Lucky draw requirement after pending participation:', pendingRequirements.data.requirement.requirements.luckyDraw);

    // Step 5: Approve the participation (simulate admin approval)
    console.log('\n5. Approving participation (simulating admin approval)...');
    const participationId = participationResponse.data.participation._id;
    const approveResponse = await axios.post(`${BASE_URL}/api/admin/participations/${participationId}/approve`, {}, {
      withCredentials: true
    });

    if (approveResponse.data.success) {
      console.log('✅ Participation approved');
    } else {
      console.log('❌ Failed to approve participation');
    }

    // Step 6: Check withdrawal requirements after approval
    console.log('\n6. Checking withdrawal requirements after approval...');
    const approvedRequirements = await axios.get(`${BASE_URL}/api/withdrawal-requirements`, {
      withCredentials: true
    });

    console.log('Lucky draw requirement after approval:', approvedRequirements.data.requirement.requirements.luckyDraw);

    // Step 7: Verify the fix
    console.log('\n7. Verifying the fix...');
    const beforeApproval = pendingRequirements.data.requirement.requirements.luckyDraw.completed;
    const afterApproval = approvedRequirements.data.requirement.requirements.luckyDraw.completed;
    const beforeMet = pendingRequirements.data.requirement.requirements.luckyDraw.met;
    const afterMet = approvedRequirements.data.requirement.requirements.luckyDraw.met;

    console.log(`Before approval: ${beforeApproval} participations, met: ${beforeMet}`);
    console.log(`After approval: ${afterApproval} participations, met: ${afterMet}`);

    if (beforeApproval === 0 && afterApproval === 1 && !beforeMet && afterMet) {
      console.log('✅ FIX VERIFIED: Lucky draw participation now correctly counts only after admin approval!');
    } else {
      console.log('❌ FIX NOT WORKING: Lucky draw participation counting incorrectly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLuckyDrawWithdrawalFix();
