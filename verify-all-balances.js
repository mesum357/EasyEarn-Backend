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
    verifyAllBalances();
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

// Utility function for calculating user balance (same as in app.js)
async function calculateUserBalance(userId) {
  try {
    // Get total confirmed deposits
    const totalConfirmedDeposits = await Deposit.aggregate([
      { $match: { userId: userId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;

    // Get total approved task rewards
    const approvedTaskRewards = await TaskSubmission.aggregate([
      { $match: { userId: userId, status: 'approved' } },
      { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
      { $unwind: '$task' },
      { $group: { _id: null, total: { $sum: '$task.reward' } } }
    ]);
    const totalTaskRewards = approvedTaskRewards.length > 0 ? approvedTaskRewards[0].total : 0;

    // Get total withdrawals (pending, processing, and completed)
    const totalWithdrawals = await WithdrawalRequest.aggregate([
      { $match: { userId: userId, status: { $in: ['pending', 'processing', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawn = totalWithdrawals.length > 0 ? totalWithdrawals[0].total : 0;

    // Calculate balance: (deposits - $10) + task rewards - withdrawals
    const depositContribution = Math.max(0, totalDeposits - 10);
    const balance = Math.max(0, depositContribution + totalTaskRewards - totalWithdrawn);

    return {
      balance,
      totalDeposits,
      totalTaskRewards,
      totalWithdrawn,
      depositContribution
    };
  } catch (error) {
    console.error('Error calculating user balance:', error);
    return {
      balance: 0,
      totalDeposits: 0,
      totalTaskRewards: 0,
      totalWithdrawn: 0,
      depositContribution: 0
    };
  }
}

async function verifyAllBalances() {
    try {
        console.log('🔍 Starting comprehensive balance verification...');
        console.log('📊 This will analyze all users\' balances based on deposits, tasks, and withdrawals');
        console.log('');

        // Get all users
        const users = await User.find({}).sort({ createdAt: -1 });
        console.log(`👥 Found ${users.length} users to verify`);
        console.log('');

        let correctBalances = 0;
        let incorrectBalances = 0;
        let totalSystemBalance = 0;
        let totalDeposits = 0;
        let totalTaskRewards = 0;
        let totalWithdrawals = 0;
        const issues = [];

        for (const user of users) {
            // Calculate expected balance
            const balanceData = await calculateUserBalance(user._id);
            const expectedBalance = balanceData.balance;
            const actualBalance = user.balance || 0;

            // Check if balance is correct
            const isCorrect = Math.abs(actualBalance - expectedBalance) < 0.01; // Allow for small floating point differences

            if (isCorrect) {
                correctBalances++;
            } else {
                incorrectBalances++;
                issues.push({
                    username: user.username,
                    email: user.email,
                    actualBalance: actualBalance,
                    expectedBalance: expectedBalance,
                    difference: Math.abs(actualBalance - expectedBalance),
                    totalDeposits: balanceData.totalDeposits,
                    totalTaskRewards: balanceData.totalTaskRewards,
                    totalWithdrawn: balanceData.totalWithdrawn
                });
            }

            totalSystemBalance += expectedBalance;
            totalDeposits += balanceData.totalDeposits;
            totalTaskRewards += balanceData.totalTaskRewards;
            totalWithdrawals += balanceData.totalWithdrawn;

            // Show detailed breakdown for users with issues or significant balances
            if (!isCorrect || expectedBalance > 0) {
                console.log(`\n👤 ${user.username} (${user.email})`);
                console.log(`   Current Balance: $${actualBalance}`);
                console.log(`   Expected Balance: $${expectedBalance}`);
                console.log(`   Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
                
                if (!isCorrect) {
                    console.log(`   Difference: $${Math.abs(actualBalance - expectedBalance)}`);
                }
                
                console.log(`   📊 Breakdown:`);
                console.log(`      Total Deposits: $${balanceData.totalDeposits}`);
                console.log(`      Deposit Contribution: $${balanceData.depositContribution} (${balanceData.totalDeposits} - 10)`);
                console.log(`      Task Rewards: $${balanceData.totalTaskRewards}`);
                console.log(`      Withdrawals: $${balanceData.totalWithdrawn}`);
                console.log(`      Calculation: $${balanceData.depositContribution} + $${balanceData.totalTaskRewards} - $${balanceData.totalWithdrawn} = $${expectedBalance}`);
            }
        }

        console.log('\n🎯 VERIFICATION COMPLETE!');
        console.log('📊 Summary:');
        console.log(`   Total users: ${users.length}`);
        console.log(`   Correct balances: ${correctBalances}`);
        console.log(`   Incorrect balances: ${incorrectBalances}`);
        console.log(`   Accuracy: ${((correctBalances / users.length) * 100).toFixed(2)}%`);
        console.log('');

        console.log('💰 System Totals:');
        console.log(`   Total System Balance: $${totalSystemBalance.toFixed(2)}`);
        console.log(`   Total Deposits: $${totalDeposits.toFixed(2)}`);
        console.log(`   Total Task Rewards: $${totalTaskRewards.toFixed(2)}`);
        console.log(`   Total Withdrawals: $${totalWithdrawals.toFixed(2)}`);
        console.log('');

        if (issues.length > 0) {
            console.log('❌ BALANCE ISSUES FOUND:');
            console.log('========================');
            issues.forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.username} (${issue.email})`);
                console.log(`   Actual: $${issue.actualBalance}`);
                console.log(`   Expected: $${issue.expectedBalance}`);
                console.log(`   Difference: $${issue.difference.toFixed(4)}`);
                console.log(`   Deposits: $${issue.totalDeposits}, Tasks: $${issue.totalTaskRewards}, Withdrawals: $${issue.totalWithdrawn}`);
            });
        } else {
            console.log('✅ ALL BALANCES ARE CORRECT!');
        }

        console.log('\n🎉 Balance verification completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during balance verification:', error);
        process.exit(1);
    }
}
