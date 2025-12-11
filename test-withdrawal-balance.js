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

async function testWithdrawalBalance(email) {
  try {
    console.log('🧪 Testing Withdrawal Balance Calculation...\n');
    
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
    
    console.log('📊 TRANSACTION ANALYSIS:');
    console.log('========================');
    
    // Calculate total confirmed deposits
    const confirmedDeposits = deposits.filter(d => d.status === 'confirmed');
    const totalDeposits = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
    console.log(`   Total Confirmed Deposits: $${totalDeposits}`);
    
    // Calculate total withdrawals (including pending/processing)
    const activeWithdrawals = withdrawals.filter(w => ['completed', 'pending', 'processing'].includes(w.status));
    const totalWithdrawn = activeWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    console.log(`   Total Active Withdrawals: $${totalWithdrawn} (includes pending/processing)`);
    
    // Calculate expected balance
    const expectedBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
    console.log(`\n🧮 Balance Calculation:`);
    console.log(`   Formula: ($${totalDeposits} - $10) - $${totalWithdrawn} = $${expectedBalance}`);
    console.log(`   Expected Balance: $${expectedBalance}`);
    console.log(`   Current Database Balance: $${user.balance}`);
    
    if (user.balance === expectedBalance) {
      console.log('\n✅ Balance is correct!');
    } else {
      console.log('\n⚠️  Balance mismatch detected!');
      console.log(`   Difference: $${Math.abs(user.balance - expectedBalance)}`);
      
      // Update the balance
      console.log('\n🔄 Updating balance in database...');
      user.balance = expectedBalance;
      await user.save();
      console.log('✅ Balance updated in database');
      console.log(`   New balance: $${user.balance}`);
    }
    
    // Show detailed breakdown
    console.log('\n📋 DETAILED BREAKDOWN:');
    console.log('======================');
    
    console.log('\n💰 Deposits:');
    deposits.forEach((deposit, index) => {
      const status = deposit.status === 'confirmed' ? '✅' : deposit.status === 'pending' ? '⏳' : '❌';
      console.log(`   ${index + 1}. ${status} $${deposit.amount} - ${deposit.status}`);
    });
    
    console.log('\n🏦 Withdrawals:');
    withdrawals.forEach((withdrawal, index) => {
      const status = withdrawal.status === 'completed' ? '✅' : 
                    withdrawal.status === 'pending' ? '⏳' : 
                    withdrawal.status === 'processing' ? '🔄' : '❌';
      const affectsBalance = ['completed', 'pending', 'processing'].includes(withdrawal.status) ? '💰' : '';
      console.log(`   ${index + 1}. ${status} $${withdrawal.amount} - ${withdrawal.status} ${affectsBalance}`);
    });
    
    console.log('\n💡 EXPLANATION:');
    console.log('================');
    console.log('   ✅ Confirmed deposits count toward your balance');
    console.log('   ⏳ Pending withdrawals reduce your available balance');
    console.log('   🔄 Processing withdrawals reduce your available balance');
    console.log('   ✅ Completed withdrawals are permanently deducted');
    console.log('   ❌ Rejected withdrawals do NOT affect your balance');
    
    console.log('\n🎯 WHAT THIS MEANS:');
    console.log('====================');
    console.log(`   Your available balance: $${expectedBalance}`);
    console.log(`   You can withdraw up to: $${expectedBalance}`);
    console.log(`   Pending withdrawals: $${withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0)}`);
    console.log(`   Processing withdrawals: $${withdrawals.filter(w => w.status === 'processing').reduce((sum, w) => sum + w.amount, 0)}`);
    
    console.log('\n🎉 Withdrawal balance test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Test with your email - REPLACE WITH YOUR ACTUAL EMAIL
const testEmail = 'your-email@example.com'; // ⚠️ CHANGE THIS!
console.log('⚠️  IMPORTANT: Please edit this file and change the email address to your actual email!');
console.log(`   Current email: ${testEmail}`);
console.log('   Then run: node test-withdrawal-balance.js\n');

// Uncomment the line below after changing the email
// testWithdrawalBalance(testEmail);
