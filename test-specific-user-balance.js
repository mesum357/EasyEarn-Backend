require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./React Websitee/pak-nexus/backend/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Deposit Schema (copy from app.js)
const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    required: false
  },
  receiptUrl: {
    type: String,
    required: false
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date
});

const Deposit = mongoose.model('Deposit', depositSchema);

async function testUserBalance(email) {
  try {
    console.log(`🔍 Testing balance calculation for user: ${email}\n`);

    // Find the user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`👤 User found: ${user.username} (${user._id})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`💰 Current Balance: $${user.balance}`);
    console.log(`🔓 Has Deposited: ${user.hasDeposited}`);
    console.log(`🎯 Referral Code: ${user.referralCode || 'Not set'}`);
    console.log('');

    // Get all deposits for this user
    const allDeposits = await Deposit.find({ userId: user._id });
    console.log(`📊 Total deposits found: ${allDeposits.length}`);

    if (allDeposits.length > 0) {
      console.log('\n📋 All Deposits:');
      allDeposits.forEach((deposit, index) => {
        console.log(`   ${index + 1}. Amount: $${deposit.amount} | Status: ${deposit.status} | Date: ${deposit.createdAt.toLocaleDateString()}`);
      });

      // Get confirmed deposits only
      const confirmedDeposits = allDeposits.filter(deposit => deposit.status === 'confirmed');
      console.log(`\n✅ Confirmed deposits: ${confirmedDeposits.length}`);

      if (confirmedDeposits.length > 0) {
        const totalConfirmed = confirmedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        const expectedBalance = Math.max(0, totalConfirmed - 10);
        const hasDeposited = totalConfirmed >= 10;

        console.log(`📊 Total confirmed amount: $${totalConfirmed}`);
        console.log(`💵 Expected balance: $${expectedBalance} (${totalConfirmed} - 10)`);
        console.log(`🔓 Should have deposited: ${hasDeposited}`);
        console.log('');

        // Check if current balance matches expected
        if (user.balance === expectedBalance) {
          console.log(`✅ BALANCE IS CORRECT: Current balance $${user.balance} matches expected $${expectedBalance}`);
        } else {
          console.log(`❌ BALANCE MISMATCH: Current balance $${user.balance} does NOT match expected $${expectedBalance}`);
        }

        if (user.hasDeposited === hasDeposited) {
          console.log(`✅ HAS DEPOSITED FLAG IS CORRECT: ${user.hasDeposited}`);
        } else {
          console.log(`❌ HAS DEPOSITED FLAG MISMATCH: Current ${user.hasDeposited}, should be ${hasDeposited}`);
        }
      } else {
        console.log('⚠️ No confirmed deposits found');
        console.log(`💰 Expected balance: $0`);
        console.log(`🔓 Should have deposited: false`);
      }
    } else {
      console.log('⚠️ No deposits found for this user');
      console.log(`💰 Expected balance: $0`);
      console.log(`🔓 Should have deposited: false`);
    }

    console.log('\n🔍 Balance calculation logic:');
    console.log('   - First $10 deposit unlocks tasks but doesn\'t add to balance');
    console.log('   - Subsequent deposits add to balance normally');
    console.log('   - Final balance = Total confirmed deposits - 10');
    console.log('   - hasDeposited = true if total deposits >= $10');

  } catch (error) {
    console.error('❌ Error testing user balance:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Test the specific user
const testEmail = 'massux357@gmail.com';
testUserBalance(testEmail).catch(console.error);
