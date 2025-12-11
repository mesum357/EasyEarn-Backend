require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        fixUserBalancesWithConfirmedTransactions();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function fixUserBalancesWithConfirmedTransactions() {
    try {
        console.log('🔧 Fixing user balances with confirmed transactions...');

        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        // Define schemas for aggregation
        const depositSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const Deposit = mongoose.model('Deposit', depositSchema);

        const taskSubmissionSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            submittedAt: { type: Date, default: Date.now }
        });
        const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

        const taskSchema = new mongoose.Schema({
            title: String,
            description: String,
            reward: { type: Number, required: true }
        });
        const Task = mongoose.model('Task', taskSchema);

        const withdrawalRequestSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);



        // Analyze transaction data
        console.log('\n📊 Analyzing transaction data...');
        
        const totalDeposits = await Deposit.countDocuments();
        const confirmedDeposits = await Deposit.countDocuments({ status: 'confirmed' });
        const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
        
        const totalTaskSubmissions = await TaskSubmission.countDocuments();
        const approvedTasks = await TaskSubmission.countDocuments({ status: 'approved' });
        const pendingTasks = await TaskSubmission.countDocuments({ status: 'pending' });
        
        const totalWithdrawals = await WithdrawalRequest.countDocuments();
        const completedWithdrawals = await WithdrawalRequest.countDocuments({ status: 'completed' });
        const pendingWithdrawals = await WithdrawalRequest.countDocuments({ status: 'pending' });

        console.log(`📈 Transaction Summary:`);
        console.log(`   Deposits: ${totalDeposits} total (${confirmedDeposits} confirmed, ${pendingDeposits} pending)`);
        console.log(`   Tasks: ${totalTaskSubmissions} total (${approvedTasks} approved, ${pendingTasks} pending)`);
        console.log(`   Withdrawals: ${totalWithdrawals} total (${completedWithdrawals} completed, ${pendingWithdrawals} pending)`);

        // Get all users
        const allUsers = await User.find({});
        console.log(`\n👥 Found ${allUsers.length} users to process`);

        let processedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        for (const user of allUsers) {
            try {
                console.log(`\n👤 Processing user: ${user.email || user.username}`);
                console.log(`   Current balance: $${user.balance}`);

                const balanceInfo = await calculateUserBalanceWithConfirmedTransactions(user._id, {
                    Deposit, TaskSubmission, Task, WithdrawalRequest
                });

                console.log(`   New calculated balance: $${balanceInfo.calculatedBalance}`);
                console.log(`   Breakdown: Deposits $${balanceInfo.depositContribution}, Tasks $${balanceInfo.totalTaskRewards}, Withdrawals $${balanceInfo.totalWithdrawn}`);

                const balanceDifference = Math.abs(user.balance - balanceInfo.calculatedBalance);
                const needsUpdate = balanceDifference > 0.01;

                if (needsUpdate) {
                    const oldBalance = user.balance;
                    user.balance = balanceInfo.calculatedBalance;
                    await user.save();
                    console.log(`   ✅ Balance updated: $${oldBalance} → $${user.balance}`);
                    updatedCount++;
                } else {
                    console.log(`   ✅ Balance already correct: $${user.balance}`);
                }
                processedCount++;
            } catch (error) {
                console.error(`   ❌ Error processing user ${user.email || user.username}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📊 SUMMARY:`);
        console.log(`   ✅ Processed: ${processedCount} users`);
        console.log(`   🔄 Updated: ${updatedCount} users`);
        console.log(`   ❌ Errors: ${errorCount} users`);

    } catch (error) {
        console.error('❌ Error fixing user balances:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

async function calculateUserBalanceWithConfirmedTransactions(userId, models) {
    try {
        const { Deposit, TaskSubmission, Task, WithdrawalRequest } = models;
        
        const userIdObj = new mongoose.Types.ObjectId(userId.toString());
        
        // Get all CONFIRMED deposits
        const deposits = await Deposit.find({ 
            userId: userId, 
            status: 'confirmed' 
        }).sort({ createdAt: 1 });
        
        // Calculate deposit contribution with $10 unlock fee logic
        let depositContribution = 0;
        let remainingUnlockFee = 10;
        
        for (const deposit of deposits) {
            if (remainingUnlockFee > 0) {
                if (deposit.amount <= remainingUnlockFee) {
                    remainingUnlockFee -= deposit.amount;
                } else {
                    depositContribution += deposit.amount - remainingUnlockFee;
                    remainingUnlockFee = 0;
                }
            } else {
                depositContribution += deposit.amount;
            }
        }
        
        // Get total APPROVED task rewards
        const totalTaskRewards = await TaskSubmission.aggregate([
            { $match: { userId: userIdObj, status: 'approved' } },
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $group: { _id: null, total: { $sum: '$task.reward' } } }
        ]);
        const totalTaskRewardAmount = totalTaskRewards.length > 0 ? totalTaskRewards[0].total : 0;
        
        // Get total CONFIRMED withdrawals
        const totalWithdrawn = await WithdrawalRequest.aggregate([
            { $match: { userId: userIdObj, status: { $in: ['completed', 'pending', 'processing'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
        
        // Calculate final balance: deposits (after $10 unlock) + task rewards - withdrawals
        const finalBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
        
        return {
            totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
            depositContribution: depositContribution,
            totalTaskRewards: totalTaskRewardAmount,
            totalWithdrawn: totalWithdrawnAmount,
            calculatedBalance: finalBalance
        };
    } catch (error) {
        console.error('Error calculating user balance:', error);
        return { 
            totalDeposits: 0, 
            depositContribution: 0, 
            totalTaskRewards: 0, 
            totalWithdrawn: 0, 
            calculatedBalance: 0
        };
    }
}
