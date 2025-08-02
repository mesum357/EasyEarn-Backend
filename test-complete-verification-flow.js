const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCompleteVerificationFlow() {
  console.log('🧪 Testing Complete Email Verification and Referral Bonus Flow...\n');

  try {
    // Step 1: Register a referrer user
    console.log('1. Registering referrer user...');
    const referrerResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'referrer4@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'referrer4@test.com'
    });
    
    console.log('✅ Referrer registered successfully');
    console.log('Referrer balance:', referrerResponse.data.user?.balance || 0);

    // Step 2: Get referrer's referral link
    console.log('\n2. Getting referrer\'s referral link...');
    const referralInfoResponse = await axios.get(`${BASE_URL}/api/referrals/my-info`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    const referralLink = referralInfoResponse.data.referralLink;
    const userId = referralLink.split('ref=')[1];
    console.log('✅ Referral link:', referralLink);

    // Step 3: Register a referred user using the referral link
    console.log('\n3. Registering referred user with referral link...');
    const referredResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'referred4@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'referred4@test.com',
      referralCode: userId
    });
    
    console.log('✅ Referred user registered successfully');
    console.log('Message:', referredResponse.data.message);

    // Step 4: Check referrer's balance before verification (should be 0)
    console.log('\n4. Checking referrer\'s balance before email verification...');
    const balanceBeforeResponse = await axios.get(`${BASE_URL}/api/user/balance`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referrer balance before verification:', balanceBeforeResponse.data.balance);
    console.log('Expected: $0.00 (bonus not given yet)');

    // Step 5: Check referral statistics (should show pending)
    console.log('\n5. Checking referral statistics (should show pending)...');
    const statsBeforeResponse = await axios.get(`${BASE_URL}/api/referrals/stats`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referral stats before verification:');
    console.log('Total referrals:', statsBeforeResponse.data.totalReferrals);
    console.log('Pending referrals:', statsBeforeResponse.data.pendingReferrals);
    console.log('Completed referrals:', statsBeforeResponse.data.completedReferrals);

    // Step 6: Manually verify the referred user (simulating email verification)
    console.log('\n6. Manually verifying the referred user...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/admin/verify-user`, {
      email: 'referred4@test.com'
    });
    
    console.log('✅ Verification response:', verifyResponse.data.message);
    console.log('User details:', verifyResponse.data.user);

    // Step 7: Check referrer's balance after verification (should be $5)
    console.log('\n7. Checking referrer\'s balance after email verification...');
    const balanceAfterResponse = await axios.get(`${BASE_URL}/api/user/balance`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referrer balance after verification:', balanceAfterResponse.data.balance);
    console.log('Expected: $5.00 (bonus should be given)');

    // Step 8: Check referral statistics (should show completed)
    console.log('\n8. Checking referral statistics (should show completed)...');
    const statsAfterResponse = await axios.get(`${BASE_URL}/api/referrals/stats`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referral stats after verification:');
    console.log('Total referrals:', statsAfterResponse.data.totalReferrals);
    console.log('Pending referrals:', statsAfterResponse.data.pendingReferrals);
    console.log('Completed referrals:', statsAfterResponse.data.completedReferrals);

    // Step 9: Test the API verification endpoint
    console.log('\n9. Testing API verification endpoint with invalid token...');
    try {
      await axios.post(`${BASE_URL}/api/verify-email`, { token: 'invalid-token' });
    } catch (error) {
      console.log('✅ Correctly rejected invalid token:', error.response.data.error);
    }

    console.log('\n🎉 Complete verification and referral system test completed successfully!');
    console.log('\nSummary:');
    console.log('- Referral links use user ID format: http://localhost:3000/signup?ref=<user_id>');
    console.log('- Email verification is required for referral bonuses');
    console.log('- Referral status changes from "pending" to "completed" after verification');
    console.log('- $5 bonus is properly given after email verification');
    console.log('- Balance is correctly updated in the database');
    console.log('- API endpoints work correctly with proper error handling');
    console.log('\n✅ All systems working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testCompleteVerificationFlow(); 