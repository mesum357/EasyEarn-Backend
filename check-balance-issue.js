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

async function checkBalanceIssue() {
  try {
    console.log('🔍 Checking balance issue...\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    let totalUsersWithDeposits = 0;
    let totalUsersWithZeroBalance = 0;
    let totalConfirmedDeposits = 0;
    let totalPendingDeposits = 0;

    for (const user of users) {
      console.log(`👤 User: ${user.username} (${user._id})`);
      console.log(`   Current Balance: $${user.balance}`);
      console.log(`   hasDeposited: ${user.hasDeposited}`);

      // Get all deposits for this user
      const deposits = await Deposit.find({ userId: user._id });
      const confirmedDeposits = deposits.filter(d => d.status === 'confirmed');
      const pendingDeposits = deposits.filter(d => d.status === 'pending');

      console.log(`   Total Deposits: ${deposits.length}`);
      console.log(`   Confirmed: ${confirmedDeposits.length}`);
      console.log(`   Pending: ${pendingDeposits.length}`);

      if (confirmedDeposits.length > 0) {
        totalUsersWithDeposits++;
        const totalAmount = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
        totalConfirmedDeposits += totalAmount;
        console.log(`   Total Confirmed Amount: $${totalAmount}`);
        
        // Calculate expected balance
        const withdrawals = await WithdrawalRequest.find({ 
          userId: user._id, 
          status: { $in: ['completed', 'pending', 'processing'] } 
        });
        const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
        
        // First deposit deduction logic
        const firstDepositDeduction = confirmedDeposits.length > 0 ? 10 : 0;
        const expectedBalance = Math.max(0, totalAmount - firstDepositDeduction - totalWithdrawn);
        
        console.log(`   Total Withdrawn: $${totalWithdrawn}`);
        console.log(`   First Deposit Deduction: $${firstDepositDeduction}`);
        console.log(`   Expected Balance: $${expectedBalance}`);
        console.log(`   Balance Discrepancy: $${expectedBalance - user.balance}`);
      }

      if (user.balance === 0) {
        totalUsersWithZeroBalance++;
      }

      console.log('   ---');
    }

    console.log('\n📈 SUMMARY:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Users with Deposits: ${totalUsersWithDeposits}`);
    console.log(`   Users with Zero Balance: ${totalUsersWithZeroBalance}`);
    console.log(`   Total Confirmed Deposits: $${totalConfirmedDeposits}`);
    console.log(`   Total Pending Deposits: $${totalPendingDeposits}`);

    // Check if there are any confirmed deposits
    const allConfirmedDeposits = await Deposit.find({ status: 'confirmed' });
    console.log(`\n💰 Confirmed Deposits in System: ${allConfirmedDeposits.length}`);
    
    if (allConfirmedDeposits.length > 0) {
      console.log('   Sample confirmed deposits:');
      allConfirmedDeposits.slice(0, 5).forEach((deposit, index) => {
        console.log(`   ${index + 1}. User: ${deposit.userId}, Amount: $${deposit.amount}, Date: ${deposit.confirmedAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkBalanceIssue();
