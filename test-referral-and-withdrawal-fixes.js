require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");
        testReferralAndWithdrawalFixes();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testReferralAndWithdrawalFixes() {
    try {
        console.log('🧪 Testing referral and withdrawal fixes...');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        const depositSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const Deposit = mongoose.model('Deposit', depositSchema);

        const referralSchema = new mongoose.Schema({
            referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const Referral = mongoose.model('Referral', referralSchema);

        const withdrawalRequirementSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            periodStart: { type: Date, required: true },
            periodEnd: { type: Date, required: true },
            requirements: {
                referrals: { required: { type: Number, default: 2 }, completed: { type: Number, default: 0 }, met: { type: Boolean, default: false } },
                deposit: { required: { type: Number, default: 10 }, completed: { type: Number, default: 0 }, met: { type: Boolean, default: false } },
                luckyDraw: { required: { type: Number, default: 1 }, completed: { type: Number, default: 0 }, met: { type: Boolean, default: false } }
            },
            allRequirementsMet: { type: Boolean, default: false },
            balanceReset: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });
        const WithdrawalRequirement = mongoose.model('WithdrawalRequirement', withdrawalRequirementSchema);

        // Test 1: Referral Verification Logic
        console.log('\n1️⃣ Testing Referral Verification Logic:');
        
        // Find users with referrals (these are the referred users)
        const usersWithReferrals = await User.find({ referredBy: { $exists: true, $ne: null } }).limit(5);
        console.log(`Found ${usersWithReferrals.length} referred users to test`);
        
        for (const referredUser of usersWithReferrals) {
            // Check deposits of the referred user
            const totalDeposits = await Deposit.aggregate([
                { $match: { userId: referredUser._id, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
            
            // Check referral status
            const referral = await Referral.findOne({
                referrer: referredUser.referredBy,
                referred: referredUser._id
            });
            
            console.log(`   Referred User: ${referredUser.username}`);
            console.log(`   Referrer: ${referredUser.referredBy}`);
            console.log(`   Referred User Deposits: $${totalDepositAmount}`);
            console.log(`   Referral Status: ${referral ? referral.status : 'Not found'}`);
            console.log(`   Should be completed: ${totalDepositAmount >= 10 ? 'Yes' : 'No'}`);
            console.log(`   ✅ ${totalDepositAmount >= 10 && referral && referral.status === 'completed' ? 'CORRECT' : 'NEEDS FIX'}`);
        }

        // Test 2: Withdrawal Time Calculation
        console.log('\n2️⃣ Testing Withdrawal Time Calculation:');
        
        const testUsers = await User.find({}).limit(3);
        const now = new Date();
        
        for (const user of testUsers) {
            const userCreatedAt = user.createdAt;
            const daysSinceCreation = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24));
            const periodNumber = Math.floor(daysSinceCreation / 15);
            
            const periodStart = new Date(userCreatedAt);
            periodStart.setDate(periodStart.getDate() + (periodNumber * 15));
            periodStart.setHours(0, 0, 0, 0);
            
            const periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + 15);
            periodEnd.setHours(23, 59, 59, 999);
            
            console.log(`   User: ${user.username}`);
            console.log(`   Created: ${userCreatedAt.toDateString()}`);
            console.log(`   Days since creation: ${daysSinceCreation}`);
            console.log(`   Current period: ${periodNumber + 1}`);
            console.log(`   Period: ${periodStart.toDateString()} - ${periodEnd.toDateString()}`);
            console.log(`   ✅ Period calculated from user creation date`);
        }

        // Test 3: Simulate checkAndCompleteReferrals function
        console.log('\n3️⃣ Testing checkAndCompleteReferrals Function:');
        
        async function testCheckAndCompleteReferrals(userId) {
            const user = await User.findById(userId);
            if (!user) {
                return 'User not found';
            }

            // Check if the referred user has deposited $10 or more
            const totalDeposits = await Deposit.aggregate([
                { $match: { userId: userId, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;

            if (totalDepositAmount < 10) {
                return `Not completed: Referred user only deposited $${totalDepositAmount}, needs $10+`;
            }

            // Find pending referrals for this referred user
            const pendingReferrals = await Referral.find({
                referred: userId,
                status: 'pending'
            });

            return `Should complete ${pendingReferrals.length} referrals (referred user deposited $${totalDepositAmount})`;
        }
        
        for (const referredUser of usersWithReferrals.slice(0, 3)) {
            const result = await testCheckAndCompleteReferrals(referredUser._id);
            console.log(`   ${referredUser.username} (referred user): ${result}`);
        }

        console.log('\n✅ Referral and withdrawal fixes test completed!');
        
    } catch (error) {
        console.error('❌ Error testing referral and withdrawal fixes:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
