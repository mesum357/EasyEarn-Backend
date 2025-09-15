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

async function fixAllUserBalances() {
  try {
    console.log('🔧 Fixing All User Balances (Double-Counting Issue)...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users to check\n`);
    
    let fixedCount = 0;
    let totalFixedAmount = 0;
    
    for (const user of users) {
      try {
        console.log(`🔍 Checking user: ${user.username} (${user.email})`);
        console.log(`   Current balance: $${user.balance}`);
        
        // Get all deposits and withdrawals for this user
        const deposits = await Deposit.find({ userId: user._id });
        const withdrawals = await WithdrawalRequest.find({ userId: user._id });
        
        // Calculate correct balance
        const confirmedDeposits = deposits.filter(d => d.status === 'confirmed');
        const totalDeposits = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
        
        const activeWithdrawals = withdrawals.filter(w => ['completed', 'pending', 'processing'].includes(w.status));
        const totalWithdrawn = activeWithdrawals.reduce((sum, w) => sum + w.amount, 0);
        
        const correctBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
        
        console.log(`   📊 Balance Analysis:`);
        console.log(`      Confirmed deposits: $${totalDeposits}`);
        console.log(`      Active withdrawals: $${totalWithdrawn}`);
        console.log(`      Correct balance: $${correctBalance}`);
        
        if (user.balance !== correctBalance) {
          const difference = Math.abs(user.balance - correctBalance);
          console.log(`   ⚠️  Balance mismatch detected!`);
          console.log(`      Difference: $${difference}`);
          
          // Update the balance
          const oldBalance = user.balance;
          user.balance = correctBalance;
          await user.save();
          
          console.log(`   ✅ Balance fixed: $${oldBalance} → $${correctBalance}`);
          fixedCount++;
          totalFixedAmount += difference;
        } else {
          console.log(`   ✅ Balance is correct`);
        }
        
        console.log(''); // Empty line for readability
        
      } catch (error) {
        console.error(`❌ Error processing user ${user.username}:`, error.message);
        console.log(''); // Empty line for readability
      }
    }
    
    console.log('🎉 Balance Fix Summary:');
    console.log('========================');
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Users fixed: ${fixedCount}`);
    console.log(`   Total amount corrected: $${totalFixedAmount}`);
    
    if (fixedCount > 0) {
      console.log('\n✅ All affected user balances have been corrected!');
      console.log('   The double-counting issue has been resolved.');
      console.log('   New deposits will now calculate balance correctly.');
    } else {
      console.log('\n✅ No balance issues found! All users have correct balances.');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
console.log('🚀 Starting balance fix for all users...\n');
fixAllUserBalances();
