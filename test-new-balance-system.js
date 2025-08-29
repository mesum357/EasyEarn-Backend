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
        testNewBalanceSystem();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testNewBalanceSystem() {
    try {
        console.log('🧪 Testing new balance system for shahsahab@gmail.com');
        
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

        // Copy the new calculateUserBalance function
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
                            status: 'confirmed',
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
                        }},
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ]);
                    const ongoingDepositAmount = ongoingDeposits.length > 0 ? ongoingDeposits[0].total : 0;
                    
                    // Calculate ongoing task rewards since admin adjustment
                    const ongoingTaskRewards = await TaskSubmission.aggregate([
                        { $match: { 
                            userId: userIdObj, 
                            status: 'approved',
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
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
                            status: { $in: ['completed', 'pending', 'processing'] },
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
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

        // Find the specific user
        const testUser = await User.findOne({ email: 'shahsahab@gmail.com' });
        if (!testUser) {
            console.error('❌ User shahsahab@gmail.com not found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.email} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance}`);
        
        // Get the latest admin adjustment
        const latestAdminAdjustment = await AdminBalanceAdjustment.find(
            { userId: testUser._id }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        console.log(`\n💰 Latest Admin Adjustment:`);
        if (latestAdminAdjustment) {
            console.log(`   Operation: ${latestAdminAdjustment.operation}`);
            console.log(`   Amount: $${latestAdminAdjustment.amount}`);
            console.log(`   New Balance: $${latestAdminAdjustment.newBalance}`);
            console.log(`   Date: ${latestAdminAdjustment.createdAt}`);
        } else {
            console.log(`   No admin adjustments found`);
        }
        
        // Step 1: Test the new balance calculation
        console.log(`\n1️⃣ Testing new balance calculation...`);
        const balanceInfo = await calculateUserBalance(testUser._id);
        
        console.log(`   Balance Info:`);
        console.log(`     Total Deposits: $${balanceInfo.totalDeposits}`);
        console.log(`     Unlock Fee Paid: $${balanceInfo.unlockFeePaid}`);
        console.log(`     Deposit Contribution: $${balanceInfo.depositContribution}`);
        console.log(`     Total Task Rewards: $${balanceInfo.totalTaskRewards}`);
        console.log(`     Total Withdrawn: $${balanceInfo.totalWithdrawn}`);
        console.log(`     Base Balance: $${balanceInfo.baseBalance}`);
        console.log(`     Has Admin Adjustment: ${balanceInfo.hasAdminAdjustment}`);
        console.log(`     Admin Adjustment Note: ${balanceInfo.adminAdjustmentNote}`);
        console.log(`     Calculated Balance: $${balanceInfo.calculatedBalance}`);
        
        // Step 2: Test ongoing activity after admin adjustment
        if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
            console.log(`\n2️⃣ Testing ongoing activity after admin adjustment...`);
            
            // Create a test task
            const testTask = new Task({
                title: 'Test Task for New Balance System',
                description: 'Testing ongoing activity after admin adjustment',
                reward: 25
            });
            await testTask.save();
            
            // Create a task submission after admin adjustment
            const taskSubmission = new TaskSubmission({
                userId: testUser._id,
                taskId: testTask._id,
                status: 'approved',
                createdAt: new Date(latestAdminAdjustment.createdAt.getTime() + 60000) // 1 minute after
            });
            await taskSubmission.save();
            
            // Calculate balance after new task
            const balanceAfterTask = await calculateUserBalance(testUser._id);
            console.log(`   Balance after new task: $${balanceAfterTask.calculatedBalance}`);
            
            // Expected balance: admin set + new task reward
            const expectedBalance = latestAdminAdjustment.newBalance + 25;
            console.log(`   Expected balance: $${expectedBalance}`);
            
            const balanceMatch = Math.abs(balanceAfterTask.calculatedBalance - expectedBalance) < 0.01;
            console.log(`   Match: ${balanceMatch ? '✅ YES' : '❌ NO'}`);
            
            if (balanceMatch) {
                console.log(`   🎉 SUCCESS: New task properly added to admin-set balance!`);
            } else {
                console.log(`   ❌ FAILURE: New task not properly added to admin-set balance.`);
            }
            
            // Cleanup test data
            await taskSubmission.deleteOne();
            await testTask.deleteOne();
        }
        
        // Step 3: Test deposit unlock fee logic
        console.log(`\n3️⃣ Testing deposit unlock fee logic...`);
        
        // Get all deposits for this user
        const allDeposits = await Deposit.find({ 
            userId: testUser._id, 
            status: 'confirmed' 
        }).sort({ createdAt: 1 });
        
        console.log(`   All deposits:`);
        allDeposits.forEach((deposit, index) => {
            console.log(`     ${index + 1}. $${deposit.amount} - ${deposit.createdAt}`);
        });
        
        // Manually calculate unlock fee logic
        let remainingUnlockFee = 10;
        let depositContribution = 0;
        
        for (const deposit of allDeposits) {
            if (remainingUnlockFee > 0) {
                if (deposit.amount <= remainingUnlockFee) {
                    remainingUnlockFee -= deposit.amount;
                    console.log(`     $${deposit.amount} → Unlock Fee (remaining: $${remainingUnlockFee})`);
                } else {
                    const toUnlockFee = remainingUnlockFee;
                    const toBalance = deposit.amount - remainingUnlockFee;
                    depositContribution += toBalance;
                    remainingUnlockFee = 0;
                    console.log(`     $${deposit.amount} → $${toUnlockFee} Unlock Fee + $${toBalance} Balance`);
                }
            } else {
                depositContribution += deposit.amount;
                console.log(`     $${deposit.amount} → Balance (unlock fee already paid)`);
            }
        }
        
        console.log(`   Manual calculation:`);
        console.log(`     Deposit Contribution: $${depositContribution}`);
        console.log(`     Unlock Fee Paid: $${10 - remainingUnlockFee}`);
        console.log(`     System calculation: $${balanceInfo.depositContribution}`);
        
        const depositMatch = Math.abs(depositContribution - balanceInfo.depositContribution) < 0.01;
        console.log(`   Deposit calculation match: ${depositMatch ? '✅ YES' : '❌ NO'}`);
        
        console.log('\n✅ New balance system test completed!');
        
    } catch (error) {
        console.error('❌ Error testing new balance system:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
