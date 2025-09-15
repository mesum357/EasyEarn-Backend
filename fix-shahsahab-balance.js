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
        fixShahsahabBalance();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function fixShahsahabBalance() {
    try {
        console.log('🔧 Fixing balance for shahsahab@gmail.com');
        
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

        // Copy the calculateUserBalance function from app.js
        async function calculateUserBalance(userId) {
            try {
                // Calculate balance: (total confirmed deposits - $10) + task rewards - total withdrawn (including pending/processing)
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
                
                // Include pending and processing withdrawals in available balance calculation
                const totalWithdrawn = await WithdrawalRequest.aggregate([
                    { $match: { userId: userId, status: { $in: ['completed', 'pending', 'processing'] } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
                
                // Get the latest admin balance adjustment (if any)
                const latestAdminAdjustment = await AdminBalanceAdjustment.find(
                    { userId: userId }
                ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
                
                // Calculate base balance from deposits and tasks
                let baseBalance;
                let depositContribution = 0;
                
                if (totalDepositAmount <= 10) {
                    // For $10 or less deposits: base balance = task rewards - withdrawals (no deposit contribution)
                    baseBalance = Math.max(0, totalTaskRewardAmount - totalWithdrawnAmount);
                } else {
                    // For deposits > $10: base balance = (deposits - $10) + task rewards - withdrawals
                    depositContribution = totalDepositAmount - 10; // Only deposits beyond $10 count
                    baseBalance = Math.max(0, depositContribution + totalTaskRewardAmount - totalWithdrawnAmount);
                }
                
                // If there's an admin adjustment, use it as the base and add ongoing deposits/tasks
                let finalBalance = baseBalance;
                let adminAdjustmentNote = '';
                
                if (latestAdminAdjustment && latestAdminAdjustment.operation === 'set') {
                    // Admin set a specific balance - use that as base and add ongoing activity
                    const adminSetBalance = latestAdminAdjustment.newBalance;
                    
                    // Calculate ongoing activity since admin adjustment
                    const ongoingDeposits = await Deposit.aggregate([
                        { $match: { 
                            userId: userId, 
                            status: 'confirmed',
                            createdAt: { $gt: latestAdminAdjustment.createdAt }
                        }},
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ]);
                    const ongoingDepositAmount = ongoingDeposits.length > 0 ? ongoingDeposits[0].total : 0;
                    
                    const ongoingTaskRewards = await TaskSubmission.aggregate([
                        { $match: { 
                            userId: userId, 
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
                            userId: userId, 
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
                                userId: userId, 
                                status: 'confirmed',
                                createdAt: { $lte: latestAdminAdjustment.createdAt }
                            }},
                            { $group: { _id: null, total: { $sum: '$amount' } } }
                        ]);
                        const depositsBeforeAmount = depositsBeforeAdjustment.length > 0 ? depositsBeforeAdjustment[0].total : 0;
                        
                        if (depositsBeforeAmount >= 10) {
                            // User already unlocked tasks, all ongoing deposits count
                            ongoingDepositContribution = ongoingDepositAmount;
                        } else if (depositsBeforeAmount + ongoingDepositAmount > 10) {
                            // Ongoing deposits unlock tasks and contribute to balance
                            ongoingDepositContribution = Math.max(0, (depositsBeforeAmount + ongoingDepositAmount) - 10);
                        }
                        // If still under $10, no deposit contribution
                    }
                    
                    // Final balance = admin set balance + ongoing activity
                    finalBalance = adminSetBalance + ongoingDepositContribution + ongoingTaskRewardAmount - ongoingWithdrawalAmount;
                    finalBalance = Math.max(0, finalBalance); // Ensure non-negative
                    
                    adminAdjustmentNote = `Admin set balance: $${adminSetBalance}, Ongoing: +$${ongoingDepositContribution} (deposits) + $${ongoingTaskRewardAmount} (tasks) - $${ongoingWithdrawalAmount} (withdrawals)`;
                }
                
                return {
                    totalDeposits: totalDepositAmount,
                    depositContribution: depositContribution,
                    totalTaskRewards: totalTaskRewardAmount,
                    totalWithdrawn: totalWithdrawnAmount,
                    calculatedBalance: finalBalance,
                    baseBalance: baseBalance,
                    adminAdjustmentNote: adminAdjustmentNote,
                    hasAdminAdjustment: !!latestAdminAdjustment
                };
            } catch (error) {
                console.error('Error calculating user balance:', error);
                return { 
                    totalDeposits: 0, 
                    depositContribution: 0, 
                    totalTaskRewards: 0, 
                    totalWithdrawn: 0, 
                    calculatedBalance: 0,
                    baseBalance: 0,
                    adminAdjustmentNote: '',
                    hasAdminAdjustment: false
                };
            }
        }

        // Find the specific user
        const testUser = await User.findOne({ email: 'shahsahab@gmail.com' });
        if (!testUser) {
            console.error('❌ User shahsahab@gmail.com not found in database');
            return;
        }
        
        console.log(`\n👤 User: ${testUser.email} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance}`);
        
        // Calculate the correct balance
        console.log(`\n🔍 Calculating correct balance...`);
        const balanceInfo = await calculateUserBalance(testUser._id);
        
        console.log(`   Balance Info:`, balanceInfo);
        console.log(`   Calculated Balance: $${balanceInfo.calculatedBalance}`);
        
        // Update the user's balance if it's different
        if (Math.abs(testUser.balance - balanceInfo.calculatedBalance) >= 0.01) {
            console.log(`\n⚠️ Balance mismatch detected!`);
            console.log(`   Current Balance: $${testUser.balance}`);
            console.log(`   Correct Balance: $${balanceInfo.calculatedBalance}`);
            
            // Update the user's balance
            testUser.balance = balanceInfo.calculatedBalance;
            await testUser.save();
            
            console.log(`\n✅ Balance updated successfully!`);
            console.log(`   New Balance: $${testUser.balance}`);
        } else {
            console.log(`\n✅ Balance is already correct!`);
        }
        
        console.log('\n✅ Balance fix completed!');
        
    } catch (error) {
        console.error('❌ Error fixing balance:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
