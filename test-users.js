const mongoose = require('mongoose');

// Define User schema (same as in app.js)
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

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/easyearn');
        console.log('Connected to MongoDB');
        
        const users = await User.find({});
        console.log('Total users:', users.length);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}, ReferralCode: ${user.referralCode || 'NO_CODE'}`);
        });
        
        const usersWithoutCode = await User.find({ referralCode: { $exists: false } });
        console.log('\nUsers without referral codes:', usersWithoutCode.length);
        
        const usersWithCode = await User.find({ referralCode: { $exists: true, $ne: null } });
        console.log('Users with referral codes:', usersWithCode.length);
        
        await mongoose.connection.close();
        console.log('Connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers(); 