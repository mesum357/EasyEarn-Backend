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

async function testUserBalance(email) {
  try {
    console.log('🧪 Testing Balance Calculation for User...\n');
    
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
    
    console.log('📊 Transaction Summary:');
    
    // Calculate total confirmed deposits
    const confirmedDeposits = deposits.filter(d => d.status === 'confirmed');
    const totalDeposits = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
    console.log(`   Total Confirmed Deposits: $${totalDeposits}`);
    
    // Show deposit details
    console.log('\n💰 Deposits:');
    deposits.forEach(deposit => {
      const status = deposit.status === 'confirmed' ? '✅' : deposit.status === 'pending' ? '⏳' : '❌';
      console.log(`   ${status} $${deposit.amount} - ${deposit.status} - ${deposit.createdAt.toLocaleDateString()}`);
    });
    
    // Calculate total completed withdrawals (only completed ones count)
    const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
    const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    console.log(`\n   Total Completed Withdrawals: $${totalWithdrawn}`);
    
    // Show withdrawal details
    console.log('\n🏦 Withdrawals:');
    withdrawals.forEach(withdrawal => {
      const status = withdrawal.status === 'completed' ? '✅' : withdrawal.status === 'pending' ? '⏳' : withdrawal.status === 'processing' ? '🔄' : '❌';
      console.log(`   ${status} $${withdrawal.amount} - ${withdrawal.status} - ${withdrawal.createdAt.toLocaleDateString()}`);
    });
    
    // Calculate expected balance
    const expectedBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
    console.log(`\n📈 Balance Calculation:`);
    console.log(`   Formula: $${totalDeposits} - $10 - $${totalWithdrawn} = $${expectedBalance}`);
    console.log(`   Database Balance: $${user.balance}`);
    console.log(`   Expected Balance: $${expectedBalance}`);
    
    if (user.balance === expectedBalance) {
      console.log('\n✅ Balance is correct!');
    } else {
      console.log('\n⚠️  Balance mismatch detected!');
      console.log(`   Difference: $${Math.abs(user.balance - expectedBalance)}`);
      
      // Update the balance
      user.balance = expectedBalance;
      await user.save();
      console.log('✅ Balance updated in database');
    }
    
    console.log('\n🎉 Balance test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Test with your email
const testEmail = 'your-email@example.com'; // Replace with your actual email
testUserBalance(testEmail);
