const axios = require('axios');

async function testRegistrationNoEmail() {
    console.log('Testing registration without email verification...\n');
    
    try {
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await axios.post('http://localhost:3005/register', {
            username: 'test3@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            email: 'test3@example.com'
        });
        
        console.log('✅ Registration response:', registerResponse.data);
        
        // Step 2: Manually verify the user in database
        console.log('2. Manually verifying user...');
        const mongoose = require('mongoose');
        
        const userSchema = new mongoose.Schema({
            username: String,
            password: String,
            googleId: String,
            email: String,
            profileImage: String,
            referralCode: {
                type: String,
                unique: true,
                sparse: true
            },
            referredBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            verified: {
                type: Boolean,
                default: false
            },
            verificationToken: String,
            resetPasswordToken: String,
            resetPasswordExpires: Date
        });
        
        const User = mongoose.model('User', userSchema);
        
        await mongoose.connect('mongodb://localhost:27017/easyearn');
        
        const user = await User.findOne({ email: 'test3@example.com' });
        if (user) {
            console.log('Found user, verifying...');
            user.verified = true;
            user.verificationToken = undefined;
            await user.save();
            console.log('✅ User verified');
        } else {
            console.log('❌ User not found in database');
        }
        
        await mongoose.connection.close();
        
        // Step 3: Try to login
        console.log('3. Attempting login...');
        const loginResponse = await axios.post('http://localhost:3005/login', {
            username: 'test3@example.com',
            password: 'password123'
        }, {
            withCredentials: true
        });
        
        console.log('✅ Login successful:', loginResponse.data);
        
        // Step 4: Get referral info
        console.log('4. Getting referral info...');
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

testRegistrationNoEmail(); 