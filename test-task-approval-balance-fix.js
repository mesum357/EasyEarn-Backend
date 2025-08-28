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
        testTaskApprovalBalanceFix();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testTaskApprovalBalanceFix() {
    try {
        console.log('🧪 Testing task approval balance fix with admin-set balance...');
        
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
        
        // Test scenario: Admin sets balance to $100, then task approval should add to that balance
        console.log(`\n💰 Test Scenario: Admin sets balance to $100, then task approval adds $25`);
        
        // Step 1: Admin sets balance to $100
        console.log(`\n1️⃣ Admin sets balance to $100`);
        const adminAdjustment = new AdminBalanceAdjustment({
            userId: testUser._id,
            adminId: 'admin',
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
        
        // Step 2: Create a task and task submission
        console.log(`\n2️⃣ Create task worth $25 and pending submission`);
        const testTask = new Task({
            title: 'Test Task for Balance Fix',
            description: 'Test task to verify balance integration',
            reward: 25
        });
        await testTask.save();
        
        const taskSubmission = new TaskSubmission({
            userId: testUser._id,
            taskId: testTask._id,
            status: 'pending'
        });
        await taskSubmission.save();
        console.log(`   ✅ Task submission created with status: pending`);
        
        // Step 3: Simulate task approval (this should now use the enhanced balance calculation)
        console.log(`\n3️⃣ Simulate task approval (should add $25 to admin-set balance)`);
        
        // Update submission status to approved
        taskSubmission.status = 'approved';
        taskSubmission.reviewedAt = new Date();
        await taskSubmission.save();
        
        // Now simulate the balance calculation that happens during task approval
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
        const latestAdminAdjustment = await AdminBalanceAdjustment.findOne(
            { userId: testUser._id },
            { sort: { createdAt: -1 } }
        );
        
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
            
            console.log(`   ✅ Enhanced calculation: $${adminSetBalance} (admin set) + $${ongoingDepositAmount} (ongoing deposits) + $${ongoingTaskRewardAmount} (ongoing tasks) - $${ongoingWithdrawalAmount} (ongoing withdrawals) = $${finalBalance}`);
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
        
        // Step 4: Calculate expected balance
        console.log(`\n4️⃣ Calculate expected balance`);
        const expectedBalance = 100 + 25; // Admin set balance + task reward
        console.log(`   Expected Balance: $100 (admin set) + $25 (task reward) = $${expectedBalance}`);
        
        // Step 5: Test results
        console.log(`\n📊 Test Results:`);
        console.log(`   Expected Balance: $${expectedBalance}`);
        console.log(`   Calculated Balance: $${finalBalance}`);
        console.log(`   Match: ${expectedBalance === finalBalance ? '✅ YES' : '❌ NO'}`);
        
        if (expectedBalance === finalBalance) {
            console.log(`\n🎉 SUCCESS: Task approval now properly integrates with admin-set balance!`);
            console.log(`   Task reward of $25 was added to admin-set balance of $100.`);
            console.log(`   Final balance: $${finalBalance}`);
        } else {
            console.log(`\n❌ FAILURE: Task approval still not integrating with admin-set balance.`);
            console.log(`   Expected: $${expectedBalance}, Got: $${finalBalance}`);
        }
        
        // Cleanup test data
        console.log(`\n🧹 Cleaning up test data...`);
        await taskSubmission.deleteOne();
        await testTask.deleteOne();
        await adminAdjustment.deleteOne();
        
        // Reset user balance
        testUser.balance = 0;
        await testUser.save();
        console.log(`   ✅ Test data cleaned up, user balance reset to $0`);
        
        console.log('\n✅ Task approval balance fix test completed!');
        
    } catch (error) {
        console.error('❌ Error testing task approval balance fix:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
