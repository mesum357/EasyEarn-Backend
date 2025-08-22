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

async function fixUserBalances() {
  try {
    console.log('🔧 Starting user balance restoration...\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process\n`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`👤 Processing user: ${user.username} (${user._id})`);
        
        // Get all confirmed deposits for this user
        const confirmedDeposits = await Deposit.find({
          userId: user._id,
          status: 'confirmed'
        });

        console.log(`   💰 Found ${confirmedDeposits.length} confirmed deposits`);
        
        if (confirmedDeposits.length > 0) {
          // Calculate total confirmed deposits
          const totalDeposits = confirmedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
          
          // Calculate balance: total deposits - 10
          const newBalance = Math.max(0, totalDeposits - 10);
          
          // Check if user has deposited at least $10
          const hasDeposited = totalDeposits >= 10;
          
          console.log(`   📊 Total confirmed deposits: $${totalDeposits}`);
          console.log(`   💵 New balance: $${newBalance} (${totalDeposits} - 10)`);
          console.log(`   🔓 Has deposited: ${hasDeposited}`);
          
          // Update user
          user.balance = newBalance;
          user.hasDeposited = hasDeposited;
          
          // Generate referral code if not exists
          if (!user.referralCode) {
            user.referralCode = generateReferralCode();
            console.log(`   🎯 Generated referral code: ${user.referralCode}`);
          }
          
          await user.save();
          console.log(`   ✅ User ${user.username} updated successfully`);
          fixedCount++;
        } else {
          console.log(`   ⚠️ No confirmed deposits found - balance remains $0`);
          // Ensure hasDeposited is false for users with no deposits
          if (user.hasDeposited !== false) {
            user.hasDeposited = false;
            user.balance = 0;
            await user.save();
            console.log(`   ✅ User ${user.username} updated (no deposits)`);
            fixedCount++;
          }
        }
        
        console.log(''); // Empty line for readability
        
      } catch (error) {
        console.error(`   ❌ Error processing user ${user.username}:`, error.message);
        errorCount++;
      }
    }

    console.log('🎉 Balance restoration completed!');
    console.log(`✅ Successfully fixed: ${fixedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ Some users had errors. Check the logs above for details.');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Generate a unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run the script
fixUserBalances().catch(console.error);
