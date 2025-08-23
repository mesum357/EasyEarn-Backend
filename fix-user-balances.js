require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  balance: { type: Number, default: 0 },
  hasDeposited: { type: Boolean, default: false },
  referredBy: String,
  referralCode: String,
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 }
}, { timestamps: true });

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  status: String,
  confirmedAt: Date,
  createdAt: Date
}, { timestamps: true });

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  status: String,
  createdAt: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalSchema);

async function fixUserBalances() {
  try {
    console.log('🔧 Fixing user balances according to business rules...\n');
    console.log('📋 Business Rules:');
    console.log('   - First $10 deposit: Unlocks tasks, does NOT count towards balance');
    console.log('   - Additional deposits: Count towards spendable balance');
    console.log('   - Formula: (Total Deposits - $10) - Total Withdrawals\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    let usersFixed = 0;
    let usersUnchanged = 0;
    let totalBalanceAdded = 0;

    for (const user of users) {
      console.log(`👤 Processing: ${user.username} (${user._id})`);
      console.log(`   Current Balance: $${user.balance}`);
      console.log(`   Current hasDeposited: ${user.hasDeposited}`);

      // Get all confirmed deposits for this user
      const confirmedDeposits = await Deposit.find({ 
        userId: user._id, 
        status: 'confirmed' 
      }).sort({ createdAt: 1 }); // Sort by creation date to identify first deposit

      if (confirmedDeposits.length === 0) {
        console.log(`   ❌ No confirmed deposits - skipping`);
        console.log('   ---');
        continue;
      }

      // Calculate total confirmed deposits
      const totalDeposits = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
      
      // Get total withdrawals
      const withdrawals = await WithdrawalRequest.find({ 
        userId: user._id, 
        status: { $in: ['completed', 'pending', 'processing'] } 
      });
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

      // Calculate expected balance according to business rules
      let expectedBalance = 0;
      let shouldUpdateHasDeposited = false;

      if (confirmedDeposits.length === 1 && confirmedDeposits[0].amount === 10) {
        // Single $10 deposit - unlocks tasks but no balance
        expectedBalance = 0;
        shouldUpdateHasDeposited = true;
        console.log(`   💡 Single $10 deposit: Tasks unlocked, balance = $0`);
      } else if (confirmedDeposits.length === 1 && confirmedDeposits[0].amount > 10) {
        // Single deposit > $10 - unlocks tasks and adds to balance
        expectedBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
        shouldUpdateHasDeposited = true;
        console.log(`   💡 Single deposit $${confirmedDeposits[0].amount}: Tasks unlocked, balance = $${expectedBalance}`);
      } else if (confirmedDeposits.length > 1) {
        // Multiple deposits - first $10 unlocks tasks, rest count towards balance
        expectedBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
        shouldUpdateHasDeposited = true;
        console.log(`   💡 Multiple deposits: First $10 unlocks tasks, balance = $${expectedBalance}`);
      }

      console.log(`   Total Confirmed: $${totalDeposits}`);
      console.log(`   Total Withdrawn: $${totalWithdrawn}`);
      console.log(`   Expected Balance: $${expectedBalance}`);
      console.log(`   Balance Discrepancy: $${expectedBalance - user.balance}`);

      // Check if balance needs updating
      if (Math.abs(user.balance - expectedBalance) > 0.01) { // Allow for floating point precision
        const oldBalance = user.balance;
        user.balance = expectedBalance;
        
        if (shouldUpdateHasDeposited && !user.hasDeposited) {
          user.hasDeposited = true;
          console.log(`   ✅ Updated hasDeposited: false → true`);
        }
        
        await user.save();
        
        const balanceChange = expectedBalance - oldBalance;
        totalBalanceAdded += balanceChange;
        
        console.log(`   ✅ Balance Updated: $${oldBalance} → $${expectedBalance} (${balanceChange > 0 ? '+' : ''}$${balanceChange})`);
        usersFixed++;
      } else {
        console.log(`   ✅ Balance already correct`);
        usersUnchanged++;
      }

      console.log('   ---');
    }

    console.log('\n🎉 BALANCE FIX COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   Total Users Processed: ${users.length}`);
    console.log(`   Users Fixed: ${usersFixed}`);
    console.log(`   Users Unchanged: ${usersUnchanged}`);
    console.log(`   Total Balance Added: $${totalBalanceAdded.toFixed(2)}`);
    
    if (usersFixed > 0) {
      console.log(`\n✅ Successfully fixed ${usersFixed} user balances!`);
    } else {
      console.log(`\n✅ All user balances are already correct!`);
    }

  } catch (error) {
    console.error('❌ Error fixing balances:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixUserBalances();
