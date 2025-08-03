const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Define schemas
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    email: String,
    profileImage: String,
    balance: {
        type: Number,
        default: 0
    },
    hasDeposited: {
        type: Boolean,
        default: false
    },
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

const depositSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending'
    },
    receiptUrl: String,
    transactionHash: String,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date
});

const User = mongoose.model('User', userSchema);
const Deposit = mongoose.model('Deposit', depositSchema);

async function testAndFixDepositLogic() {
    console.log('🔧 Testing and fixing deposit logic...\n');
    
    try {
        // Find the most recent test user
        const user = await User.findOne({ email: { $regex: /testuser/ } }).sort({ createdAt: -1 });
        if (!user) {
            console.log('❌ No test user found');
            return;
        }
        
        console.log('👤 Found test user:', user.email);
        console.log('Current state:', {
            balance: user.balance,
            hasDeposited: user.hasDeposited,
            _id: user._id
        });
        
        // Check if hasDeposited field exists in the document
        console.log('🔍 User document fields:', Object.keys(user.toObject()));
        
        // Find all deposits for this user
        const allDeposits = await Deposit.find({
            userId: user._id
        });
        
        console.log('💰 All deposits:', allDeposits.length);
        allDeposits.forEach(dep => {
            console.log(`  - $${dep.amount} (${dep.status}) - ID: ${dep._id}`);
        });
        
        // Check all deposits in the database
        const allDepositsInDB = await Deposit.find({});
        console.log('💰 All deposits in database:', allDepositsInDB.length);
        allDepositsInDB.forEach(dep => {
            console.log(`  - $${dep.amount} (${dep.status}) - User: ${dep.userId}`);
        });
        
        // Find confirmed deposits for this user
        const confirmedDeposits = await Deposit.find({
            userId: user._id,
            status: 'confirmed'
        });
        
        console.log('💰 Confirmed deposits:', confirmedDeposits.length);
        confirmedDeposits.forEach(dep => {
            console.log(`  - $${dep.amount} (${dep.status})`);
        });
        
        // Check if this should be the first $10 deposit
        if (confirmedDeposits.length === 1 && confirmedDeposits[0].amount === 10) {
            console.log('✅ This should be the first $10 deposit');
            
            // Fix the user state
            user.balance = 0; // Reset balance
            user.hasDeposited = true; // Unlock tasks
            await user.save();
            
            console.log('🔧 Fixed user state:', {
                balance: user.balance,
                hasDeposited: user.hasDeposited
            });
        } else if (confirmedDeposits.length > 0) {
            console.log('🔧 Found confirmed deposits, checking if first one was $10...');
            
            // Check if the first confirmed deposit was $10
            const firstDeposit = confirmedDeposits[0];
            if (firstDeposit.amount === 10) {
                console.log('✅ First deposit was $10, fixing user state...');
                
                // Fix the user state
                user.balance = 0; // Reset balance
                user.hasDeposited = true; // Unlock tasks
                await user.save();
                
                console.log('🔧 Fixed user state:', {
                    balance: user.balance,
                    hasDeposited: user.hasDeposited
                });
            } else {
                console.log('❌ First deposit was not $10');
            }
        } else {
            console.log('❌ No confirmed deposits found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testAndFixDepositLogic(); 