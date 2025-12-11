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
        fixAllUserBalances();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function fixAllUserBalances() {
    try {
        console.log('🔧 Fixing all user balances with new logic...');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
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
            submittedAt: { type: Date, default: Date.now },
            createdAt: { type: Date, default: Date.now }
        });
        const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

        const taskSchema = new mongoose.Schema({
            title: String,
            description: String,
            reward: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }
        });
        const Task = mongoose.model('Task', taskSchema);

        const withdrawalRequestSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            walletAddress: { type: String, required: true },
            status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
            processedAt: Date,
            notes: String,
            createdAt: { type: Date, default: Date.now }
        });
        const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

        const adminBalanceAdjustmentSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            operation: { type: String, enum: ['set', 'add'], required: true },
            amount: { type: Number, required: true },
            reason: { type: String, default: 'Admin adjustment' },
            previousBalance: { type: Number, required: true },
            newBalance: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }
        });
        const AdminBalanceAdjustment = mongoose.model('AdminBalanceAdjustment', adminBalanceAdjustmentSchema);

        // Get all users
        const allUsers = await User.find({});
        console.log(`📊 Found ${allUsers.length} users to process`);
        
        let processedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        
        const results = [];
        
        for (const user of allUsers) {
            try {
                console.log(`\n👤 Processing user: ${user.email || user.username} (${user._id})`);
                console.log(`   Current balance: $${user.balance}`);
                
                // Calculate new balance using the new logic
                const balanceInfo = await calculateUserBalance(user._id);
                
                console.log(`   New calculated balance: $${balanceInfo.calculatedBalance}`);
                console.log(`   Breakdown:`);
                console.log(`     - Total deposits: $${balanceInfo.totalDeposits}`);
                console.log(`     - Unlock fee paid: $${balanceInfo.unlockFeePaid}`);
                console.log(`     - Deposit contribution: $${balanceInfo.depositContribution}`);
                console.log(`     - Task rewards: $${balanceInfo.totalTaskRewards}`);
                console.log(`     - Withdrawals: $${balanceInfo.totalWithdrawn}`);
                
                if (balanceInfo.hasAdminAdjustment) {
                    console.log(`     - Admin adjustment: ${balanceInfo.adminAdjustmentNote}`);
                }
                
                // Check if balance needs updating
                const balanceDifference = Math.abs(user.balance - balanceInfo.calculatedBalance);
                const needsUpdate = balanceDifference > 0.01; // Allow for small floating point differences
                
                if (needsUpdate) {
                    const oldBalance = user.balance;
                    user.balance = balanceInfo.calculatedBalance;
                    await user.save();
                    
                    console.log(`   ✅ Balance updated: $${oldBalance} → $${user.balance}`);
                    updatedCount++;
                    
                    results.push({
                        userId: user._id,
                        email: user.email || user.username,
                        oldBalance: oldBalance,
                        newBalance: user.balance,
                        difference: user.balance - oldBalance,
                        balanceInfo: balanceInfo
                    });
                } else {
                    console.log(`   ✅ Balance already correct: $${user.balance}`);
                }
                
                processedCount++;
                
            } catch (error) {
                console.error(`   ❌ Error processing user ${user.email || user.username}:`, error.message);
                errorCount++;
            }
        }
        
        // Summary
        console.log(`\n📋 SUMMARY:`);
        console.log(`   Total users processed: ${processedCount}`);
        console.log(`   Users updated: ${updatedCount}`);
        console.log(`   Users with errors: ${errorCount}`);
        console.log(`   Users unchanged: ${processedCount - updatedCount - errorCount}`);
        
        // Show detailed results for updated users
        if (results.length > 0) {
            console.log(`\n📊 DETAILED RESULTS FOR UPDATED USERS:`);
            results.forEach((result, index) => {
                console.log(`\n${index + 1}. ${result.email}:`);
                console.log(`   Old Balance: $${result.oldBalance}`);
                console.log(`   New Balance: $${result.newBalance}`);
                console.log(`   Difference: $${result.difference > 0 ? '+' : ''}${result.difference}`);
                console.log(`   Total Deposits: $${result.balanceInfo.totalDeposits}`);
                console.log(`   Deposit Contribution: $${result.balanceInfo.depositContribution}`);
                console.log(`   Task Rewards: $${result.balanceInfo.totalTaskRewards}`);
                console.log(`   Withdrawals: $${result.balanceInfo.totalWithdrawn}`);
            });
        }
        
        console.log('\n✅ All user balances have been fixed!');
        
    } catch (error) {
        console.error('❌ Error fixing user balances:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Calculate user balance with new logic
async function calculateUserBalance(userId) {
    try {
        // Convert userId to ObjectId for aggregation queries
        const userIdObj = new mongoose.Types.ObjectId(userId.toString());
        
        // Get all confirmed deposits sorted by creation date
        const deposits = await Deposit.find({ 
            userId: userId, 
            status: 'confirmed' 
        }).sort({ createdAt: 1 });
        
        // Calculate deposit contribution with $10 unlock fee logic
        let depositContribution = 0;
        let remainingUnlockFee = 10; // $10 unlock fee
        
        for (const deposit of deposits) {
            if (remainingUnlockFee > 0) {
                // Apply deposit to unlock fee first
                if (deposit.amount <= remainingUnlockFee) {
                    remainingUnlockFee -= deposit.amount;
                    // This deposit goes entirely to unlock fee, no contribution to balance
                } else {
                    // Deposit exceeds remaining unlock fee
                    depositContribution += deposit.amount - remainingUnlockFee;
                    remainingUnlockFee = 0;
                }
            } else {
                // Unlock fee already paid, all deposits contribute to balance
                depositContribution += deposit.amount;
            }
        }
        
        // Get total task rewards with proper ObjectId conversion
        const totalTaskRewards = await TaskSubmission.aggregate([
            { $match: { userId: userIdObj, status: 'approved' } },
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $group: { _id: null, total: { $sum: '$task.reward' } } }
        ]);
        const totalTaskRewardAmount = totalTaskRewards.length > 0 ? totalTaskRewards[0].total : 0;
        
        // Get total withdrawals (including pending/processing)
        const totalWithdrawn = await WithdrawalRequest.aggregate([
            { $match: { userId: userIdObj, status: { $in: ['completed', 'pending', 'processing'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
        
        // Get the latest admin balance adjustment (if any)
        const latestAdminAdjustment = await AdminBalanceAdjustment.find(
            { userId: userId }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        // Calculate base balance: deposits (after $10 unlock) + task rewards - withdrawals
        let baseBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
        let finalBalance = baseBalance;
        let adminAdjustmentNote = '';
        
        // If there's an admin adjustment, use it as the base and add ongoing activity
        if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
            const adminSetBalance = latestAdminAdjustment.newBalance;
            
            // Calculate ongoing deposits since admin adjustment
            const ongoingDeposits = await Deposit.aggregate([
                { $match: { 
                    userId: userIdObj, 
                    status: 'confirmed'
                }},
                { $addFields: {
                    createdAtDate: { $toDate: '$createdAt' }
                }},
                { $match: { 
                    createdAtDate: { $gt: latestAdminAdjustment.createdAt }
                }},
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const ongoingDepositAmount = ongoingDeposits.length > 0 ? ongoingDeposits[0].total : 0;
            
            // Calculate ongoing task rewards since admin adjustment
            const ongoingTaskRewards = await TaskSubmission.aggregate([
                { $match: { 
                    userId: userIdObj, 
                    status: 'approved'
                }},
                { $addFields: {
                    submittedAtDate: { $toDate: '$submittedAt' }
                }},
                { $match: { 
                    submittedAtDate: { $gt: latestAdminAdjustment.createdAt }
                }},
                { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                { $unwind: '$task' },
                { $group: { _id: null, total: { $sum: '$task.reward' } } }
            ]);
            const ongoingTaskRewardAmount = ongoingTaskRewards.length > 0 ? ongoingTaskRewards[0].total : 0;
            
            // Calculate ongoing withdrawals since admin adjustment
            const ongoingWithdrawals = await WithdrawalRequest.aggregate([
                { $match: { 
                    userId: userIdObj, 
                    status: { $in: ['completed', 'pending', 'processing'] }
                }},
                { $addFields: {
                    createdAtDate: { $toDate: '$createdAt' }
                }},
                { $match: { 
                    createdAtDate: { $gt: latestAdminAdjustment.createdAt }
                }},
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const ongoingWithdrawalAmount = ongoingWithdrawals.length > 0 ? ongoingWithdrawals[0].total : 0;
            
            // Calculate ongoing deposit contribution (considering unlock fee)
            let ongoingDepositContribution = 0;
            if (ongoingDepositAmount > 0) {
                // Check if user had already unlocked tasks before admin adjustment
                const depositsBeforeAdjustment = await Deposit.find({ 
                    userId: userId, 
                    status: 'confirmed',
                    createdAt: { $lte: latestAdminAdjustment.createdAt }
                }).sort({ createdAt: 1 });
                
                let unlockFeePaid = 0;
                for (const deposit of depositsBeforeAdjustment) {
                    if (unlockFeePaid < 10) {
                        unlockFeePaid += deposit.amount;
                    }
                }
                
                if (unlockFeePaid >= 10) {
                    // User already unlocked tasks, all ongoing deposits count
                    ongoingDepositContribution = ongoingDepositAmount;
                } else {
                    // Calculate how much of ongoing deposits goes to unlock fee
                    const remainingUnlockFee = 10 - unlockFeePaid;
                    if (ongoingDepositAmount > remainingUnlockFee) {
                        ongoingDepositContribution = ongoingDepositAmount - remainingUnlockFee;
                    }
                    // If ongoing deposits don't exceed remaining unlock fee, no contribution
                }
            }
            
            // Final balance = admin set balance + ongoing deposits + ongoing tasks - ongoing withdrawals
            finalBalance = adminSetBalance + ongoingDepositContribution + ongoingTaskRewardAmount - ongoingWithdrawalAmount;
            finalBalance = Math.max(0, finalBalance); // Ensure non-negative
            
            adminAdjustmentNote = `Admin set balance: $${adminSetBalance}, Ongoing: +$${ongoingDepositContribution} (deposits) + $${ongoingTaskRewardAmount} (tasks) - $${ongoingWithdrawalAmount} (withdrawals)`;
        }
        
        return {
            totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
            depositContribution: depositContribution,
            totalTaskRewards: totalTaskRewardAmount,
            totalWithdrawn: totalWithdrawnAmount,
            calculatedBalance: finalBalance,
            baseBalance: baseBalance,
            adminAdjustmentNote: adminAdjustmentNote,
            hasAdminAdjustment: !!latestAdminAdjustment,
            unlockFeePaid: Math.min(10, deposits.reduce((sum, d) => sum + d.amount, 0))
        };
    } catch (error) {
        console.error('Error calculating user balance:', error);
        return { 
            totalDeposits: 0, 
            depositContribution: 0, 
            totalTaskRewards: 0, 
            totalWithdrawn: 0, 
            calculatedBalance: 0,
            baseBalance: 0,
            adminAdjustmentNote: '',
            hasAdminAdjustment: false,
            unlockFeePaid: 0
        };
    }
}
