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
        testBalanceLogic();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testBalanceLogic() {
    try {
        console.log('🧪 Testing new balance logic...');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        const depositSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const Deposit = mongoose.model('Deposit', depositSchema);

        const withdrawalRequestSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

        const taskSchema = new mongoose.Schema({
            title: { type: String, required: true },
            reward: { type: Number, required: true }
        });
        const Task = mongoose.model('Task', taskSchema);

        const taskSubmissionSchema = new mongoose.Schema({
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
        });
        const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

        // Test scenarios
        console.log('\n📋 Testing Balance Calculation Scenarios:');
        
        // Scenario 1: User with $10 deposit (should unlock tasks, balance = $0)
        console.log('\n1️⃣ Scenario 1: User with $10 deposit');
        const user1 = await User.findOne({ email: 'test@example.com' });
        if (user1) {
            const balance1 = await calculateBalance(user1._id, Deposit, WithdrawalRequest, TaskSubmission);
            console.log(`   User: ${user1.email}`);
            console.log(`   Balance: $${balance1.calculatedBalance}`);
            console.log(`   Has Deposited: ${user1.hasDeposited}`);
            console.log(`   Expected: $0 (first $10 unlocks tasks only)`);
        }

        // Scenario 2: User with $20 deposits + task rewards
        console.log('\n2️⃣ Scenario 2: User with $20 deposits + task rewards');
        const user2 = await User.findOne({ email: 'play1@gmail.com' });
        if (user2) {
            const balance2 = await calculateBalance(user2._id, Deposit, WithdrawalRequest, TaskSubmission);
            console.log(`   User: ${user2.email}`);
            console.log(`   Balance: $${balance2.calculatedBalance}`);
            console.log(`   Deposits: $${balance2.totalDeposits}`);
            console.log(`   Task Rewards: $${balance2.totalTaskRewards}`);
            console.log(`   Withdrawals: $${balance2.totalWithdrawn}`);
            console.log(`   Expected: $10.83 ((20-10) + 0.83 - 0)`);
        }

        // Scenario 3: User with $30 deposits
        console.log('\n3️⃣ Scenario 3: User with $30 deposits');
        const user3 = await User.findOne({ email: 'hunter11@gmail.com' });
        if (user3) {
            const balance3 = await calculateBalance(user3._id, Deposit, WithdrawalRequest, TaskSubmission);
            console.log(`   User: ${user3.email}`);
            console.log(`   Balance: $${balance3.calculatedBalance}`);
            console.log(`   Deposits: $${balance3.totalDeposits}`);
            console.log(`   Task Rewards: $${balance3.totalTaskRewards}`);
            console.log(`   Withdrawals: $${balance3.totalWithdrawn}`);
            console.log(`   Expected: $20 ((30-10) + 0 - 0)`);
        }

        // Scenario 4: User with deposits and withdrawals
        console.log('\n4️⃣ Scenario 4: User with deposits and withdrawals');
        const user4 = await User.findOne({ email: 'test3' });
        if (user4) {
            const balance4 = await calculateBalance(user4._id, Deposit, WithdrawalRequest, TaskSubmission);
            console.log(`   User: ${user4.email}`);
            console.log(`   Balance: $${balance4.calculatedBalance}`);
            console.log(`   Deposits: $${balance4.totalDeposits}`);
            console.log(`   Task Rewards: $${balance4.totalTaskRewards}`);
            console.log(`   Withdrawals: $${balance4.totalWithdrawn}`);
            console.log(`   Expected: $10 ((80-10) + 0 - 60)`);
        }

        // Scenario 5: User with $10 deposit + task rewards
        console.log('\n5️⃣ Scenario 5: User with $10 deposit + task rewards');
        const user5 = await User.findOne({ email: 'sshahidaanis24@gmail.com' });
        if (user5) {
            const balance5 = await calculateBalance(user5._id, Deposit, WithdrawalRequest, TaskSubmission);
            console.log(`   User: ${user5.email}`);
            console.log(`   Balance: $${balance5.calculatedBalance}`);
            console.log(`   Deposits: $${balance5.totalDeposits}`);
            console.log(`   Task Rewards: $${balance5.totalTaskRewards}`);
            console.log(`   Withdrawals: $${balance5.totalWithdrawn}`);
            console.log(`   Expected: $1.84 (task rewards only, first $10 unlocks tasks but doesn't count toward balance)`);
        }

        console.log('\n✅ Balance logic test completed!');
        
    } catch (error) {
        console.error('❌ Error testing balance logic:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

async function calculateBalance(userId, Deposit, WithdrawalRequest, TaskSubmission) {
    // Calculate balance: (total deposits - $10) + task rewards - total withdrawals
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
    
    // Get total withdrawals (including pending/processing)
    const totalWithdrawn = await WithdrawalRequest.aggregate([
        { $match: { userId: userId, status: { $in: ['completed', 'pending', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
    
    // Calculate balance: (deposits - $10) + task rewards - withdrawals
    const depositContribution = Math.max(0, totalDepositAmount - 10); // Only deposits beyond $10 count
    const calculatedBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
    
    return {
        totalDeposits: totalDepositAmount,
        depositContribution: depositContribution,
        totalTaskRewards: totalTaskRewardAmount,
        totalWithdrawn: totalWithdrawnAmount,
        calculatedBalance: calculatedBalance
    };
}
