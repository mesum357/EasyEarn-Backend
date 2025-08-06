const axios = require('axios');

async function generateReferralCodesForExistingUsers() {
    console.log('Generating referral codes for existing users...\n');
    const baseURL = 'http://localhost:3005';
    
    try {
        // First, generate referral codes for existing users
        const response = await axios.post(`${baseURL}/api/admin/generate-referral-codes`);
        console.log('✅ Success:', response.data.message);
        console.log('Updated users:', response.data.updatedCount);
        
        // Now test the referral system by logging in and getting referral info
        console.log('\n--- Testing Referral System ---');
        
        // Login with a test user (you'll need to create one first)
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/login`, {
            username: 'test@example.com',
            password: 'password123'
        }, {
            withCredentials: true
        });
        
        console.log('✅ Login successful');
        
        // Get referral info
        console.log('2. Getting referral info...');
        const referralResponse = await axios.get(`${baseURL}/api/referrals/my-info`, {
            withCredentials: true
        });
        
        console.log('✅ Referral info:');
        console.log('Referral Code:', referralResponse.data.referralCode);
        console.log('Referral Link:', referralResponse.data.referralLink);
        console.log('Total Referrals:', referralResponse.data.totalReferrals);
        
        // Test the /me endpoint
        console.log('3. Testing /me endpoint...');
        const meResponse = await axios.get(`${baseURL}/me`, {
            withCredentials: true
        });
        
        console.log('✅ /me response:');
        console.log('User:', meResponse.data.user);
        console.log('Has referral code:', !!meResponse.data.user.referralCode);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('Note: You may need to create a test user first or verify email');
        }
    }
}

generateReferralCodesForExistingUsers(); 