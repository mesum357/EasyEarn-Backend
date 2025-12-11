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

async function verifyBalanceAccuracy() {
  try {
    console.log('🔍 Verifying balance accuracy for all users...\n');
    console.log('📋 Verification Rules:');
    console.log('   - First $10 deposit: Unlocks tasks, does NOT count towards balance');
    console.log('   - Additional deposits: Count towards spendable balance');
    console.log('   - Formula: (Total Deposits - $10) - Total Withdrawals');
    console.log('   - Balance should never be negative\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to verify\n`);

    let usersWithCorrectBalance = 0;
    let usersWithIncorrectBalance = 0;
    let usersWithNoDeposits = 0;
    let totalBalanceDiscrepancy = 0;
    let usersNeedingFix = [];

    for (const user of users) {
      console.log(`👤 Verifying: ${user.username} (${user._id})`);
      console.log(`   Current Balance: $${user.balance}`);
      console.log(`   Current hasDeposited: ${user.hasDeposited}`);

      // Get all confirmed deposits for this user
      const confirmedDeposits = await Deposit.find({ 
        userId: user._id, 
        status: 'confirmed' 
      }).sort({ createdAt: 1 }); // Sort by creation date

      if (confirmedDeposits.length === 0) {
        console.log(`   ❌ No confirmed deposits found`);
        console.log(`   Expected Balance: $0`);
        console.log(`   Expected hasDeposited: false`);
        
        if (user.balance !== 0 || user.hasDeposited !== false) {
          console.log(`   ⚠️ BALANCE ISSUE: Should be $0 and hasDeposited: false`);
          usersWithIncorrectBalance++;
          usersNeedingFix.push({
            userId: user._id,
            username: user.username,
            currentBalance: user.balance,
            expectedBalance: 0,
            currentHasDeposited: user.hasDeposited,
            expectedHasDeposited: false,
            issue: 'No deposits but has balance or hasDeposited true'
          });
        } else {
          console.log(`   ✅ Balance and hasDeposited are correct`);
          usersWithCorrectBalance++;
        }
        usersWithNoDeposits++;
        console.log('   ---');
        continue;
      }

      // Calculate total confirmed deposits
      const totalDeposits = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
      
      // Get total withdrawals (completed + pending + processing)
      const withdrawals = await WithdrawalRequest.find({ 
        userId: user._id, 
        status: { $in: ['completed', 'pending', 'processing'] } 
      });
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

      // Calculate expected balance according to business rules
      let expectedBalance = 0;
      let expectedHasDeposited = true;

      if (confirmedDeposits.length === 1 && confirmedDeposits[0].amount === 10) {
        // Single $10 deposit - unlocks tasks but no balance
        expectedBalance = 0;
        console.log(`   💡 Single $10 deposit: Tasks unlocked, balance = $0`);
      } else if (confirmedDeposits.length === 1 && confirmedDeposits[0].amount > 10) {
        // Single deposit > $10 - unlocks tasks and adds to balance
        expectedBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
        console.log(`   💡 Single deposit $${confirmedDeposits[0].amount}: Tasks unlocked, balance = $${expectedBalance}`);
      } else if (confirmedDeposits.length > 1) {
        // Multiple deposits - first $10 unlocks tasks, rest count towards balance
        expectedBalance = Math.max(0, totalDeposits - 10 - totalWithdrawn);
        console.log(`   💡 Multiple deposits: First $10 unlocks tasks, balance = $${expectedBalance}`);
      }

      console.log(`   Total Confirmed: $${totalDeposits}`);
      console.log(`   Total Withdrawn: $${totalWithdrawn}`);
      console.log(`   Expected Balance: $${expectedBalance}`);
      console.log(`   Expected hasDeposited: ${expectedHasDeposited}`);

      // Check for balance discrepancies
      const balanceDiscrepancy = Math.abs(user.balance - expectedBalance);
      const hasDepositedDiscrepancy = user.hasDeposited !== expectedHasDeposited;

      if (balanceDiscrepancy > 0.01 || hasDepositedDiscrepancy) {
        console.log(`   ⚠️ BALANCE ISSUE DETECTED!`);
        console.log(`   Balance Discrepancy: $${balanceDiscrepancy.toFixed(2)}`);
        if (hasDepositedDiscrepancy) {
          console.log(`   hasDeposited Discrepancy: ${user.hasDeposited} → ${expectedHasDeposited}`);
        }
        
        usersWithIncorrectBalance++;
        totalBalanceDiscrepancy += balanceDiscrepancy;
        
        usersNeedingFix.push({
          userId: user._id,
          username: user.username,
          currentBalance: user.balance,
          expectedBalance: expectedBalance,
          currentHasDeposited: user.hasDeposited,
          expectedHasDeposited: expectedHasDeposited,
          issue: `Balance: $${user.balance} → $${expectedBalance}, hasDeposited: ${user.hasDeposited} → ${expectedHasDeposited}`
        });
      } else {
        console.log(`   ✅ Balance and hasDeposited are correct`);
        usersWithCorrectBalance++;
      }

      console.log('   ---');
    }

    console.log('\n🎯 VERIFICATION COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Users with Correct Balance: ${usersWithCorrectBalance}`);
    console.log(`   Users with Incorrect Balance: ${usersWithIncorrectBalance}`);
    console.log(`   Users with No Deposits: ${usersWithNoDeposits}`);
    console.log(`   Total Balance Discrepancy: $${totalBalanceDiscrepancy.toFixed(2)}`);

    if (usersWithIncorrectBalance > 0) {
      console.log(`\n⚠️ ${usersWithIncorrectBalance} users need balance fixes:`);
      usersNeedingFix.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username}: ${user.issue}`);
      });
      
      console.log(`\n🔧 To fix these users, run the balance fix script again.`);
    } else {
      console.log(`\n✅ All user balances are accurate! No fixes needed.`);
    }

    // Additional verification: Check for any negative balances
    const usersWithNegativeBalance = await User.find({ balance: { $lt: 0 } });
    if (usersWithNegativeBalance.length > 0) {
      console.log(`\n❌ CRITICAL: Found ${usersWithNegativeBalance.length} users with negative balances:`);
      usersWithNegativeBalance.forEach(user => {
        console.log(`   - ${user.username}: $${user.balance}`);
      });
    } else {
      console.log(`\n✅ No users have negative balances.`);
    }

  } catch (error) {
    console.error('❌ Error verifying balances:', error);
  } finally {
    mongoose.connection.close();
  }
}

verifyBalanceAccuracy();
