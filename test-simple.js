const axios = require('axios');

async function testSimple() {
    console.log('Testing simple registration and referral...\n');
    
    try {
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await axios.post('http://localhost:3005/register', {
            username: 'test4@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            email: 'test4@example.com'
        });
        
        console.log('✅ Registration successful');
        console.log('Referral code:', registerResponse.data.referralCode);
        
        // Step 2: Login
        console.log('\n2. Logging in...');
        const loginResponse = await axios.post('http://localhost:3005/login', {
            username: 'test4@example.com',
            password: 'password123'
        }, {
            withCredentials: true
        });
        
        console.log('✅ Login successful');
        console.log('User:', loginResponse.data.user);
        
        // Step 3: Test /me endpoint
        console.log('\n3. Testing /me endpoint...');
        const meResponse = await axios.get('http://localhost:3005/me', {
            withCredentials: true
        });
        
        console.log('✅ /me response:');
        console.log('User:', meResponse.data.user);
        console.log('Has referral code:', !!meResponse.data.user.referralCode);
        console.log('Referral code:', meResponse.data.user.referralCode);
        
        // Step 4: Get referral info
        console.log('\n4. Getting referral info...');
        const referralResponse = await axios.get('http://localhost:3005/api/referrals/my-info', {
            withCredentials: true
        });
        
        console.log('✅ Referral info:');
        console.log('Referral Code:', referralResponse.data.referralCode);
        console.log('Referral Link:', referralResponse.data.referralLink);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('❌ Error status:', error.response?.status);
    }
}

testSimple(); 