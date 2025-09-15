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
        debugWithdrawalBalanceIssue();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function debugWithdrawalBalanceIssue() {
    try {
        console.log('🔍 Debugging withdrawal balance issue...');
        
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

        // Find users with balance issues
        const users = await User.find({}).limit(5);
        
        for (const user of users) {
            console.log(`\n👤 User: ${user.username} (${user._id})`);
            console.log(`   Current balance in database: $${user.balance}`);
            
            // Calculate what the balance should be
            const totalDeposits = await Deposit.aggregate([
                { $match: { userId: user._id, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
            
            const totalTaskRewards = await TaskSubmission.aggregate([
                { $match: { userId: user._id, status: 'approved' } },
                { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                { $unwind: '$task' },
                { $group: { _id: null, total: { $sum: '$task.reward' } } }
            ]);
            const totalTaskRewardAmount = totalTaskRewards.length > 0 ? totalTaskRewards[0].total : 0;
            
            const totalWithdrawn = await WithdrawalRequest.aggregate([
                { $match: { userId: user._id, status: { $in: ['completed', 'pending', 'processing'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
            
            const depositContribution = Math.max(0, totalDepositAmount - 10);
            const calculatedBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
            
            console.log(`   Total deposits: $${totalDepositAmount}`);
            console.log(`   Deposit contribution (after $10 deduction): $${depositContribution}`);
            console.log(`   Total task rewards: $${totalTaskRewardAmount}`);
            console.log(`   Total withdrawn (including pending): $${totalWithdrawnAmount}`);
            console.log(`   Calculated balance: $${calculatedBalance}`);
            console.log(`   Balance difference: $${calculatedBalance - user.balance}`);
            
            // Test withdrawal scenarios
            const testAmounts = [1, 5, 10, 15, 20];
            for (const amount of testAmounts) {
                const canWithdraw = calculatedBalance >= amount;
                const currentBalanceCheck = user.balance >= amount;
                console.log(`   Can withdraw $${amount}: ${canWithdraw} (calculated) / ${currentBalanceCheck} (current balance)`);
            }
            
            // Check if there are pending withdrawals that might be causing issues
            const pendingWithdrawals = await WithdrawalRequest.find({
                userId: user._id,
                status: { $in: ['pending', 'processing'] }
            });
            
            if (pendingWithdrawals.length > 0) {
                console.log(`   ⚠️  Pending withdrawals: ${pendingWithdrawals.length}`);
                for (const withdrawal of pendingWithdrawals) {
                    console.log(`      - $${withdrawal.amount} (${withdrawal.status}) - ${withdrawal.createdAt.toDateString()}`);
                }
            }
        }

        console.log('\n✅ Withdrawal balance debug completed!');
        
    } catch (error) {
        console.error('❌ Error debugging withdrawal balance issue:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
