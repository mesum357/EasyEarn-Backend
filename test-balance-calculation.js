require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./React Websitee/pak-nexus/backend/models/User');

// Define schemas for testing
const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
  processedAt: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const Deposit = mongoose.model('Deposit', depositSchema);
const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

// Utility function to calculate user balance consistently
async function calculateUserBalance(userId) {
  try {
    // Calculate balance: (total confirmed deposits - 10) - total withdrawn
    const totalDeposits = await Deposit.aggregate([
      { $match: { userId: userId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
    
    const totalWithdrawn = await WithdrawalRequest.aggregate([
      { $match: { userId: userId, status: { $in: ['completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
    
    const calculatedBalance = Math.max(0, totalDepositAmount - 10 - totalWithdrawnAmount);
    
    return {
      totalDeposits: totalDepositAmount,
      totalWithdrawn: totalWithdrawnAmount,
      calculatedBalance: calculatedBalance
    };
  } catch (error) {
    console.error('Error calculating user balance:', error);
    return { totalDeposits: 0, totalWithdrawn: 0, calculatedBalance: 0 };
  }
}

async function testBalanceCalculation() {
  try {
    console.log('🧪 Testing Balance Calculation...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test with a specific user (replace with actual user ID)
    const testUserId = '64f8b8b8b8b8b8b8b8b8b8b8'; // Replace with actual user ID
    
    // Check if user exists
    const user = await User.findById(testUserId);
    if (!user) {
      console.log('❌ User not found. Please provide a valid user ID.');
      return;
    }
    
    console.log(`👤 Testing with user: ${user.username} (${user.email})`);
    console.log(`💰 Current balance in database: $${user.balance}\n`);
    
    // Calculate balance using our function
    const balanceInfo = await calculateUserBalance(testUserId);
    
    console.log('📊 Balance Calculation Results:');
    console.log(`   Total Confirmed Deposits: $${balanceInfo.totalDeposits}`);
    console.log(`   Total Withdrawn: $${balanceInfo.totalWithdrawn}`);
    console.log(`   Calculated Balance: $${balanceInfo.calculatedBalance}`);
    console.log(`   Formula: $${balanceInfo.totalDeposits} - $10 - $${balanceInfo.totalWithdrawn} = $${balanceInfo.calculatedBalance}\n`);
    
    // Check if balance needs updating
    if (user.balance !== balanceInfo.calculatedBalance) {
      console.log('⚠️  Balance mismatch detected!');
      console.log(`   Database balance: $${user.balance}`);
      console.log(`   Calculated balance: $${balanceInfo.calculatedBalance}`);
      console.log(`   Difference: $${Math.abs(user.balance - balanceInfo.calculatedBalance)}`);
      
      // Update the balance
      user.balance = balanceInfo.calculatedBalance;
      await user.save();
      console.log('✅ Balance updated in database\n');
    } else {
      console.log('✅ Balance is correct!\n');
    }
    
    // Show all deposits and withdrawals for this user
    console.log('📋 Transaction History:');
    
    const deposits = await Deposit.find({ userId: testUserId }).sort({ createdAt: -1 });
    console.log('\n💰 Deposits:');
    deposits.forEach(deposit => {
      const status = deposit.status === 'confirmed' ? '✅' : deposit.status === 'pending' ? '⏳' : '❌';
      console.log(`   ${status} $${deposit.amount} - ${deposit.status} - ${deposit.createdAt.toLocaleDateString()}`);
    });
    
    const withdrawals = await WithdrawalRequest.find({ userId: testUserId }).sort({ createdAt: -1 });
    console.log('\n🏦 Withdrawals:');
    withdrawals.forEach(withdrawal => {
      const status = withdrawal.status === 'completed' ? '✅' : withdrawal.status === 'pending' ? '⏳' : withdrawal.status === 'processing' ? '🔄' : '❌';
      console.log(`   ${status} $${withdrawal.amount} - ${withdrawal.status} - ${withdrawal.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n🎉 Balance calculation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBalanceCalculation();
