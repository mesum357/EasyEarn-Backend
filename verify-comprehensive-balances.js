require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        verifyComprehensiveBalances();
    })
    .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function verifyComprehensiveBalances() {
    try {
        console.log('🔍 Starting Comprehensive Balance Verification...\n');
        console.log('This will verify balances based on:');
        console.log('- Deposits (with $10 deduction for task unlock)');
        console.log('- Task rewards (approved tasks)');
        console.log('- Withdrawals (pending, processing, completed)');
        console.log('- Additional balances (admin-added amounts)\n');
        
        // Define models using the schemas from app.js
        const User = require('./models/User');
        
        // Define schemas inline (same as in app.js)
        const depositSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
            transactionHash: { type: String },
            receiptUrl: { type: String },
            notes: String,
            createdAt: { type: Date, default: Date.now },
            confirmedAt: Date
        });
        
        const taskSchema = new mongoose.Schema({
            title: { type: String, required: true },
            description: { type: String, required: true },
            reward: { type: Number, required: true },
            category: { type: String, required: true, enum: ['Social Media', 'App Store', 'Survey', 'Other'] },
            timeEstimate: { type: String, required: true },
            instructions: { type: String, required: true },
            isActive: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now }
        });
        
        const taskSubmissionSchema = new mongoose.Schema({
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            screenshotUrl: { type: String },
            notes: { type: String },
            submittedAt: { type: Date, default: Date.now },
            reviewedAt: Date,
            reviewNotes: String
        });
        
        const withdrawalRequestSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
            paymentMethod: { type: String, required: true },
            paymentDetails: { type: String, required: true },
            requestedAt: { type: Date, default: Date.now },
            processedAt: Date,
            notes: String
        });
        
        // Create models
        const Deposit = mongoose.model('Deposit', depositSchema);
        const Task = mongoose.model('Task', taskSchema);
        const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);
        const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
        
        // Get all users
        const users = await User.find({}).sort({ createdAt: -1 });
        console.log(`👥 Found ${users.length} users to verify\n`);
        
        let correctCount = 0;
        let incorrectCount = 0;
        let totalSystemBalance = 0;
        const issues = [];
        
        for (const user of users) {
            // Get total confirmed deposits
            const totalConfirmedDeposits = await Deposit.aggregate([
                { $match: { userId: user._id, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
            
            // Get total approved task rewards
            const approvedTaskRewards = await TaskSubmission.aggregate([
                { $match: { userId: user._id, status: 'approved' } },
                { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
                { $unwind: '$task' },
                { $group: { _id: null, total: { $sum: '$task.reward' } } }
            ]);
            const totalTaskRewards = approvedTaskRewards.length > 0 ? approvedTaskRewards[0].total : 0;
            
            // Get total withdrawals (pending, processing, and completed)
            const totalWithdrawals = await WithdrawalRequest.aggregate([
                { $match: { userId: user._id, status: { $in: ['pending', 'processing', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalWithdrawn = totalWithdrawals.length > 0 ? totalWithdrawals[0].total : 0;
            
            // Get additional balance (admin-added amount)
            const additionalBalance = user.additionalBalance || 0;
            
            // Calculate correct balance
            // Formula: (Deposits - $10) + Task Rewards + Additional Balance - Withdrawals
            const depositContribution = Math.max(0, totalDeposits - 10);
            const correctBalance = Math.max(0, depositContribution + totalTaskRewards + additionalBalance - totalWithdrawn);
            
            const currentBalance = user.balance || 0;
            const difference = Math.abs(currentBalance - correctBalance);
            
            console.log(`👤 ${user.username} (${user.email})`);
            console.log(`   Current Balance: $${currentBalance}`);
            console.log(`   Expected Balance: $${correctBalance}`);
            console.log(`   Deposits: $${totalDeposits} (contribution: $${depositContribution})`);
            console.log(`   Task Rewards: $${totalTaskRewards}`);
            console.log(`   Additional Balance: $${additionalBalance}`);
            console.log(`   Withdrawals: $${totalWithdrawn}`);
            console.log(`   Difference: $${difference}`);
            
            if (difference > 0.01) {
                console.log(`   Status: ❌ INCORRECT`);
                incorrectCount++;
                issues.push({
                    username: user.username,
                    email: user.email,
                    actual: currentBalance,
                    expected: correctBalance,
                    difference: difference,
                    deposits: totalDeposits,
                    tasks: totalTaskRewards,
                    additional: additionalBalance,
                    withdrawals: totalWithdrawn
                });
            } else {
                console.log(`   Status: ✅ CORRECT`);
                correctCount++;
            }
            
            totalSystemBalance += currentBalance;
            console.log('');
        }
        
        console.log('🎯 COMPREHENSIVE BALANCE VERIFICATION COMPLETE!');
        console.log('===============================================');
        console.log(`📊 Summary:`);
        console.log(`   Total users: ${users.length}`);
        console.log(`   Correct balances: ${correctCount}`);
        console.log(`   Incorrect balances: ${incorrectCount}`);
        console.log(`   Accuracy: ${(correctCount / users.length * 100).toFixed(2)}%`);
        console.log(`   Total system balance: $${totalSystemBalance.toFixed(2)}`);
        
        if (issues.length > 0) {
            console.log(`\n❌ BALANCE ISSUES FOUND:`);
            console.log(`========================`);
            issues.slice(0, 20).forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.username} (${issue.email})`);
                console.log(`   Actual: $${issue.actual}`);
                console.log(`   Expected: $${issue.expected}`);
                console.log(`   Difference: $${issue.difference.toFixed(4)}`);
                console.log(`   Deposits: $${issue.deposits}, Tasks: $${issue.tasks}, Additional: $${issue.additional}, Withdrawals: $${issue.withdrawals}`);
            });
            
            if (issues.length > 20) {
                console.log(`\n... and ${issues.length - 20} more issues`);
            }
        } else {
            console.log(`\n✅ All balances are correct!`);
        }
        
    } catch (error) {
        console.error('❌ Error during balance verification:', error);
    } finally {
        mongoose.disconnect();
    }
}
