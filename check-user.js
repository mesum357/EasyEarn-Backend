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

async function checkUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/easyearn');
        console.log('Connected to MongoDB');
        
        // Find the user we just created
        const user = await User.findOne({ email: 'test3@example.com' });
        if (user) {
            console.log('Found user:', user.email);
            console.log('User ID:', user._id);
            console.log('Verified:', user.verified);
            console.log('Referral code:', user.referralCode);
            console.log('Username:', user.username);
            console.log('Created at:', user.createdAt);
        } else {
            console.log('❌ User not found');
            
            // List all users to see what's in the database
            const allUsers = await User.find({});
            console.log('All users in database:', allUsers.length);
            allUsers.forEach(u => console.log('User:', u.email, 'Verified:', u.verified, 'ReferralCode:', u.referralCode));
        }
        
        await mongoose.connection.close();
        console.log('Connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser(); 