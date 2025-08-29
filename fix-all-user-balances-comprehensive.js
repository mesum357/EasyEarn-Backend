require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI, {
    ssl: process.env.NODE_ENV === 'production',
    tls: process.env.NODE_ENV === 'production',
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
})
.then(() => {
    console.log("✅ Connected to MongoDB");
    runBalanceFix();
})
.catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
});

// Define schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    hasDeposited: { type: Boolean, default: false },
    tasksUnlocked: { type: Boolean, default: false },
    referredBy: { type: String },
    referralCode: { type: String, unique: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const depositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    transactionHash: { type: String },
    receiptUrl: { type: String },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    confirmedAt: Date
});

const withdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    walletAddress: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
    processedAt: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    reward: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Social Media', 'App Store', 'Survey', 'Other'] },
    timeEstimate: { type: String, required: true },
    requirements: [{ type: String }],
    url: { type: String, default: "" },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const taskSubmissionSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    screenshotUrl: { type: String },
    notes: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String }
});

// Create models
const User = mongoose.model('User', userSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
const Task = mongoose.model('Task', taskSchema);
const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

async function runBalanceFix() {
    try {
        console.log('🚀 Starting comprehensive user balance fix...');
        console.log('📊 This script will:');
        console.log('   1. Calculate balance = (confirmed deposits - $10) + approved task rewards - confirmed withdrawals');
        console.log('   2. Unlock tasks for users with $10+ total confirmed deposits');
        console.log('   3. Update hasDeposited flag based on deposit status');
        console.log('   4. Provide detailed breakdown for each user');
        console.log('');

        // Get all users
        const users = await User.find({}).sort({ createdAt: -1 });
        console.log(`👥 Found ${users.length} users to process`);
        console.log('');

        let processedCount = 0;
        let updatedCount = 0;
        let taskUnlockedCount = 0;
        let totalSystemBalance = 0;

        for (const user of users) {
            processedCount++;
            console.log(`\n🔍 Processing user ${processedCount}/${users.length}: ${user.username} (${user.email})`);
            console.log(`   User ID: ${user._id}`);
            console.log(`   Current balance: $${user.balance || 0}`);
            console.log(`   Current hasDeposited: ${user.hasDeposited}`);
            console.log(`   Current tasksUnlocked: ${user.tasksUnlocked}`);

            // Get confirmed deposits for this user
            const confirmedDeposits = await Deposit.find({ 
                userId: user._id, 
                status: 'confirmed' 
            }).sort({ createdAt: 1 }); // Sort by creation date to identify first deposit

            const totalConfirmedDeposits = confirmedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
            console.log(`   📥 Confirmed deposits: ${confirmedDeposits.length} deposits, total: $${totalConfirmedDeposits}`);

            // Get approved task rewards
            const approvedTaskRewards = await TaskSubmission.aggregate([
                { $match: { userId: user._id, status: 'approved' } },
                { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                { $unwind: '$task' },
                { $group: { _id: null, total: { $sum: '$task.reward' } } }
            ]);
            const totalTaskRewards = approvedTaskRewards.length > 0 ? approvedTaskRewards[0].total : 0;
            console.log(`   ✅ Approved task rewards: $${totalTaskRewards}`);

            // Get confirmed withdrawals
            const confirmedWithdrawals = await WithdrawalRequest.find({ 
                userId: user._id, 
                status: 'completed' 
            });
            const totalWithdrawn = confirmedWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
            console.log(`   📤 Confirmed withdrawals: ${confirmedWithdrawals.length} withdrawals, total: $${totalWithdrawn}`);

            // Calculate new balance
            const depositContribution = Math.max(0, totalConfirmedDeposits - 10); // Only deposits beyond $10 count
            const newBalance = Math.max(0, depositContribution + totalTaskRewards - totalWithdrawn);
            
            console.log(`   💰 Balance calculation:`);
            console.log(`      Deposits beyond $10: $${totalConfirmedDeposits} - $10 = $${depositContribution}`);
            console.log(`      Task rewards: $${totalTaskRewards}`);
            console.log(`      Withdrawals: -$${totalWithdrawn}`);
            console.log(`      New balance: $${depositContribution} + $${totalTaskRewards} - $${totalWithdrawn} = $${newBalance}`);

            // Determine if tasks should be unlocked
            const shouldUnlockTasks = totalConfirmedDeposits >= 10;
            const shouldHaveDeposited = totalConfirmedDeposits > 0;

            console.log(`   🔓 Task unlocking:`);
            console.log(`      Total confirmed deposits: $${totalConfirmedDeposits}`);
            console.log(`      Should unlock tasks: ${shouldUnlockTasks} (${totalConfirmedDeposits >= 10 ? '≥$10' : '<$10'})`);
            console.log(`      Should have deposited: ${shouldHaveDeposited} (${totalConfirmedDeposits > 0 ? '>0' : '=0'})`);

            // Check if updates are needed
            const balanceChanged = user.balance !== newBalance;
            const hasDepositedChanged = user.hasDeposited !== shouldHaveDeposited;
            const tasksUnlockedChanged = user.tasksUnlocked !== shouldUnlockTasks;
            const needsUpdate = balanceChanged || hasDepositedChanged || tasksUnlockedChanged;

            if (needsUpdate) {
                console.log(`   ⚠️  Updates needed:`);
                if (balanceChanged) console.log(`      Balance: $${user.balance || 0} → $${newBalance}`);
                if (hasDepositedChanged) console.log(`      hasDeposited: ${user.hasDeposited} → ${shouldHaveDeposited}`);
                if (tasksUnlockedChanged) console.log(`      tasksUnlocked: ${user.tasksUnlocked} → ${shouldUnlockTasks}`);

                // Update user
                user.balance = newBalance;
                user.hasDeposited = shouldHaveDeposited;
                user.tasksUnlocked = shouldUnlockTasks;
                await user.save();

                updatedCount++;
                if (tasksUnlockedChanged && shouldUnlockTasks) {
                    taskUnlockedCount++;
                }

                console.log(`   ✅ User updated successfully`);
            } else {
                console.log(`   ✅ No updates needed - user data is correct`);
            }

            totalSystemBalance += newBalance;

            // Show detailed breakdown for this user
            console.log(`   📋 Detailed breakdown:`);
            confirmedDeposits.forEach((deposit, index) => {
                const isFirst = index === 0;
                const countsTowardBalance = isFirst ? Math.max(0, deposit.amount - 10) : deposit.amount;
                console.log(`      Deposit ${index + 1}: $${deposit.amount} (${isFirst ? 'First deposit' : 'Subsequent'}) - ${countsTowardBalance > 0 ? `$${countsTowardBalance} counts toward balance` : 'Unlocks tasks only'}`);
            });

            if (approvedTaskRewards.length > 0) {
                const taskDetails = await TaskSubmission.aggregate([
                    { $match: { userId: user._id, status: 'approved' } },
                    { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                    { $unwind: '$task' },
                    { $project: { taskTitle: '$task.title', taskReward: '$task.reward' } }
                ]);
                taskDetails.forEach(task => {
                    console.log(`      Task: ${task.taskTitle} - $${task.taskReward}`);
                });
            }

            confirmedWithdrawals.forEach((withdrawal, index) => {
                console.log(`      Withdrawal ${index + 1}: $${withdrawal.amount} (${withdrawal.status})`);
            });
        }

        console.log('\n🎉 COMPREHENSIVE BALANCE FIX COMPLETE!');
        console.log('📊 Summary:');
        console.log(`   Total users processed: ${processedCount}`);
        console.log(`   Users updated: ${updatedCount}`);
        console.log(`   Tasks unlocked: ${taskUnlockedCount}`);
        console.log(`   Total system balance: $${totalSystemBalance}`);
        console.log('');

        // Final verification
        console.log('🔍 Final verification:');
        const finalUserCount = await User.countDocuments({});
        const usersWithTasksUnlocked = await User.countDocuments({ tasksUnlocked: true });
        const usersWithDeposits = await User.countDocuments({ hasDeposited: true });
        const totalFinalBalance = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);

        console.log(`   Total users: ${finalUserCount}`);
        console.log(`   Users with tasks unlocked: ${usersWithTasksUnlocked}`);
        console.log(`   Users with deposits: ${usersWithDeposits}`);
        console.log(`   Total system balance: $${totalFinalBalance[0]?.total || 0}`);

        console.log('\n✅ Script completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during balance fix:', error);
        process.exit(1);
    }
}
