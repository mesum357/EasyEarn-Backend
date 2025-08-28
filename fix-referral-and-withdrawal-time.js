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
        fixReferralAndWithdrawalIssues();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function fixReferralAndWithdrawalIssues() {
    try {
        console.log('🔧 Fixing referral verification and withdrawal time issues...');
        
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

        // Fix 1: Update referral verification logic
        console.log('\n1️⃣ Fixing referral verification logic...');
        
        // Get all users with referrals (these are the referred users)
        const usersWithReferrals = await User.find({ referredBy: { $exists: true, $ne: null } });
        console.log(`Found ${usersWithReferrals.length} users with referrals`);
        
        let referralFixes = 0;
        for (const referredUser of usersWithReferrals) {
            // Check if the referred user has deposited $10 or more
            const totalDeposits = await Deposit.aggregate([
                { $match: { userId: referredUser._id, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
            
            if (totalDepositAmount >= 10) {
                // Referred user has deposited $10+, should complete the referral for the referrer
                const referral = await Referral.findOne({
                    referrer: referredUser.referredBy,
                    referred: referredUser._id,
                    status: 'pending'
                });
                
                if (referral) {
                    referral.status = 'completed';
                    await referral.save();
                    referralFixes++;
                    console.log(`✅ Completed referral: ${referredUser.referredBy} → ${referredUser.username} (referred user deposited $${totalDepositAmount})`);
                } else {
                    console.log(`⚠️ No pending referral found for: ${referredUser.referredBy} → ${referredUser.username}`);
                }
            } else {
                console.log(`⏳ Pending referral: ${referredUser.referredBy} → ${referredUser.username} (referred user deposited $${totalDepositAmount}, needs $10+)`);
            }
        }
        
        console.log(`📊 Referral fixes applied: ${referralFixes}`);

        // Fix 2: Update withdrawal requirement period calculation
        console.log('\n2️⃣ Fixing withdrawal requirement period calculation...');
        
        const allUsers = await User.find({});
        console.log(`Found ${allUsers.length} total users`);
        
        let withdrawalFixes = 0;
        for (const user of allUsers) {
            // Calculate 15-day periods starting from user creation date
            const userCreatedAt = user.createdAt;
            const now = new Date();
            
            // Calculate current period based on user creation date
            const daysSinceCreation = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24));
            const periodNumber = Math.floor(daysSinceCreation / 15);
            
            const periodStart = new Date(userCreatedAt);
            periodStart.setDate(periodStart.getDate() + (periodNumber * 15));
            periodStart.setHours(0, 0, 0, 0);
            
            const periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + 15);
            periodEnd.setHours(23, 59, 59, 999);
            
            // Check if current requirement exists and update if needed
            let requirement = await WithdrawalRequirement.findOne({
                userId: user._id,
                periodStart: { $lte: now },
                periodEnd: { $gte: now }
            });
            
            if (requirement) {
                // Update existing requirement with correct period
                const oldPeriodStart = requirement.periodStart;
                const oldPeriodEnd = requirement.periodEnd;
                
                requirement.periodStart = periodStart;
                requirement.periodEnd = periodEnd;
                await requirement.save();
                
                withdrawalFixes++;
                console.log(`✅ Updated withdrawal period for ${user.username}: ${oldPeriodStart.toDateString()} → ${periodStart.toDateString()}`);
            } else {
                // Create new requirement with correct period
                requirement = new WithdrawalRequirement({
                    userId: user._id,
                    periodStart: periodStart,
                    periodEnd: periodEnd,
                    requirements: {
                        referrals: { required: 1, completed: 0, met: false },
                        deposit: { required: 10, completed: 0, met: false },
                        luckyDraw: { required: 1, completed: 0, met: false }
                    }
                });
                await requirement.save();
                withdrawalFixes++;
                console.log(`✅ Created withdrawal requirement for ${user.username}: ${periodStart.toDateString()} - ${periodEnd.toDateString()}`);
            }
        }
        
        console.log(`📊 Withdrawal requirement fixes applied: ${withdrawalFixes}`);

        console.log('\n✅ All fixes completed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing referral and withdrawal issues:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
