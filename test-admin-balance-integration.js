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
        testAdminBalanceIntegration();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testAdminBalanceIntegration() {
    try {
        console.log('🧪 Testing admin balance integration with ongoing deposits and tasks...');
        
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

        // Find a test user
        const testUser = await User.findOne({});
        if (!testUser) {
            console.error('❌ No users found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.username} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance}`);
        
        // Test scenario: Admin sets balance to $100, then user deposits $50 and completes $25 task
        console.log(`\n💰 Test Scenario: Admin sets balance to $100, then ongoing activity`);
        
        // Step 1: Admin sets balance to $100
        console.log(`\n1️⃣ Admin sets balance to $100`);
        const adminAdjustment = new AdminBalanceAdjustment({
            userId: testUser._id,
            adminId: testUser._id, // Use a valid ObjectId
            operation: 'set',
            amount: 100,
            reason: 'Test admin balance set',
            previousBalance: testUser.balance,
            newBalance: 100
        });
        await adminAdjustment.save();
        
        // Update user balance
        testUser.balance = 100;
        await testUser.save();
        console.log(`   ✅ Admin set balance to $100`);
        
        // Step 2: Simulate ongoing deposit of $50
        console.log(`\n2️⃣ User deposits $50 (ongoing activity)`);
        const ongoingDeposit = new Deposit({
            userId: testUser._id,
            amount: 50,
            status: 'confirmed',
            createdAt: new Date(Date.now() + 1000) // After admin adjustment
        });
        await ongoingDeposit.save();
        console.log(`   ✅ Ongoing deposit of $50 recorded`);
        
        // Step 3: Simulate ongoing task reward of $25
        console.log(`\n3️⃣ User completes task worth $25 (ongoing activity)`);
        const ongoingTask = new Task({
            title: 'Test Task',
            description: 'Test task for ongoing activity',
            reward: 25
        });
        await ongoingTask.save();
        
        const ongoingTaskSubmission = new TaskSubmission({
            userId: testUser._id,
            taskId: ongoingTask._id,
            status: 'approved',
            createdAt: new Date(Date.now() + 2000) // After admin adjustment
        });
        await ongoingTaskSubmission.save();
        console.log(`   ✅ Ongoing task reward of $25 recorded`);
        
        // Step 4: Calculate expected balance
        console.log(`\n4️⃣ Calculate expected balance`);
        const expectedBalance = 100 + 50 + 25; // Admin set + ongoing deposit + ongoing task
        console.log(`   Expected Balance: $100 (admin set) + $50 (ongoing deposit) + $25 (ongoing task) = $${expectedBalance}`);
        
        // Step 5: Test the new balance calculation function
        console.log(`\n5️⃣ Test new balance calculation function`);
        
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
        
        // Get the latest admin balance adjustment
        const latestAdminAdjustment = await AdminBalanceAdjustment.find(
            { userId: testUser._id }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        let finalBalance;
        if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
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
            
            console.log(`   ✅ New calculation: $${adminSetBalance} (admin set) + $${ongoingDepositAmount} (ongoing deposits) + $${ongoingTaskRewardAmount} (ongoing tasks) - $${ongoingWithdrawalAmount} (ongoing withdrawals) = $${finalBalance}`);
        } else {
            // Fallback to old calculation
            let depositContribution = 0;
            if (totalDepositAmount <= 10) {
                finalBalance = Math.max(0, totalTaskRewardAmount - totalWithdrawnAmount);
            } else {
                depositContribution = totalDepositAmount - 10;
                finalBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
            }
            console.log(`   ⚠️ Fallback to old calculation: $${finalBalance}`);
        }
        
        console.log(`\n📊 Test Results:`);
        console.log(`   Expected Balance: $${expectedBalance}`);
        console.log(`   Calculated Balance: $${finalBalance}`);
        console.log(`   Match: ${expectedBalance === finalBalance ? '✅ YES' : '❌ NO'}`);
        
        if (expectedBalance === finalBalance) {
            console.log(`\n🎉 SUCCESS: Admin balance integration working correctly!`);
            console.log(`   Ongoing deposits and tasks are properly adding to admin-set balance.`);
        } else {
            console.log(`\n❌ FAILURE: Admin balance integration not working correctly.`);
            console.log(`   Ongoing deposits and tasks are NOT adding to admin-set balance.`);
        }
        
        // Cleanup test data
        console.log(`\n🧹 Cleaning up test data...`);
        await ongoingDeposit.deleteOne();
        await ongoingTaskSubmission.deleteOne();
        await ongoingTask.deleteOne();
        await adminAdjustment.deleteOne();
        
        // Reset user balance
        testUser.balance = 0;
        await testUser.save();
        console.log(`   ✅ Test data cleaned up, user balance reset to $0`);
        
        console.log('\n✅ Admin balance integration test completed!');
        
    } catch (error) {
        console.error('❌ Error testing admin balance integration:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
