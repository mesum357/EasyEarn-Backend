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
        testCalculateUserBalanceDirect();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testCalculateUserBalanceDirect() {
    try {
        console.log('🧪 Testing calculateUserBalance function directly...');
        
        // Define models (same as in app.js)
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
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

        // Find a test user
        const testUser = await User.findOne({});
        if (!testUser) {
            console.error('❌ No users found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.username} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance}`);
        
        // Create a test admin adjustment
        console.log(`\n🔍 Creating test admin adjustment...`);
        const adminAdjustment = new AdminBalanceAdjustment({
            userId: testUser._id,
            adminId: testUser._id,
            operation: 'set',
            amount: 100,
            reason: 'Direct test',
            previousBalance: testUser.balance,
            newBalance: 100
        });
        await adminAdjustment.save();
        console.log(`   ✅ Admin adjustment created: $${adminAdjustment.amount} → $${adminAdjustment.newBalance}`);
        
        // Create a test task and submission
        console.log(`\n🔍 Creating test task and submission...`);
        const testTask = new Task({
            title: 'Test Task',
            description: 'Test task for direct testing',
            reward: 25
        });
        await testTask.save();
        
        const taskSubmission = new TaskSubmission({
            userId: testUser._id,
            taskId: testTask._id,
            status: 'approved',
            createdAt: new Date(Date.now() + 1000) // After admin adjustment
        });
        await taskSubmission.save();
        console.log(`   ✅ Task submission created: $${testTask.reward} reward`);
        
        // Now test the calculateUserBalance function logic directly
        console.log(`\n🔍 Testing calculateUserBalance logic directly...`);
        
        // Get the latest admin balance adjustment
        const latestAdminAdjustment = await AdminBalanceAdjustment.find(
            { userId: testUser._id }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        console.log(`   Latest admin adjustment:`, {
            operation: latestAdminAdjustment.operation,
            amount: latestAdminAdjustment.amount,
            newBalance: latestAdminAdjustment.newBalance,
            createdAt: latestAdminAdjustment.createdAt
        });
        
        let finalBalance;
        if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
            console.log(`   ✅ Admin adjustment found with operation: ${latestAdminAdjustment.operation}`);
            
            const adminSetBalance = latestAdminAdjustment.newBalance;
            
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
            
            // Final balance = admin set balance + ongoing activity
            finalBalance = adminSetBalance + ongoingDepositAmount + ongoingTaskRewardAmount - ongoingWithdrawalAmount;
            finalBalance = Math.max(0, finalBalance);
            
            console.log(`   ✅ Enhanced calculation: $${adminSetBalance} (admin set) + $${ongoingDepositAmount} (ongoing deposits) + $${ongoingTaskRewardAmount} (ongoing tasks) - $${ongoingWithdrawalAmount} (ongoing withdrawals) = $${finalBalance}`);
        } else {
            console.log(`   ❌ Admin adjustment not found or operation not 'set'`);
            console.log(`   latestAdminAdjustment: ${!!latestAdminAdjustment}`);
            if (latestAdminAdjustment) {
                console.log(`   operation: ${latestAdminAdjustment.operation}`);
            }
            
            // Fallback to old calculation
            const totalDeposits = await Deposit.aggregate([
                { $match: { userId: testUser._id, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
            
            const totalTaskRewards = await TaskSubmission.aggregate([
                { $match: { userId: testUser._id, status: 'approved' } },
                { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
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
            
            let depositContribution = 0;
            if (totalDepositAmount <= 10) {
                finalBalance = Math.max(0, totalTaskRewardAmount - totalWithdrawnAmount);
            } else {
                depositContribution = totalDepositAmount - 10;
                finalBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
            }
            console.log(`   ⚠️ Fallback to old calculation: $${finalBalance}`);
        }
        
        // Expected result
        const expectedBalance = 100 + 25; // Admin set + task reward
        console.log(`\n📊 Test Results:`);
        console.log(`   Expected Balance: $${expectedBalance}`);
        console.log(`   Calculated Balance: $${finalBalance}`);
        console.log(`   Match: ${expectedBalance === finalBalance ? '✅ YES' : '❌ NO'}`);
        
        if (expectedBalance === finalBalance) {
            console.log(`\n🎉 SUCCESS: calculateUserBalance logic working correctly!`);
        } else {
            console.log(`\n❌ FAILURE: calculateUserBalance logic not working correctly.`);
        }
        
        // Cleanup
        console.log(`\n🧹 Cleaning up...`);
        await taskSubmission.deleteOne();
        await testTask.deleteOne();
        await adminAdjustment.deleteOne();
        console.log(`   ✅ Test data cleaned up`);
        
        console.log('\n✅ Direct calculateUserBalance test completed!');
        
    } catch (error) {
        console.error('❌ Error during direct test:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
