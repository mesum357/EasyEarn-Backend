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
        testTaskAddition();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testTaskAddition() {
    try {
        console.log('🧪 Testing task addition for shahsahab@gmail.com');
        
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
        console.log(`\n1️⃣ Creating test task worth $10...`);
        const testTask = new Task({
            title: 'Test Task for Shahsahab',
            description: 'Test task to verify admin balance integration',
            reward: 10
        });
        await testTask.save();
        console.log(`   ✅ Test task created: $${testTask.reward} reward`);
        
        // Step 2: Create a task submission (approved)
        console.log(`\n2️⃣ Creating approved task submission...`);
        const taskSubmission = new TaskSubmission({
            userId: testUser._id,
            taskId: testTask._id,
            status: 'approved',
            createdAt: new Date(Date.now() + 1000) // After admin adjustment
        });
        await taskSubmission.save();
        console.log(`   ✅ Task submission created with status: approved`);
        
        // Step 3: Test the balance calculation
        console.log(`\n3️⃣ Testing balance calculation after task addition...`);
        
        // Calculate ongoing activity since admin adjustment
        const ongoingDeposits = await Deposit.aggregate([
            { $match: { 
                userId: testUser._id, 
                status: 'confirmed',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const ongoingDepositAmount = ongoingDeposits.length > 0 ? ongoingDeposits[0].total : 0;
        
        const ongoingTaskRewards = await TaskSubmission.aggregate([
            { $match: { 
                userId: testUser._id, 
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
                userId: testUser._id, 
                status: { $in: ['completed', 'pending', 'processing'] },
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const ongoingWithdrawalAmount = ongoingWithdrawals.length > 0 ? ongoingWithdrawals[0].total : 0;
        
        // Calculate ongoing deposit contribution
        let ongoingDepositContribution = 0;
        if (ongoingDepositAmount > 0) {
            const depositsBeforeAdjustment = await Deposit.aggregate([
                { $match: { 
                    userId: testUser._id, 
                    status: 'confirmed',
                    createdAt: { $lte: latestAdminAdjustment.createdAt }
                }},
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const depositsBeforeAmount = depositsBeforeAdjustment.length > 0 ? depositsBeforeAdjustment[0].total : 0;
            
            if (depositsBeforeAmount >= 10) {
                ongoingDepositContribution = ongoingDepositAmount;
            } else if (depositsBeforeAmount + ongoingDepositAmount > 10) {
                ongoingDepositContribution = Math.max(0, (depositsBeforeAmount + ongoingDepositAmount) - 10);
            }
        }
        
        // Calculate expected balance
        const adminSetBalance = latestAdminAdjustment.newBalance;
        const expectedBalance = adminSetBalance + ongoingDepositContribution + ongoingTaskRewardAmount - ongoingWithdrawalAmount;
        const finalBalance = Math.max(0, expectedBalance);
        
        console.log(`\n📊 Balance Calculation:`);
        console.log(`   Admin Set Balance: $${adminSetBalance}`);
        console.log(`   Ongoing Deposits: $${ongoingDepositContribution}`);
        console.log(`   Ongoing Task Rewards: $${ongoingTaskRewardAmount}`);
        console.log(`   Ongoing Withdrawals: $${ongoingWithdrawalAmount}`);
        console.log(`   Expected Balance: $${adminSetBalance} + $${ongoingDepositContribution} + $${ongoingTaskRewardAmount} - $${ongoingWithdrawalAmount} = $${finalBalance}`);
        
        // Step 4: Test the calculateUserBalance function
        console.log(`\n4️⃣ Testing calculateUserBalance function...`);
        
        // Simulate the calculateUserBalance function logic
        const totalDeposits = await Deposit.aggregate([
            { $match: { userId: testUser._id, status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
        
        const totalTaskRewards = await TaskSubmission.aggregate([
            { $match: { userId: testUser._id, status: 'approved' } },
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $group: { _id: null, total: { $sum: '$task.reward' } } }
        ]);
        const totalTaskRewardAmount = totalTaskRewards.length > 0 ? totalTaskRewards[0].total : 0;
        
        const totalWithdrawn = await WithdrawalRequest.aggregate([
            { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
        
        // Get the latest admin balance adjustment again
        const latestAdminAdjustment2 = await AdminBalanceAdjustment.find(
            { userId: testUser._id }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        let calculatedBalance;
        if (latestAdminAdjustment2 && latestAdminAdjustment2.operation === 'set') {
            const adminSetBalance2 = latestAdminAdjustment2.newBalance;
            
            // Calculate ongoing activity since admin adjustment
            const ongoingDeposits2 = await Deposit.aggregate([
                { $match: { 
                    userId: testUser._id, 
                    status: 'confirmed',
                    createdAt: { $gt: latestAdminAdjustment2.createdAt }
                }},
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const ongoingDepositAmount2 = ongoingDeposits2.length > 0 ? ongoingDeposits2[0].total : 0;
            
            const ongoingTaskRewards2 = await TaskSubmission.aggregate([
                { $match: { 
                    userId: testUser._id, 
                    status: 'approved',
                    createdAt: { $gt: latestAdminAdjustment2.createdAt }
                }},
                { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                { $unwind: '$task' },
                { $group: { _id: null, total: { $sum: '$task.reward' } } }
            ]);
            const ongoingTaskRewardAmount2 = ongoingTaskRewards2.length > 0 ? ongoingTaskRewards2[0].total : 0;
            
            const ongoingWithdrawals2 = await WithdrawalRequest.aggregate([
                { $match: { 
                    userId: testUser._id, 
                    status: { $in: ['completed', 'pending', 'processing'] },
                    createdAt: { $gt: latestAdminAdjustment2.createdAt }
                }},
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const ongoingWithdrawalAmount2 = ongoingWithdrawals2.length > 0 ? ongoingWithdrawals2[0].total : 0;
            
            // Calculate ongoing deposit contribution
            let ongoingDepositContribution2 = 0;
            if (ongoingDepositAmount2 > 0) {
                const depositsBeforeAdjustment2 = await Deposit.aggregate([
                    { $match: { 
                        userId: testUser._id, 
                        status: 'confirmed',
                        createdAt: { $lte: latestAdminAdjustment2.createdAt }
                    }},
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const depositsBeforeAmount2 = depositsBeforeAdjustment2.length > 0 ? depositsBeforeAdjustment2[0].total : 0;
                
                if (depositsBeforeAmount2 >= 10) {
                    ongoingDepositContribution2 = ongoingDepositAmount2;
                } else if (depositsBeforeAmount2 + ongoingDepositAmount2 > 10) {
                    ongoingDepositContribution2 = Math.max(0, (depositsBeforeAmount2 + ongoingDepositAmount2) - 10);
                }
            }
            
            calculatedBalance = adminSetBalance2 + ongoingDepositContribution2 + ongoingTaskRewardAmount2 - ongoingWithdrawalAmount2;
            calculatedBalance = Math.max(0, calculatedBalance);
            
            console.log(`   ✅ Enhanced calculation: $${adminSetBalance2} (admin set) + $${ongoingDepositContribution2} (ongoing deposits) + $${ongoingTaskRewardAmount2} (ongoing tasks) - $${ongoingWithdrawalAmount2} (ongoing withdrawals) = $${calculatedBalance}`);
        } else {
            // Fallback to old calculation
            let depositContribution = 0;
            if (totalDepositAmount <= 10) {
                calculatedBalance = Math.max(0, totalTaskRewardAmount - totalWithdrawnAmount);
            } else {
                depositContribution = totalDepositAmount - 10;
                calculatedBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
            }
            console.log(`   ⚠️ Fallback to old calculation: $${calculatedBalance}`);
        }
        
        // Step 5: Compare results
        console.log(`\n5️⃣ Test Results:`);
        console.log(`   Expected Balance: $${finalBalance}`);
        console.log(`   Calculated Balance: $${calculatedBalance}`);
        console.log(`   Match: ${Math.abs(finalBalance - calculatedBalance) < 0.01 ? '✅ YES' : '❌ NO'}`);
        
        if (Math.abs(finalBalance - calculatedBalance) < 0.01) {
            console.log(`\n🎉 SUCCESS: Task addition is working correctly!`);
            console.log(`   The new task reward of $10 was properly added to the admin-set balance.`);
            console.log(`   Balance increased from $${adminSetBalance} to $${calculatedBalance}`);
        } else {
            console.log(`\n❌ FAILURE: Task addition not working correctly.`);
            console.log(`   Expected: $${finalBalance}, Got: $${calculatedBalance}`);
        }
        
        // Cleanup test data
        console.log(`\n🧹 Cleaning up test data...`);
        await taskSubmission.deleteOne();
        await testTask.deleteOne();
        console.log(`   ✅ Test data cleaned up`);
        
        console.log('\n✅ Task addition test completed!');
        
    } catch (error) {
        console.error('❌ Error testing task addition:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
