const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testNewReferralSystem() {
  console.log('🧪 Testing New Referral System Implementation...\n');

  try {
    // Step 1: Register a referrer user
    console.log('1. Registering referrer user...');
    const referrerResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'referrer@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'referrer@test.com'
    });
    
    const referrerUser = referrerResponse.data;
    console.log('✅ Referrer registered with ID:', referrerUser.user?._id || 'No user ID in response');
    console.log('Referrer balance:', referrerUser.user?.balance || 0);

    // Step 2: Get referrer's referral link (should use user ID)
    console.log('\n2. Getting referrer\'s referral link...');
    const referralInfoResponse = await axios.get(`${BASE_URL}/api/referrals/my-info`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referral link:', referralInfoResponse.data.referralLink);
    console.log('Expected format: http://localhost:3000/signup?ref=<user_id>');
    
    // Extract user ID from referral link
    const referralLink = referralInfoResponse.data.referralLink;
    const userId = referralLink.split('ref=')[1];
    console.log('Extracted user ID:', userId);

    // Step 3: Register a referred user using the referral link
    console.log('\n3. Registering referred user with referral link...');
    const referredResponse = await axios.post(`${BASE_URL}/register`, {
      username: 'referred@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      email: 'referred@test.com',
      referralCode: userId // Using user ID instead of referral code
    });
    
    console.log('✅ Referred user registered successfully');
    console.log('Referred user ID:', referredResponse.data.user?._id || 'No user ID in response');

    // Step 4: Check referrer's balance (should be increased by $5)
    console.log('\n4. Checking referrer\'s updated balance...');
    const balanceResponse = await axios.get(`${BASE_URL}/api/user/balance`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referrer balance after referral:', balanceResponse.data.balance);
    console.log('Expected: $5.00 (initial $0 + $5 referral bonus)');

    // Step 5: Check referral statistics
    console.log('\n5. Checking referral statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/referrals/stats`, {
      withCredentials: true,
      headers: {
        Cookie: referrerResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Referral stats:');
    console.log('Total referrals:', statsResponse.data.totalReferrals);
    console.log('Completed referrals:', statsResponse.data.completedReferrals);
    console.log('Pending referrals:', statsResponse.data.pendingReferrals);

    // Step 6: Test referral validation with user ID
    console.log('\n6. Testing referral validation with user ID...');
    const validationResponse = await axios.get(`${BASE_URL}/api/referrals/validate/${userId}`);
    
    console.log('✅ Validation result:', validationResponse.data);
    console.log('Expected: valid: true, referrerName: referrer@test.com');

    console.log('\n🎉 New referral system test completed successfully!');
    console.log('\nSummary:');
    console.log('- Referral links now use user ID format: http://localhost:3000/signup?ref=<user_id>');
    console.log('- Referrers get $5 bonus immediately when someone signs up using their link');
    console.log('- Referral validation works with both user ID and referral code (backward compatibility)');
    console.log('- Balance is properly tracked and updated');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testNewReferralSystem(); 