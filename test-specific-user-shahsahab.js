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
        testSpecificUser();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testSpecificUser() {
    try {
        console.log('🧪 Testing specific user: shahsahab@gmail.com');
        
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
        console.log(`   Username: ${testUser.username}`);
        console.log(`   Current Balance: $${testUser.balance}`);
        console.log(`   Created At: ${testUser.createdAt}`);
        
        // Step 1: Check current deposits
        console.log(`\n1️⃣ Checking current deposits...`);
        const deposits = await Deposit.find({ userId: testUser._id, status: 'confirmed' }).sort({ createdAt: 1 });
        const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        console.log(`   Total confirmed deposits: $${totalDeposits}`);
        console.log(`   Deposit count: ${deposits.length}`);
        deposits.forEach((deposit, index) => {
            console.log(`     ${index + 1}. $${deposit.amount} - ${deposit.createdAt}`);
        });
        
        // Step 2: Check current task rewards
        console.log(`\n2️⃣ Checking current task rewards...`);
        const taskSubmissions = await TaskSubmission.find({ userId: testUser._id, status: 'approved' }).populate('taskId');
        const totalTaskRewards = taskSubmissions.reduce((sum, submission) => sum + (submission.taskId?.reward || 0), 0);
        console.log(`   Total task rewards: $${totalTaskRewards}`);
        console.log(`   Approved task count: ${taskSubmissions.length}`);
        taskSubmissions.forEach((submission, index) => {
            console.log(`     ${index + 1}. $${submission.taskId?.reward || 0} - ${submission.createdAt}`);
        });
        
        // Step 3: Check withdrawals
        console.log(`\n3️⃣ Checking withdrawals...`);
        const withdrawals = await WithdrawalRequest.find({ 
            userId: testUser._id, 
            status: { $in: ['completed', 'pending', 'processing'] } 
        }).sort({ createdAt: 1 });
        const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
        console.log(`   Total withdrawals: $${totalWithdrawals}`);
        console.log(`   Withdrawal count: ${withdrawals.length}`);
        withdrawals.forEach((withdrawal, index) => {
            console.log(`     ${index + 1}. $${withdrawal.amount} (${withdrawal.status}) - ${withdrawal.createdAt}`);
        });
        
        // Step 4: Check admin balance adjustments
        console.log(`\n4️⃣ Checking admin balance adjustments...`);
        const adminAdjustments = await AdminBalanceAdjustment.find({ userId: testUser._id }).sort({ createdAt: 1 });
        console.log(`   Admin adjustment count: ${adminAdjustments.length}`);
        adminAdjustments.forEach((adjustment, index) => {
            console.log(`     ${index + 1}. ${adjustment.operation} $${adjustment.amount} → $${adjustment.newBalance} - ${adjustment.createdAt}`);
        });
        
        // Step 5: Test the calculateUserBalance function logic
        console.log(`\n5️⃣ Testing calculateUserBalance logic...`);
        
        // Get the latest admin balance adjustment
        const latestAdminAdjustment = await AdminBalanceAdjustment.find(
            { userId: testUser._id }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        let finalBalance;
        let calculationMethod = '';
        
        if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
            console.log(`   ✅ Found admin adjustment: ${latestAdminAdjustment.operation} $${latestAdminAdjustment.amount} → $${latestAdminAdjustment.newBalance}`);
            
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
            
            // Calculate ongoing deposit contribution
            let ongoingDepositContribution = 0;
            if (ongoingDepositAmount > 0) {
                // Check if user had already deposited $10 before admin adjustment
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
            
            // Final balance = admin set balance + ongoing activity
            finalBalance = adminSetBalance + ongoingDepositContribution + ongoingTaskRewardAmount - ongoingWithdrawalAmount;
            finalBalance = Math.max(0, finalBalance);
            
            calculationMethod = 'Admin Integration';
            console.log(`   ✅ Enhanced calculation: $${adminSetBalance} (admin set) + $${ongoingDepositContribution} (ongoing deposits) + $${ongoingTaskRewardAmount} (ongoing tasks) - $${ongoingWithdrawalAmount} (ongoing withdrawals) = $${finalBalance}`);
        } else {
            console.log(`   ⚠️ No admin adjustment found, using standard calculation`);
            
            // Standard calculation
            let depositContribution = 0;
            if (totalDeposits <= 10) {
                finalBalance = Math.max(0, totalTaskRewards - totalWithdrawals);
            } else {
                depositContribution = totalDeposits - 10;
                finalBalance = Math.max(0, depositContribution + totalTaskRewards - totalWithdrawals);
            }
            
            calculationMethod = 'Standard';
            console.log(`   ⚠️ Standard calculation: $${depositContribution} (deposits) + $${totalTaskRewards} (tasks) - $${totalWithdrawals} (withdrawals) = $${finalBalance}`);
        }
        
        // Step 6: Compare with current balance
        console.log(`\n6️⃣ Balance Comparison:`);
        console.log(`   Current Balance in DB: $${testUser.balance}`);
        console.log(`   Calculated Balance: $${finalBalance}`);
        console.log(`   Calculation Method: ${calculationMethod}`);
        console.log(`   Match: ${Math.abs(testUser.balance - finalBalance) < 0.01 ? '✅ YES' : '❌ NO'}`);
        
        if (Math.abs(testUser.balance - finalBalance) >= 0.01) {
            console.log(`\n❌ ISSUE DETECTED: Balance mismatch!`);
            console.log(`   The user's balance should be $${finalBalance} but is currently $${testUser.balance}`);
            console.log(`   This indicates the admin balance integration may not be working correctly.`);
        } else {
            console.log(`\n✅ SUCCESS: Balance calculation is correct!`);
        }
        
        console.log('\n✅ Specific user test completed!');
        
    } catch (error) {
        console.error('❌ Error testing specific user:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
