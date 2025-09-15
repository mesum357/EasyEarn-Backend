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
  screenshot: String,
  createdAt: Date
});

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  status: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

async function checkUserBalances() {
  try {
    const emails = [
      'oppo@gmail.com',
      'zoya@gmail.com', 
      'shomi@gmail.com',
      'moon@gmail.com',
      'nomi@gmail.com',
      'cool@gmail.com',
      'reno@gmail.com',
      'play@gmail.com',
      'mano@gmail.com',
      'shadow@gmail.com',
      'hunter@gmail.com',
      'tecno@gmail.com'
    ];

    console.log('🔍 Checking balances for specific users...\n');

    for (const email of emails) {
      const user = await User.findOne({ username: email });
      
      if (!user) {
        console.log(`❌ ${email}: User not found`);
        continue;
      }

      // Get confirmed deposits
      const confirmedDeposits = await Deposit.find({
        userId: user._id,
        status: 'confirmed'
      }).sort({ createdAt: 1 });

      // Get confirmed withdrawals
      const confirmedWithdrawals = await Withdrawal.find({
        userId: user._id,
        status: 'confirmed'
      });

      // Calculate expected balance
      let expectedBalance = 0;
      if (confirmedDeposits.length > 0) {
        // First $10 deposit doesn't count towards balance
        const totalDeposits = confirmedDeposits.reduce((sum, dep) => sum + dep.amount, 0);
        const totalWithdrawals = confirmedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
        
        if (confirmedDeposits.length === 1 && totalDeposits === 10) {
          expectedBalance = 0; // Only first $10 deposit
        } else {
          expectedBalance = totalDeposits - 10 - totalWithdrawals; // First $10 doesn't count
        }
      }

      // Get referral earnings
      const referralEarnings = user.referralEarnings || 0;

      console.log(`📧 ${email}:`);
      console.log(`   Current Balance: $${user.balance.toFixed(2)}`);
      console.log(`   Expected Balance: $${expectedBalance.toFixed(2)}`);
      console.log(`   Has Deposited: ${user.hasDeposited}`);
      console.log(`   Referral Earnings: $${referralEarnings.toFixed(2)}`);
      console.log(`   Confirmed Deposits: ${confirmedDeposits.length} (Total: $${confirmedDeposits.reduce((sum, dep) => sum + dep.amount, 0).toFixed(2)})`);
      console.log(`   Confirmed Withdrawals: ${confirmedWithdrawals.length} (Total: $${confirmedWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)})`);
      
      if (confirmedDeposits.length > 0) {
        console.log(`   Deposit Details:`);
        confirmedDeposits.forEach((dep, index) => {
          console.log(`     ${index + 1}. $${dep.amount} - ${dep.status} - ${dep.createdAt.toLocaleDateString()}`);
        });
      }
      
      if (confirmedWithdrawals.length > 0) {
        console.log(`   Withdrawal Details:`);
        confirmedWithdrawals.forEach((w, index) => {
          console.log(`     ${index + 1}. $${w.amount} - ${w.status} - ${w.createdAt.toLocaleDateString()}`);
        });
      }

      // Check if balance is correct
      if (Math.abs(user.balance - expectedBalance) < 0.01) {
        console.log(`   ✅ Balance is correct`);
      } else {
        console.log(`   ❌ Balance mismatch! Expected: $${expectedBalance.toFixed(2)}, Current: $${user.balance.toFixed(2)}`);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('✅ Balance check completed for all specified users');
    
  } catch (error) {
    console.error('❌ Error checking user balances:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUserBalances();


