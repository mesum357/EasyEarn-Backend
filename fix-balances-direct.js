require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./React Websitee/pak-nexus/backend/models/User');
const Deposit = require('./React Websitee/pak-nexus/backend/models/Deposit');

console.log('🔧 Direct User Balance Fix Starting...\n');

async function fixUserBalances() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process\n`);
    
    let fixedCount = 0;
    let totalDepositsProcessed = 0;
    const results = [];
    
    for (const user of users) {
      console.log(`👤 Processing user: ${user.username} (${user._id})`);
      console.log(`   Current balance: $${user.balance}`);
      console.log(`   Current hasDeposited: ${user.hasDeposited}`);
      
      // Find confirmed deposits for this user
      const confirmedDeposits = await Deposit.find({
        userId: user._id,
        status: 'confirmed'
      }).sort({ createdAt: 1 });
      
      console.log(`   Found ${confirmedDeposits.length} confirmed deposits`);
      
      const previousBalance = user.balance;
      const previousHasDeposited = user.hasDeposited;
      
      if (confirmedDeposits.length === 0) {
        console.log(`   ⚠️ No confirmed deposits - setting balance to $0 and hasDeposited to false`);
        user.balance = 0;
        user.hasDeposited = false;
      } else {
        const totalDeposits = confirmedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        console.log(`   Total confirmed deposits: $${totalDeposits}`);
        
        if (totalDeposits <= 10) {
          // First deposit(s) totaling $10 or less - unlocks tasks but balance remains $0
          user.balance = 0;
          user.hasDeposited = true;
          console.log(`   ✅ First deposit(s) totaling $${totalDeposits} - tasks unlocked, balance = $0`);
        } else {
          // Total deposits more than $10 - first $10 unlocks tasks, rest goes to balance
          user.balance = totalDeposits - 10;
          user.hasDeposited = true;
          console.log(`   ✅ Total deposits $${totalDeposits} - tasks unlocked, balance = $${totalDeposits} - $10 = $${user.balance}`);
        }
        
        totalDepositsProcessed += totalDeposits;
      }
      
      // Save the updated user
      await user.save();
      console.log(`   💾 User updated - New balance: $${user.balance}, hasDeposited: ${user.hasDeposited}\n`);
      
      results.push({
        username: user.username,
        userId: user._id,
        previousBalance,
        newBalance: user.balance,
        previousHasDeposited,
        newHasDeposited: user.hasDeposited,
        confirmedDeposits: confirmedDeposits.length,
        totalDepositAmount: confirmedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
      });
      
      fixedCount++;
    }
    
    console.log(`🎉 Balance fix completed successfully!`);
    console.log(`📊 Final Summary:`);
    console.log(`   Users processed: ${fixedCount}`);
    console.log(`   Total deposits processed: $${totalDepositsProcessed}`);
    console.log(`   Timestamp: ${new Date()}`);
    
    console.log('\n📋 Individual User Results:');
    results.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}:`);
      console.log(`   Previous Balance: $${user.previousBalance}`);
      console.log(`   New Balance: $${user.newBalance}`);
      console.log(`   Confirmed Deposits: ${user.confirmedDeposits}`);
      console.log(`   Total Deposit Amount: $${user.totalDepositAmount}`);
      console.log(`   Has Deposited: ${user.previousHasDeposited} → ${user.newHasDeposited}`);
      console.log('');
    });
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error fixing user balances:', error);
    
    // Try to disconnect if there's an error
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB after error');
    } catch (disconnectError) {
      console.error('Failed to disconnect:', disconnectError);
    }
    
    process.exit(1);
  }
}

// Run the balance fix
fixUserBalances();
