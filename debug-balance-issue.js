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

async function debugBalanceIssue(email) {
  try {
    console.log('🔍 Debugging Balance Issue...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      return;
    }
    
    console.log(`👤 User: ${user.username} (${user.email})`);
    console.log(`💰 Current balance in database: $${user.balance}\n`);
    
    // Get all deposits and withdrawals
    const deposits = await Deposit.find({ userId: user._id }).sort({ createdAt: -1 });
    const withdrawals = await WithdrawalRequest.find({ userId: user._id }).sort({ createdAt: -1 });
    
    console.log('📊 DETAILED TRANSACTION ANALYSIS:');
    console.log('=====================================');
    
    // Analyze deposits
    console.log('\n💰 DEPOSITS:');
    console.log('-------------');
    let totalConfirmedDeposits = 0;
    let totalPendingDeposits = 0;
    let totalRejectedDeposits = 0;
    
    deposits.forEach((deposit, index) => {
      const status = deposit.status === 'confirmed' ? '✅' : deposit.status === 'pending' ? '⏳' : '❌';
      console.log(`   ${index + 1}. ${status} $${deposit.amount} - ${deposit.status} - ${deposit.createdAt.toLocaleDateString()}`);
      
      if (deposit.status === 'confirmed') {
        totalConfirmedDeposits += deposit.amount;
      } else if (deposit.status === 'pending') {
        totalPendingDeposits += deposit.amount;
      } else {
        totalRejectedDeposits += deposit.amount;
      }
    });
    
    console.log(`\n   📈 Deposit Summary:`);
    console.log(`      Confirmed: $${totalConfirmedDeposits}`);
    console.log(`      Pending: $${totalPendingDeposits}`);
    console.log(`      Rejected: $${totalRejectedDeposits}`);
    
    // Analyze withdrawals
    console.log('\n🏦 WITHDRAWALS:');
    console.log('----------------');
    let totalCompletedWithdrawals = 0;
    let totalPendingWithdrawals = 0;
    let totalProcessingWithdrawals = 0;
    let totalRejectedWithdrawals = 0;
    
    withdrawals.forEach((withdrawal, index) => {
      const status = withdrawal.status === 'completed' ? '✅' : 
                    withdrawal.status === 'pending' ? '⏳' : 
                    withdrawal.status === 'processing' ? '🔄' : '❌';
      console.log(`   ${index + 1}. ${status} $${withdrawal.amount} - ${withdrawal.status} - ${withdrawal.createdAt.toLocaleDateString()}`);
      
      if (withdrawal.status === 'completed') {
        totalCompletedWithdrawals += withdrawal.amount;
      } else if (withdrawal.status === 'pending') {
        totalPendingWithdrawals += withdrawal.amount;
      } else if (withdrawal.status === 'processing') {
        totalProcessingWithdrawals += withdrawal.amount;
      } else {
        totalRejectedWithdrawals += withdrawal.amount;
      }
    });
    
    console.log(`\n   📈 Withdrawal Summary:`);
    console.log(`      Completed: $${totalCompletedWithdrawals}`);
    console.log(`      Pending: $${totalPendingWithdrawals}`);
    console.log(`      Processing: $${totalProcessingWithdrawals}`);
    console.log(`      Rejected: $${totalRejectedWithdrawals}`);
    
    // Calculate expected balance
    console.log('\n🧮 BALANCE CALCULATION:');
    console.log('========================');
    console.log(`   Formula: (Total Confirmed Deposits - $10) - Total Completed Withdrawals`);
    console.log(`   Calculation: ($${totalConfirmedDeposits} - $10) - $${totalCompletedWithdrawals}`);
    
    const expectedBalance = Math.max(0, totalConfirmedDeposits - 10 - totalCompletedWithdrawals);
    console.log(`   Expected Balance: $${expectedBalance}`);
    console.log(`   Current Database Balance: $${user.balance}`);
    
    if (user.balance === expectedBalance) {
      console.log('\n✅ Balance is correct!');
    } else {
      console.log('\n⚠️  BALANCE MISMATCH DETECTED!');
      console.log(`   Difference: $${Math.abs(user.balance - expectedBalance)}`);
      
      // Show what should happen
      console.log('\n🔧 WHAT SHOULD HAPPEN:');
      console.log(`   Your confirmed deposits: $${totalConfirmedDeposits}`);
      console.log(`   Minus requirement: -$10`);
      console.log(`   Minus completed withdrawals: -$${totalCompletedWithdrawals}`);
      console.log(`   Available for withdrawal: $${expectedBalance}`);
      
      // Update the balance
      console.log('\n🔄 Updating balance in database...');
      user.balance = expectedBalance;
      await user.save();
      console.log('✅ Balance updated in database');
      console.log(`   New balance: $${user.balance}`);
    }
    
    // Additional debugging info
    console.log('\n🔍 ADDITIONAL DEBUG INFO:');
    console.log('==========================');
    console.log(`   Total deposits found: ${deposits.length}`);
    console.log(`   Total withdrawals found: ${withdrawals.length}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   User created: ${user.createdAt.toLocaleDateString()}`);
    
    console.log('\n🎉 Balance debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Test with your email - REPLACE WITH YOUR ACTUAL EMAIL
const testEmail = 'your-email@example.com'; // ⚠️ CHANGE THIS!
console.log('⚠️  IMPORTANT: Please edit this file and change the email address to your actual email!');
console.log(`   Current email: ${testEmail}`);
console.log('   Then run: node debug-balance-issue.js\n');

// Uncomment the line below after changing the email
// debugBalanceIssue(testEmail);
