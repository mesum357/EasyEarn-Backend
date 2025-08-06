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

async function debugDepositLogic() {
    console.log('🔍 Debugging deposit logic...\n');
    
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
        
        // Find all deposits for this user
        const allDeposits = await Deposit.find({
            userId: user._id
        });
        
        console.log('💰 All deposits for user:', allDeposits.length);
        allDeposits.forEach(dep => {
            console.log(`  - $${dep.amount} (${dep.status}) - ID: ${dep._id}`);
        });
        
        // Test the exact logic from the app.js file
        console.log('\n🔍 Testing deposit logic from app.js...');
        
        // Simulate the deposit confirmation logic
        const deposit = allDeposits[0]; // Get the first deposit
        
        if (deposit) {
            console.log('📝 Testing with deposit:', {
                amount: deposit.amount,
                status: deposit.status,
                userId: deposit.userId
            });
            
            // Test the countDocuments logic
            const totalConfirmedDeposits = await Deposit.countDocuments({ 
                userId: deposit.userId, 
                status: 'confirmed'
            });
            
            console.log('📊 Total confirmed deposits count:', totalConfirmedDeposits);
            
            // Test the condition
            const isFirstDeposit = totalConfirmedDeposits === 1 && deposit.amount === 10;
            console.log('🔍 Is first deposit?', isFirstDeposit);
            console.log('  - totalConfirmedDeposits === 1:', totalConfirmedDeposits === 1);
            console.log('  - deposit.amount === 10:', deposit.amount === 10);
            
            if (isFirstDeposit) {
                console.log('✅ Should only unlock tasks, not add to balance');
            } else {
                console.log('❌ Should add to balance normally');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugDepositLogic(); 