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
        testRealWorldScenario();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testRealWorldScenario() {
    try {
        console.log('🧪 Testing real-world task completion scenario for shahsahab@gmail.com');
        
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

        // Copy the calculateUserBalance function from app.js for testing (inside scope)
        async function calculateUserBalance(userId) {
            try {
                // Calculate balance: (total confirmed deposits - $10) + task rewards - total withdrawn (including pending/processing)
                const totalDeposits = await Deposit.aggregate([
                    { $match: { userId: userId, status: 'confirmed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
                
                // Get total task rewards
                const totalTaskRewards = await TaskSubmission.aggregate([
                    { $match: { userId: userId, status: 'approved' } },
                    { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                    { $unwind: '$task' },
                    { $group: { _id: null, total: { $sum: '$task.reward' } } }
                ]);
                const totalTaskRewardAmount = totalTaskRewards.length > 0 ? totalTaskRewards[0].total : 0;
                
                // Include pending and processing withdrawals in available balance calculation
                const totalWithdrawn = await WithdrawalRequest.aggregate([
                    { $match: { userId: userId, status: { $in: ['completed', 'pending', 'processing'] } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
                
                // Get the latest admin balance adjustment (if any)
                const latestAdminAdjustment = await AdminBalanceAdjustment.find(
                    { userId: userId }
                ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
                
                // Calculate base balance from deposits and tasks
                let baseBalance;
                let depositContribution = 0;
                
                if (totalDepositAmount <= 10) {
                    // For $10 or less deposits: base balance = task rewards - withdrawals (no deposit contribution)
                    baseBalance = Math.max(0, totalTaskRewardAmount - totalWithdrawnAmount);
                } else {
                    // For deposits > $10: base balance = (deposits - $10) + task rewards - withdrawals
                    depositContribution = totalDepositAmount - 10; // Only deposits beyond $10 count
                    baseBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
                }
                
                // If there's an admin adjustment, use it as the base and add ongoing deposits/tasks
                let finalBalance = baseBalance;
                let adminAdjustmentNote = '';
                
                if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
                    // Admin set a specific balance - use that as base and add ongoing activity
                    const adminSetBalance = latestAdminAdjustment.newBalance;
                    
                    // Calculate ongoing activity since admin adjustment
                    const ongoingDeposits = await Deposit.aggregate([
                        { $match: { 
                            userId: userId, 
                            status: 'confirmed',
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
                        }},
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ]);
                    const ongoingDepositAmount = ongoingDeposits.length > 0 ? ongoingDeposits[0].total : 0;
                    
                    const ongoingTaskRewards = await TaskSubmission.aggregate([
                        { $match: { 
                            userId: userId, 
                            status: 'approved',
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
                        }},
                        { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                        { $unwind: '$task' },
                        { $group: { _id: null, total: { $sum: '$task.reward' } } }
                    ]);
                    const ongoingTaskRewardAmount = ongoingTaskRewards.length > 0 ? ongoingTaskRewards[0].total : 0;
                    
                    const ongoingWithdrawals = await WithdrawalRequest.aggregate([
                        { $match: { 
                            userId: userId, 
                            status: { $in: ['completed', 'pending', 'processing'] },
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
                        }},
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ]);
                    const ongoingWithdrawalAmount = ongoingWithdrawals.length > 0 ? ongoingWithdrawals[0].total : 0;
                    
                    // Calculate ongoing deposit contribution
                    let ongoingDepositContribution = 0;
                    if (ongoingDepositAmount > 0) {
                        // Check if user had already deposited $10 before admin adjustment
                        const depositsBeforeAdjustment = await Deposit.aggregate([
                            { $match: { 
                                userId: userId, 
                                status: 'confirmed',
                                createdAt: { $lte: latestAdminAdjustment.createdAt }
                            }},
                            { $group: { _id: null, total: { $sum: '$amount' } } }
                        ]);
                        const depositsBeforeAmount = depositsBeforeAdjustment.length > 0 ? depositsBeforeAdjustment[0].total : 0;
                        
                        if (depositsBeforeAmount >= 10) {
                            // User already unlocked tasks, all ongoing deposits count
                            ongoingDepositContribution = ongoingDepositAmount;
                        } else if (depositsBeforeAmount + ongoingDepositAmount > 10) {
                            // Ongoing deposits unlock tasks and contribute to balance
                            ongoingDepositContribution = Math.max(0, (depositsBeforeAmount + ongoingDepositAmount) - 10);
                        }
                        // If still under $10, no deposit contribution
                    }
                    
                    // Final balance = admin set balance + ongoing activity
                    finalBalance = adminSetBalance + ongoingDepositContribution + ongoingTaskRewardAmount - ongoingWithdrawalAmount;
                    finalBalance = Math.max(0, finalBalance); // Ensure non-negative
                    
                    adminAdjustmentNote = `Admin set balance: $${adminSetBalance}, Ongoing: +$${ongoingDepositContribution} (deposits) + $${ongoingTaskRewardAmount} (tasks) - $${ongoingWithdrawalAmount} (withdrawals)`;
                }
                
                return {
                    totalDeposits: totalDepositAmount,
                    depositContribution: depositContribution,
                    totalTaskRewards: totalTaskRewardAmount,
                    totalWithdrawn: totalWithdrawnAmount,
                    calculatedBalance: finalBalance,
                    baseBalance: baseBalance,
                    adminAdjustmentNote: adminAdjustmentNote,
                    hasAdminAdjustment: !!latestAdminAdjustment
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
                    hasAdminAdjustment: false
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
        
        // Step 1: Create a test task
        console.log(`\n1️⃣ Creating test task worth $5...`);
        const testTask = new Task({
            title: 'Real World Test Task',
            description: 'Test task to simulate real-world scenario',
            reward: 5
        });
        await testTask.save();
        console.log(`   ✅ Test task created: $${testTask.reward} reward`);
        
        // Step 2: Create a pending task submission (simulating user submission)
        console.log(`\n2️⃣ Creating pending task submission (user submits task)...`);
        const taskSubmission = new TaskSubmission({
            userId: testUser._id,
            taskId: testTask._id,
            status: 'pending',
            createdAt: new Date(Date.now() + 1000) // After admin adjustment
        });
        await taskSubmission.save();
        console.log(`   ✅ Task submission created with status: pending`);
        
        // Step 3: Check balance before approval
        console.log(`\n3️⃣ Checking balance before task approval...`);
        const balanceBefore = await calculateUserBalance(testUser._id);
        console.log(`   Balance before approval: $${balanceBefore.calculatedBalance}`);
        
        // Step 4: Simulate admin approval (exactly like the real endpoint)
        console.log(`\n4️⃣ Simulating admin approval (like real endpoint)...`);
        
        // Update submission status to approved (like the real endpoint does)
        taskSubmission.status = 'approved';
        taskSubmission.reviewedAt = new Date();
        taskSubmission.reviewNotes = 'Test approval';
        await taskSubmission.save();
        
        // Now simulate the exact logic from the task approval endpoint
        if (taskSubmission.userId && taskSubmission.taskId) {
            const user = await User.findById(testUser._id);
            if (user) {
                console.log(`✅ TASK APPROVED: Adding $${testTask.reward} to user ${user.username} balance`);
                console.log(`   Previous balance: $${user.balance}`);
                
                // Use the enhanced calculateUserBalance function that integrates admin adjustments
                const balanceInfo = await calculateUserBalance(user._id);
                user.balance = balanceInfo.calculatedBalance;
                await user.save();
                
                console.log(`   Enhanced balance calculation:`, balanceInfo);
                console.log(`   New balance: $${user.balance}`);
            }
        }
        
        // Step 5: Check balance after approval
        console.log(`\n5️⃣ Checking balance after task approval...`);
        const balanceAfter = await calculateUserBalance(testUser._id);
        console.log(`   Balance after approval: $${balanceAfter.calculatedBalance}`);
        
        // Step 6: Verify the results
        console.log(`\n6️⃣ Verification:`);
        const expectedBalance = latestAdminAdjustment.newBalance + testTask.reward;
        console.log(`   Expected Balance: $${latestAdminAdjustment.newBalance} (admin set) + $${testTask.reward} (task) = $${expectedBalance}`);
        console.log(`   Actual Balance: $${balanceAfter.calculatedBalance}`);
        console.log(`   User Balance in DB: $${testUser.balance}`);
        
        const balanceMatch = Math.abs(balanceAfter.calculatedBalance - expectedBalance) < 0.01;
        const userBalanceMatch = Math.abs(testUser.balance - expectedBalance) < 0.01;
        
        console.log(`   Calculated Balance Match: ${balanceMatch ? '✅ YES' : '❌ NO'}`);
        console.log(`   User Balance Match: ${userBalanceMatch ? '✅ YES' : '❌ NO'}`);
        
        if (balanceMatch && userBalanceMatch) {
            console.log(`\n🎉 SUCCESS: Real-world scenario working correctly!`);
            console.log(`   Task approval properly added $${testTask.reward} to admin-set balance.`);
            console.log(`   Balance increased from $${latestAdminAdjustment.newBalance} to $${expectedBalance}`);
        } else {
            console.log(`\n❌ FAILURE: Real-world scenario not working correctly.`);
            if (!balanceMatch) {
                console.log(`   Calculated balance mismatch: Expected $${expectedBalance}, Got $${balanceAfter.calculatedBalance}`);
            }
            if (!userBalanceMatch) {
                console.log(`   User balance mismatch: Expected $${expectedBalance}, Got $${testUser.balance}`);
            }
        }
        
        // Cleanup test data
        console.log(`\n🧹 Cleaning up test data...`);
        await taskSubmission.deleteOne();
        await testTask.deleteOne();
        console.log(`   ✅ Test data cleaned up`);
        
        console.log('\n✅ Real-world scenario test completed!');
        
    } catch (error) {
        console.error('❌ Error testing real-world scenario:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
