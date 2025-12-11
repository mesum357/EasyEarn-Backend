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
        testRealTaskApproval();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testRealTaskApproval() {
    try {
        console.log('🧪 Testing real task approval process for shahsahab@gmail.com');
        
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

        // Copy the new calculateUserBalance function from app.js
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
        
        if (!latestAdminAdjustment || latestAdminAdjustment.operation !== 'set') {
            console.error('❌ No admin set adjustment found for this user');
            return;
        }
        
        console.log(`\n💰 Latest Admin Adjustment:`);
        console.log(`   Operation: ${latestAdminAdjustment.operation}`);
        console.log(`   Amount: $${latestAdminAdjustment.amount}`);
        console.log(`   New Balance: $${latestAdminAdjustment.newBalance}`);
        console.log(`   Date: ${latestAdminAdjustment.createdAt}`);
        
        // Step 1: Check current balance before task approval
        console.log(`\n1️⃣ Checking current balance before task approval...`);
        const balanceBefore = await calculateUserBalance(testUser._id);
        console.log(`   Current Balance: $${balanceBefore.calculatedBalance}`);
        console.log(`   User Balance in DB: $${testUser.balance}`);
        
        // Step 2: Create a test task
        console.log(`\n2️⃣ Creating test task worth $20...`);
        const testTask = new Task({
            title: 'Real Task Approval Test',
            description: 'Testing real task approval process',
            reward: 20
        });
        await testTask.save();
        console.log(`   ✅ Test task created: $${testTask.reward} reward`);
        
        // Step 3: Create a pending task submission with proper timestamp
        console.log(`\n3️⃣ Creating pending task submission...`);
        const taskSubmission = new TaskSubmission({
            userId: testUser._id,
            taskId: testTask._id,
            status: 'pending',
            submittedAt: new Date(latestAdminAdjustment.createdAt.getTime() + 60000) // 1 minute after admin adjustment
        });
        await taskSubmission.save();
        console.log(`   ✅ Task submission created with status: pending`);
        console.log(`   Submitted at: ${taskSubmission.submittedAt}`);
        console.log(`   Admin adjustment at: ${latestAdminAdjustment.createdAt}`);
        
        // Step 4: Simulate the exact task approval process from the endpoint
        console.log(`\n4️⃣ Simulating task approval process...`);
        
        // This is the exact logic from the task approval endpoint
        const submission = await TaskSubmission.findById(taskSubmission._id)
            .populate('taskId')
            .populate('userId');
        
        if (!submission) {
            console.error('❌ Submission not found');
            return;
        }
        
        console.log(`   Task Reward: $${submission.taskId.reward}`);
        console.log(`   User: ${submission.userId.username}`);
        
        // Update submission status
        submission.status = 'approved';
        submission.reviewedAt = new Date();
        submission.reviewNotes = 'Test approval';
        
        // If approved, add reward to user's balance and recalculate properly
        if (submission.status === 'approved' && submission.userId && submission.taskId) {
            const user = await User.findById(submission.userId._id);
            if (user) {
                console.log(`✅ TASK APPROVED: Adding $${submission.taskId.reward} to user ${user.username} balance`);
                console.log(`   Previous balance: $${user.balance}`);
                
                // Use the enhanced calculateUserBalance function that integrates admin adjustments
                const balanceInfo = await calculateUserBalance(user._id);
                user.balance = balanceInfo.calculatedBalance;
                await user.save();
                
                console.log(`   Enhanced balance calculation:`, balanceInfo);
                console.log(`   New balance: $${user.balance}`);
            }
        }
        
        await submission.save();
        console.log(`   ✅ Task submission approved and saved`);
        
        // Step 5: Verify the results
        console.log(`\n5️⃣ Verification:`);
        
        // Re-fetch the user to get the updated balance
        const updatedUser = await User.findById(testUser._id);
        console.log(`   User Balance After Approval: $${updatedUser.balance}`);
        
        // Calculate expected balance
        const adminSetBalance = latestAdminAdjustment.newBalance;
        const expectedBalance = adminSetBalance + 20; // Admin set + new task reward
        console.log(`   Expected Balance: $${adminSetBalance} (admin set) + $20 (new task) = $${expectedBalance}`);
        
        const balanceMatch = Math.abs(updatedUser.balance - expectedBalance) < 0.01;
        console.log(`   Match: ${balanceMatch ? '✅ YES' : '❌ NO'}`);
        
        if (balanceMatch) {
            console.log(`\n🎉 SUCCESS: Task approval properly updated user balance!`);
            console.log(`   Task reward of $20 was added to admin-set balance of $${adminSetBalance}`);
            console.log(`   Final balance: $${updatedUser.balance}`);
        } else {
            console.log(`\n❌ FAILURE: Task approval did not properly update user balance.`);
            console.log(`   Expected: $${expectedBalance}, Got: $${updatedUser.balance}`);
        }
        
        // Step 6: Check if the task submission is properly recorded
        console.log(`\n6️⃣ Checking task submission status...`);
        const approvedSubmission = await TaskSubmission.findById(taskSubmission._id)
            .populate('taskId')
            .populate('userId');
        console.log(`   Submission Status: ${approvedSubmission.status}`);
        console.log(`   Reviewed At: ${approvedSubmission.reviewedAt}`);
        console.log(`   Review Notes: ${approvedSubmission.reviewNotes}`);
        
        // Cleanup test data
        console.log(`\n🧹 Cleaning up test data...`);
        await taskSubmission.deleteOne();
        await testTask.deleteOne();
        console.log(`   ✅ Test data cleaned up`);
        
        console.log('\n✅ Real task approval test completed!');
        
    } catch (error) {
        console.error('❌ Error testing real task approval:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
