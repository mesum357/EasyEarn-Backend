require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        fixComprehensiveBalances();
    })
    .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function fixComprehensiveBalances() {
    try {
        console.log('🔧 Starting Comprehensive Balance Fix...\n');
        console.log('This will fix balances based on:');
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
        console.log(`👥 Found ${users.length} users to process\n`);
        
        let processedCount = 0;
        let correctedCount = 0;
        let totalSystemBalance = 0;
        const results = [];
        
        for (const user of users) {
            processedCount++;
            console.log(`🔍 Processing user ${processedCount}/${users.length}: ${user.username}`);
            
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
            
            console.log(`   Current Balance: $${currentBalance}`);
            console.log(`   Correct Balance: $${correctBalance}`);
            console.log(`   Deposits: $${totalDeposits} (contribution: $${depositContribution})`);
            console.log(`   Task Rewards: $${totalTaskRewards}`);
            console.log(`   Additional Balance: $${additionalBalance}`);
            console.log(`   Withdrawals: $${totalWithdrawn}`);
            console.log(`   Difference: $${difference}`);
            
            if (difference > 0.01) {
                // Update user balance
                user.balance = correctBalance;
                await user.save();
                correctedCount++;
                console.log(`   ✅ CORRECTED: $${currentBalance} → $${correctBalance}`);
            } else {
                console.log(`   ✅ CORRECT: Balance is accurate`);
            }
            
            totalSystemBalance += correctBalance;
            
            results.push({
                username: user.username,
                email: user.email,
                userId: user._id,
                oldBalance: currentBalance,
                newBalance: correctBalance,
                totalDeposits,
                depositContribution,
                totalTaskRewards,
                additionalBalance,
                totalWithdrawn,
                corrected: difference > 0.01
            });
            
            console.log('');
        }
        
        console.log('🎯 COMPREHENSIVE BALANCE FIX COMPLETE!');
        console.log('=====================================');
        console.log(`📊 Summary:`);
        console.log(`   Total users processed: ${processedCount}`);
        console.log(`   Users corrected: ${correctedCount}`);
        console.log(`   Users already correct: ${processedCount - correctedCount}`);
        console.log(`   Total system balance: $${totalSystemBalance.toFixed(2)}`);
        console.log(`   Accuracy: ${((processedCount - correctedCount) / processedCount * 100).toFixed(1)}%`);
        
        // Save results to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `comprehensive-balance-fix-results-${timestamp}.json`;
        require('fs').writeFileSync(filename, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                usersProcessed: processedCount,
                usersCorrected: correctedCount,
                usersCorrect: processedCount - correctedCount,
                totalSystemBalance: totalSystemBalance,
                accuracy: ((processedCount - correctedCount) / processedCount * 100).toFixed(1) + '%'
            },
            results: results
        }, null, 2));
        
        console.log(`\n📁 Detailed results saved to: ${filename}`);
        console.log('\n✅ All user balances have been corrected based on comprehensive calculation!');
        
    } catch (error) {
        console.error('❌ Error during balance fix:', error);
    } finally {
        mongoose.disconnect();
    }
}
