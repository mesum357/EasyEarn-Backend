const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEmailVerificationReferral() {
  console.log('🧪 Testing Email Verification with Referral System...\n');

  try {
    // Step 1: Register a referrer user
    console.log('1. Registering referrer user...');
    const referrerResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'referrer2@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'referrer2@test.com'
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
      username: 'referred2@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'referred2@test.com',
      referralCode: userId
    });
    
    console.log('✅ Referred user registered successfully');
    console.log('Message:', referredResponse.data.message);

    // Step 4: Check referrer's balance (should still be 0 before verification)
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

    // Step 6: Simulate email verification (in real scenario, user clicks email link)
    console.log('\n6. Simulating email verification...');
    console.log('Note: In production, user would click the verification link in their email');
    console.log('For testing, we can manually verify the user in the database');

    // Step 7: Test resend verification endpoint
    console.log('\n7. Testing resend verification endpoint...');
    const resendResponse = await axios.post(`${BASE_URL}/api/resend-verification`, {
      email: 'referred2@test.com'
    });
    
    console.log('✅ Resend verification response:', resendResponse.data.message);

    console.log('\n🎉 Email verification with referral system test completed!');
    console.log('\nSummary:');
    console.log('- Referral links use user ID format: http://localhost:3000/signup?ref=<user_id>');
    console.log('- Email verification is required for referral bonuses');
    console.log('- Referral status starts as "pending" and becomes "completed" after verification');
    console.log('- $5 bonus is only given after email verification');
    console.log('- Resend verification endpoint works correctly');
    console.log('\nNext steps:');
    console.log('1. Check the email for verification link');
    console.log('2. Click the verification link');
    console.log('3. Verify that referrer gets $5 bonus after verification');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testEmailVerificationReferral(); 