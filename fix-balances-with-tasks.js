require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB first
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");
        setupModelsAndFixBalances();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function setupModelsAndFixBalances() {
    try {
        // Define models (same as in app.js)
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        // Deposit Schema
        const depositSchema = new mongoose.Schema({
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'confirmed', 'rejected'],
                default: 'pending'
            },
            transactionHash: {
                type: String,
                required: false
            },
            receiptUrl: {
                type: String,
                required: false
            },
            notes: String,
            createdAt: {
                type: Date,
                default: Date.now
            },
            confirmedAt: Date
        });
        const Deposit = mongoose.model('Deposit', depositSchema);

        // Withdrawal Request Schema
        const withdrawalRequestSchema = new mongoose.Schema({
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            walletAddress: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'processing', 'completed', 'rejected'],
                default: 'pending'
            },
            processedAt: Date,
            notes: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        });
        const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

        // Task Schema
        const taskSchema = new mongoose.Schema({
            title: { type: String, required: true },
            description: { type: String, required: true },
            reward: { type: Number, required: true },
            category: { type: String, required: true, enum: ['Social Media', 'App Store', 'Survey', 'Other'] },
            timeEstimate: { type: String, required: true },
            requirements: [{ type: String }],
            url: { type: String, default: "" },
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });
        const Task = mongoose.model('Task', taskSchema);

        // Task Submission Schema
        const taskSubmissionSchema = new mongoose.Schema({
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            screenshotUrl: { type: String },
            notes: { type: String },
            submittedAt: { type: Date, default: Date.now },
            reviewedAt: { type: Date },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reviewNotes: { type: String }
        });
        const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

        // Now run the balance fix
        await fixAllUserBalances(User, Deposit, WithdrawalRequest, TaskSubmission);
        
    } catch (error) {
        console.error('❌ Error setting up models:', error);
        mongoose.connection.close();
    }
}

async function fixAllUserBalances(User, Deposit, WithdrawalRequest, TaskSubmission) {
    try {
        console.log('🔧 Starting comprehensive user balance fix...');
        
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to process`);
        
        let fixedCount = 0;
        let totalDepositsProcessed = 0;
        let totalTaskRewardsProcessed = 0;
        let totalWithdrawalsProcessed = 0;
        const results = [];
        
        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.username} (${user._id})`);
            console.log(`   Current balance: $${user.balance}`);
            console.log(`   Current hasDeposited: ${user.hasDeposited}`);
            
            // Get confirmed deposits
            const confirmedDeposits = await Deposit.find({
                userId: user._id,
                status: 'confirmed'
            }).sort({ createdAt: 1 });
            
            console.log(`   Found ${confirmedDeposits.length} confirmed deposits`);
            
            // Get approved task submissions
            const approvedTasks = await TaskSubmission.find({
                userId: user._id,
                status: 'approved'
            }).populate('taskId');
            
            console.log(`   Found ${approvedTasks.length} approved task submissions`);
            
            // Get withdrawal requests (including pending/processing)
            const withdrawalRequests = await WithdrawalRequest.find({
                userId: user._id,
                status: { $in: ['completed', 'pending', 'processing'] }
            });
            
            console.log(`   Found ${withdrawalRequests.length} withdrawal requests (completed/pending/processing)`);
            
            const previousBalance = user.balance;
            const previousHasDeposited = user.hasDeposited;
            
            // Calculate totals
            const totalDeposits = confirmedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
            const totalTaskRewards = approvedTasks.reduce((sum, task) => sum + (task.taskId ? task.taskId.reward : 0), 0);
            const totalWithdrawn = withdrawalRequests.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
            
            console.log(`   Total deposits: $${totalDeposits}`);
            console.log(`   Total task rewards: $${totalTaskRewards}`);
            console.log(`   Total withdrawn: $${totalWithdrawn}`);
            
            if (confirmedDeposits.length === 0) {
                console.log(`   ⚠️ No confirmed deposits - setting balance to $0 and hasDeposited to false`);
                user.balance = 0;
                user.hasDeposited = false;
                        } else if (totalDeposits <= 10) {
              // First deposit(s) totaling $10 or less - unlocks tasks, balance = task rewards only
              user.balance = Math.max(0, totalTaskRewards - totalWithdrawn);
              user.hasDeposited = true;
              console.log(`   ✅ First deposit(s) totaling $${totalDeposits} - tasks unlocked, balance = task rewards (${totalTaskRewards}) - withdrawals (${totalWithdrawn}) = $${user.balance}`);
            } else {
                // Total deposits more than $10 - first $10 unlocks tasks, rest goes to balance
                // Calculate balance: (deposits - $10) + task rewards - withdrawals
                const depositContribution = Math.max(0, totalDeposits - 10); // Only deposits beyond $10 count
                user.balance = Math.max(0, depositContribution + totalTaskRewards - totalWithdrawn);
                user.hasDeposited = true;
                console.log(`   ✅ Balance calculation: (${totalDeposits} - 10) + ${totalTaskRewards} - ${totalWithdrawn} = ${depositContribution} + ${totalTaskRewards} - ${totalWithdrawn} = $${user.balance}`);
            }
            
            await user.save();
            console.log(`   💾 User updated - New balance: $${user.balance}, hasDeposited: ${user.hasDeposited}`);
            
            results.push({
                username: user.username,
                userId: user._id,
                previousBalance,
                newBalance: user.balance,
                previousHasDeposited,
                newHasDeposited: user.hasDeposited,
                confirmedDeposits: confirmedDeposits.length,
                totalDepositAmount: totalDeposits,
                approvedTasks: approvedTasks.length,
                totalTaskRewards: totalTaskRewards,
                withdrawalRequests: withdrawalRequests.length,
                totalWithdrawn: totalWithdrawn,
                calculation: `(${totalDeposits} - 10) + ${totalTaskRewards} - ${totalWithdrawn} = ${Math.max(0, totalDeposits - 10)} + ${totalTaskRewards} - ${totalWithdrawn} = $${user.balance}`
            });
            
            totalDepositsProcessed += totalDeposits;
            totalTaskRewardsProcessed += totalTaskRewards;
            totalWithdrawalsProcessed += totalWithdrawn;
            fixedCount++;
        }
        
        console.log(`\n🎉 Balance fix completed successfully!`);
        console.log(`📊 Summary:`);
        console.log(`   Users processed: ${fixedCount}`);
        console.log(`   Total deposits processed: $${totalDepositsProcessed}`);
        console.log(`   Total task rewards processed: $${totalTaskRewardsProcessed}`);
        console.log(`   Total withdrawals processed: $${totalWithdrawalsProcessed}`);
        
        // Save detailed results to a file
        const fs = require('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `balance-fix-results-${timestamp}.json`;
        
        const summary = {
            timestamp: new Date().toISOString(),
            summary: {
                usersProcessed: fixedCount,
                totalDepositsProcessed,
                totalTaskRewardsProcessed,
                totalWithdrawalsProcessed
            },
            results
        };
        
        fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
        console.log(`📄 Detailed results saved to: ${filename}`);
        
        // Show some examples
        console.log(`\n📋 Sample Results:`);
        results.slice(0, 5).forEach(result => {
            console.log(`   ${result.username}: $${result.previousBalance} → $${result.newBalance} (${result.calculation})`);
        });
        
        if (results.length > 5) {
            console.log(`   ... and ${results.length - 5} more users`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing user balances:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
