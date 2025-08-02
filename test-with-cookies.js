const axios = require('axios');

async function testWithCookies() {
    console.log('Testing with proper cookie handling...\n');
    
    // Create axios instance that maintains cookies
    const client = axios.create({
        baseURL: 'http://localhost:3005',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
    
    try {
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await client.post('/register', {
            username: 'test5@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            email: 'test5@example.com'
        });
        
        console.log('✅ Registration successful');
        console.log('Referral code:', registerResponse.data.referralCode);
        
        // Step 2: Login (this should set cookies)
        console.log('\n2. Logging in...');
        const loginResponse = await client.post('/login', {
            username: 'test5@example.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful');
        console.log('User:', loginResponse.data.user);
        console.log('Session ID:', loginResponse.data.session?.id);
        
        // Step 3: Test /me endpoint with cookies
        console.log('\n3. Testing /me endpoint...');
        const meResponse = await client.get('/me');
        
        console.log('✅ /me response:');
        console.log('User:', meResponse.data.user);
        console.log('Has referral code:', !!meResponse.data.user.referralCode);
        console.log('Referral code:', meResponse.data.user.referralCode);
        
        // Step 4: Get referral info
        console.log('\n4. Getting referral info...');
        const referralResponse = await client.get('/api/referrals/my-info');
        
        console.log('✅ Referral info:');
        console.log('Referral Code:', referralResponse.data.referralCode);
        console.log('Referral Link:', referralResponse.data.referralLink);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error headers:', error.response?.headers);
    }
}

testWithCookies(); 