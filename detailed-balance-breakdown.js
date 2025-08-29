require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        showDetailedBalanceBreakdown();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function showDetailedBalanceBreakdown() {
    try {
        console.log('🔍 Showing detailed balance breakdown for all users...');

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



        // Get all users
        const allUsers = await User.find({}).sort({ email: 1 });
        console.log(`\n👥 Found ${allUsers.length} users to analyze`);

        let totalDeposits = 0;
        let totalTaskRewards = 0;
        let totalWithdrawals = 0;
        let totalFinalBalance = 0;

        console.log('\n' + '='.repeat(120));
        console.log('📊 DETAILED BALANCE BREAKDOWN FOR ALL USERS');
        console.log('='.repeat(120));

        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i];
            try {
                console.log(`\n${i + 1}. 👤 ${user.email || user.username} (${user._id})`);
                console.log('   ' + '-'.repeat(80));

                const balanceInfo = await getDetailedBalanceBreakdown(user._id, {
                    Deposit, TaskSubmission, Task, WithdrawalRequest
                });

                // Current balance in database
                console.log(`   💰 Current Balance in DB: $${user.balance.toFixed(2)}`);
                console.log(`   🧮 Calculated Balance: $${balanceInfo.calculatedBalance.toFixed(2)}`);

                // Deposit breakdown
                console.log(`\n   💳 DEPOSIT BREAKDOWN:`);
                console.log(`      Total Confirmed Deposits: $${balanceInfo.totalDeposits.toFixed(2)}`);
                console.log(`      Unlock Fee Applied: $${balanceInfo.unlockFeePaid.toFixed(2)}`);
                console.log(`      Deposit Contribution to Balance: $${balanceInfo.depositContribution.toFixed(2)}`);
                
                if (balanceInfo.depositDetails.length > 0) {
                    console.log(`      Individual Deposits:`);
                    balanceInfo.depositDetails.forEach((deposit, idx) => {
                        console.log(`         ${idx + 1}. $${deposit.amount.toFixed(2)} (${deposit.status}) - ${deposit.createdAt.toLocaleDateString()}`);
                    });
                }

                // Task breakdown
                console.log(`\n   📋 TASK BREAKDOWN:`);
                console.log(`      Total Approved Task Rewards: $${balanceInfo.totalTaskRewards.toFixed(2)}`);
                
                if (balanceInfo.taskDetails.length > 0) {
                    console.log(`      Individual Tasks:`);
                    balanceInfo.taskDetails.forEach((task, idx) => {
                        console.log(`         ${idx + 1}. $${task.reward.toFixed(2)} - ${task.title} (${task.submittedAt.toLocaleDateString()})`);
                    });
                }

                // Withdrawal breakdown
                console.log(`\n   💸 WITHDRAWAL BREAKDOWN:`);
                console.log(`      Total Confirmed Withdrawals: $${balanceInfo.totalWithdrawn.toFixed(2)}`);
                
                if (balanceInfo.withdrawalDetails.length > 0) {
                    console.log(`      Individual Withdrawals:`);
                    balanceInfo.withdrawalDetails.forEach((withdrawal, idx) => {
                        console.log(`         ${idx + 1}. $${withdrawal.amount.toFixed(2)} (${withdrawal.status}) - ${withdrawal.createdAt.toLocaleDateString()}`);
                    });
                }



                // Final calculation
                console.log(`\n   🧮 BALANCE CALCULATION:`);
                console.log(`      Formula: (Deposits - $10 unlock) + Tasks - Withdrawals = Balance`);
                console.log(`      Calculation: ($${balanceInfo.totalDeposits.toFixed(2)} - $${balanceInfo.unlockFeePaid.toFixed(2)}) + $${balanceInfo.totalTaskRewards.toFixed(2)} - $${balanceInfo.totalWithdrawn.toFixed(2)} = $${balanceInfo.calculatedBalance.toFixed(2)}`);

                // Status
                const balanceDifference = Math.abs(user.balance - balanceInfo.calculatedBalance);
                if (balanceDifference > 0.01) {
                    console.log(`   ⚠️  BALANCE MISMATCH: DB shows $${user.balance.toFixed(2)}, should be $${balanceInfo.calculatedBalance.toFixed(2)}`);
                } else {
                    console.log(`   ✅ Balance is correct`);
                }

                // Add to totals
                totalDeposits += balanceInfo.totalDeposits;
                totalTaskRewards += balanceInfo.totalTaskRewards;
                totalWithdrawals += balanceInfo.totalWithdrawn;
                totalFinalBalance += balanceInfo.calculatedBalance;

            } catch (error) {
                console.error(`   ❌ Error analyzing user ${user.email || user.username}:`, error.message);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(120));
        console.log('📊 SYSTEM-WIDE SUMMARY');
        console.log('='.repeat(120));
        console.log(`Total Users Analyzed: ${allUsers.length}`);
        console.log(`Total Confirmed Deposits: $${totalDeposits.toFixed(2)}`);
        console.log(`Total Approved Task Rewards: $${totalTaskRewards.toFixed(2)}`);
        console.log(`Total Confirmed Withdrawals: $${totalWithdrawals.toFixed(2)}`);
        console.log(`Total Final Balance: $${totalFinalBalance.toFixed(2)}`);
        console.log(`Average Balance per User: $${(totalFinalBalance / allUsers.length).toFixed(2)}`);

    } catch (error) {
        console.error('❌ Error showing detailed balance breakdown:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

async function getDetailedBalanceBreakdown(userId, models) {
    try {
        const { Deposit, TaskSubmission, Task, WithdrawalRequest } = models;
        
        const userIdObj = new mongoose.Types.ObjectId(userId.toString());
        
        // Get all CONFIRMED deposits with details
        const deposits = await Deposit.find({ 
            userId: userId, 
            status: 'confirmed' 
        }).sort({ createdAt: 1 });
        
        // Calculate deposit contribution with $10 unlock fee logic
        let depositContribution = 0;
        let remainingUnlockFee = 10;
        let unlockFeePaid = 0;
        
        for (const deposit of deposits) {
            if (remainingUnlockFee > 0) {
                if (deposit.amount <= remainingUnlockFee) {
                    remainingUnlockFee -= deposit.amount;
                    unlockFeePaid += deposit.amount;
                } else {
                    const contribution = deposit.amount - remainingUnlockFee;
                    depositContribution += contribution;
                    unlockFeePaid += remainingUnlockFee;
                    remainingUnlockFee = 0;
                }
            } else {
                depositContribution += deposit.amount;
            }
        }
        
        // Get APPROVED task rewards with details
        const taskRewards = await TaskSubmission.aggregate([
            { $match: { userId: userIdObj, status: 'approved' } },
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $project: {
                reward: '$task.reward',
                title: '$task.title',
                submittedAt: '$submittedAt'
            }}
        ]);
        const totalTaskRewardAmount = taskRewards.reduce((sum, t) => sum + t.reward, 0);
        
        // Get CONFIRMED withdrawals with details
        const withdrawals = await WithdrawalRequest.find({
            userId: userId,
            status: { $in: ['completed', 'pending', 'processing'] }
        }).sort({ createdAt: 1 });
        const totalWithdrawnAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
        
        // Calculate final balance: deposits (after $10 unlock) + task rewards - withdrawals
        const finalBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
        
        return {
            totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
            depositContribution: depositContribution,
            unlockFeePaid: unlockFeePaid,
            depositDetails: deposits.map(d => ({
                amount: d.amount,
                status: d.status,
                createdAt: d.createdAt
            })),
            totalTaskRewards: totalTaskRewardAmount,
            taskDetails: taskRewards.map(t => ({
                reward: t.reward,
                title: t.title,
                submittedAt: t.submittedAt
            })),
            totalWithdrawn: totalWithdrawnAmount,
            withdrawalDetails: withdrawals.map(w => ({
                amount: w.amount,
                status: w.status,
                createdAt: w.createdAt
            })),
            calculatedBalance: finalBalance
        };
    } catch (error) {
        console.error('Error calculating detailed balance breakdown:', error);
        return { 
            totalDeposits: 0, 
            depositContribution: 0,
            unlockFeePaid: 0,
            depositDetails: [],
            totalTaskRewards: 0,
            taskDetails: [],
            totalWithdrawn: 0,
            withdrawalDetails: [],
            calculatedBalance: 0
        };
    }
}
