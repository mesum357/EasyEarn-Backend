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
        fixAllUserBalances();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function fixAllUserBalances() {
    try {
        console.log('🔧 Fixing all user balances...');
        
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

    // Get all users
        const allUsers = await User.find({});
        console.log(`Found ${allUsers.length} users to fix`);
        
        let fixedCount = 0;
        let unchangedCount = 0;
        
        for (const user of allUsers) {
            // Calculate correct balance
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
            const correctBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
            
            // Check if balance needs to be updated
            if (Math.abs(user.balance - correctBalance) > 0.01) { // Allow for small floating point differences
        const oldBalance = user.balance;
                user.balance = correctBalance;
        await user.save();
        
                console.log(`✅ Fixed balance for ${user.username}: $${oldBalance} → $${correctBalance}`);
                console.log(`   Deposits: $${totalDepositAmount}, Contribution: $${depositContribution}, Tasks: $${totalTaskRewardAmount}, Withdrawn: $${totalWithdrawnAmount}`);
                fixedCount++;
      } else {
                unchangedCount++;
            }
        }
        
        console.log(`\n📊 Balance fix summary:`);
        console.log(`   Fixed: ${fixedCount} users`);
        console.log(`   Unchanged: ${unchangedCount} users`);
        console.log(`   Total: ${allUsers.length} users`);
        
        console.log('\n✅ All user balances have been fixed!');

  } catch (error) {
        console.error('❌ Error fixing user balances:', error);
  } finally {
    mongoose.connection.close();
        console.log('🔌 Database connection closed');
  }
}
