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

const taskSchema = new mongoose.Schema({
  title: String,
  reward: Number,
  status: String
});

const taskSubmissionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  submittedAt: Date
});

const User = mongoose.model('User', userSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
const Task = mongoose.model('Task', taskSchema);
const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

async function updateBalancesWithTasks() {
  try {
    console.log('🔄 Starting balance update with task earnings...\n');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Total users found: ${users.length}\n`);
    
    let totalBalanceAdded = 0;
    let usersUpdated = 0;
    let usersUnchanged = 0;
    
    for (const user of users) {
      console.log(`🔍 Processing: ${user.username}`);
      
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
      
      // Get approved task submissions
      const approvedTasks = await TaskSubmission.find({
        userId: user._id,
        status: 'approved'
      }).populate('taskId');
      
      // Calculate base balance (deposits - withdrawals)
      let baseBalance = 0;
      if (confirmedDeposits.length > 0) {
        const totalDeposits = confirmedDeposits.reduce((sum, dep) => sum + dep.amount, 0);
        const totalWithdrawals = confirmedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
        
        // First $10 deposit doesn't count towards balance
        if (confirmedDeposits.length === 1 && totalDeposits === 10) {
          baseBalance = 0; // Only first $10 deposit
        } else {
          baseBalance = totalDeposits - 10 - totalWithdrawals; // First $10 doesn't count
        }
      }
      
      // Calculate task earnings
      const taskEarnings = approvedTasks.reduce((sum, submission) => {
        if (submission.taskId && submission.taskId.reward) {
          return sum + submission.taskId.reward;
        }
        return sum;
      }, 0);
      
      // Calculate new total balance
      const newTotalBalance = baseBalance + taskEarnings;
      
      // Check if balance needs updating
      if (Math.abs(user.balance - newTotalBalance) > 0.01) {
        const oldBalance = user.balance;
        user.balance = Math.round(newTotalBalance * 100) / 100; // Round to 2 decimal places
        await user.save();
        
        const balanceChange = user.balance - oldBalance;
        totalBalanceAdded += balanceChange;
        usersUpdated++;
        
        console.log(`   ✅ Updated balance: $${oldBalance.toFixed(2)} → $${user.balance.toFixed(2)} (+$${balanceChange.toFixed(2)})`);
        console.log(`   📊 Base Balance: $${baseBalance.toFixed(2)} (Deposits: $${confirmedDeposits.reduce((sum, dep) => sum + dep.amount, 0).toFixed(2)}, Withdrawals: $${confirmedWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)})`);
        console.log(`   🎯 Task Earnings: $${taskEarnings.toFixed(2)} (${approvedTasks.length} approved tasks)`);
      } else {
        usersUnchanged++;
        console.log(`   ✅ Balance unchanged: $${user.balance.toFixed(2)}`);
        console.log(`   📊 Base Balance: $${baseBalance.toFixed(2)} | Task Earnings: $${taskEarnings.toFixed(2)}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('📈 SUMMARY:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Users Updated: ${usersUpdated}`);
    console.log(`   Users Unchanged: ${usersUnchanged}`);
    console.log(`   Total Balance Added: $${totalBalanceAdded.toFixed(2)}`);
    console.log('\n✅ Balance update with tasks completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating balances:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateBalancesWithTasks();

