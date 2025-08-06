const axios = require('axios');

const baseURL = 'http://localhost:3005';

async function testReferralSystem() {
    console.log('Testing referral system...\n');
    
    try {
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await axios.post(`${baseURL}/register`, {
            username: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            email: 'test@example.com'
        });
        
        console.log('✅ Registration successful:', registerResponse.data.message);
        console.log('Referral code generated:', registerResponse.data.referralCode);
        
        // Step 2: Login to get session
        console.log('\n2. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/login`, {
            username: 'test@example.com',
            password: 'password123'
        }, {
            withCredentials: true
        });
        
        console.log('✅ Login successful');
        
        // Step 3: Get referral info
        console.log('\n3. Getting referral info...');
        const referralResponse = await axios.get(`${baseURL}/api/referrals/my-info`, {
            withCredentials: true
        });
        
        console.log('✅ Referral info retrieved:');
        console.log('Referral Code:', referralResponse.data.referralCode);
        console.log('Referral Link:', referralResponse.data.referralLink);
        console.log('Total Referrals:', referralResponse.data.totalReferrals);
        
        // Step 4: Get referral stats
        console.log('\n4. Getting referral stats...');
        const statsResponse = await axios.get(`${baseURL}/api/referrals/stats`, {
            withCredentials: true
        });
        
        console.log('✅ Referral stats retrieved:');
        console.log('Total Referrals:', statsResponse.data.totalReferrals);
        console.log('Pending Referrals:', statsResponse.data.pendingReferrals);
        console.log('Completed Referrals:', statsResponse.data.completedReferrals);
        console.log('This Month:', statsResponse.data.thisMonthReferrals);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error headers:', error.response?.headers);
        if (error.response?.status === 401) {
            console.log('Note: User might need email verification first');
        }
    }
}

testReferralSystem(); 