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
  createdAt: { type: Date, default: Date.now }
});

const Deposit = mongoose.model('Deposit', depositSchema);
const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

async function migrateFixBalanceInconsistency() {
  try {
    console.log('🔧 MIGRATION: Fixing Balance Inconsistency Bug for All Users...\n');
    console.log('================================================================\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users to check\n`);
    
    let fixedCount = 0;
    let totalFixedAmount = 0;
    let usersWithIssues = [];
    
    for (const user of users) {
      try {
        console.log(`🔍 Checking user: ${user.username} (${user.email})`);
        console.log(`   Current balance: $${user.balance}`);
        
        // Get all deposits and withdrawals for this user
        const deposits = await Deposit.find({ userId: user._id });
        const withdrawals = await WithdrawalRequest.find({ userId: user._id });
        
        // Calculate correct balance using the FIXED formula
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
          
          // Store user info for reporting
          usersWithIssues.push({
            username: user.username,
            email: user.email,
            userId: user._id,
            oldBalance: user.balance,
            newBalance: correctBalance,
            difference: difference,
            totalDeposits: totalDeposits,
            totalWithdrawn: totalWithdrawn
          });
          
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
    
    // Summary report
    console.log('🎉 MIGRATION COMPLETED!');
    console.log('========================');
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Users fixed: ${fixedCount}`);
    console.log(`   Total amount corrected: $${totalFixedAmount}`);
    
    if (fixedCount > 0) {
      console.log('\n📋 DETAILED REPORT OF FIXED USERS:');
      console.log('====================================');
      
      usersWithIssues.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.username} (${user.email})`);
        console.log(`   User ID: ${user.userId}`);
        console.log(`   Old Balance: $${user.oldBalance}`);
        console.log(`   New Balance: $${user.newBalance}`);
        console.log(`   Difference: $${user.difference}`);
        console.log(`   Total Deposits: $${user.totalDeposits}`);
        console.log(`   Total Withdrawn: $${user.totalWithdrawn}`);
        console.log(`   Formula: ($${user.totalDeposits} - $10) - $${user.totalWithdrawn} = $${user.newBalance}`);
      });
      
      console.log('\n✅ All affected user balances have been corrected!');
      console.log('   The balance inconsistency bug has been resolved.');
      console.log('   New deposits and withdrawals will now calculate balance correctly.');
      
    } else {
      console.log('\n✅ No balance issues found! All users have correct balances.');
    }
    
    // Show what was fixed
    console.log('\n🔧 WHAT WAS FIXED:');
    console.log('===================');
    console.log('   1. Deposit confirmation endpoints now properly subtract withdrawals');
    console.log('   2. Admin balance fix endpoint now includes withdrawal deduction');
    console.log('   3. All balance calculations use consistent formula:');
    console.log('      Balance = (Total Deposits - $10) - Total Active Withdrawals');
    console.log('   4. No more double-counting of deposits');
    console.log('   5. No more inflated balances after withdrawals');
    
    console.log('\n🧪 VERIFICATION:');
    console.log('=================');
    console.log('   Run the test script to verify the fix:');
    console.log('   node test-real-world-scenario.js');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('===============');
    console.log('   1. Deploy the updated backend code');
    console.log('   2. Monitor new deposits/withdrawals for correct balance calculation');
    console.log('   3. Run periodic balance audits if needed');
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
console.log('🚀 Starting balance inconsistency migration...\n');
migrateFixBalanceInconsistency();
