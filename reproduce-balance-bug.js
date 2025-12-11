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

async function reproduceBalanceBug() {
  try {
    console.log('🐛 REPRODUCING BALANCE INCONSISTENCY BUG...\n');
    console.log('===============================================\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Step 1: Create or find test user
    console.log('📋 STEP 1: SETUP TEST USER');
    console.log('============================');
    
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('👤 Creating new test user...');
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123',
        balance: 0,
        hasDeposited: false
      });
      await testUser.save();
      console.log('✅ Test user created');
    } else {
      console.log('👤 Using existing test user');
    }
    
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Initial Balance: $${testUser.balance}`);
    console.log(`   Has Deposited: ${testUser.hasDeposited}\n`);
    
    // Clear any existing deposits/withdrawals for clean test
    console.log('🧹 Cleaning up existing transactions...');
    await Deposit.deleteMany({ userId: testUser._id });
    await WithdrawalRequest.deleteMany({ userId: testUser._id });
    console.log('✅ Existing transactions cleared\n');
    
    // Step 2: Deposit $50
    console.log('📋 STEP 2: DEPOSIT $50');
    console.log('==========================');
    
    const deposit50 = new Deposit({
      userId: testUser._id,
      amount: 50,
      status: 'confirmed',
      createdAt: new Date()
    });
    await deposit50.save();
    console.log('✅ Deposit $50 created and confirmed');
    
    // Simulate the deposit confirmation logic
    console.log('\n🔧 SIMULATING DEPOSIT CONFIRMATION LOGIC...');
    
    // Check if this is the first deposit
    const existingConfirmedDeposits = await Deposit.find({ 
      userId: testUser._id, 
      status: 'confirmed',
      _id: { $ne: deposit50._id }
    });
    
    const isFirstDeposit = existingConfirmedDeposits.length === 0;
    const isMinimumAmount = deposit50.amount >= 10;
    
    console.log(`   Is First Deposit: ${isFirstDeposit}`);
    console.log(`   Is Minimum Amount ($10+): ${isMinimumAmount}`);
    
    if (isFirstDeposit && isMinimumAmount) {
      // First deposit logic
      testUser.hasDeposited = true;
      const totalConfirmedDeposits = await Deposit.aggregate([
        { $match: { userId: testUser._id, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
      
      // Get total withdrawals
      const totalWithdrawn = await WithdrawalRequest.aggregate([
        { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
      
      testUser.balance = Math.max(0, totalDeposits - 10 - totalWithdrawnAmount);
      console.log(`   Balance Calculation: ($${totalDeposits} - $10) - $${totalWithdrawnAmount} = $${testUser.balance}`);
    }
    
    await testUser.save();
    console.log(`✅ User balance updated: $${testUser.balance}`);
    
    // Verify balance
    const userAfterDeposit = await User.findById(testUser._id);
    console.log(`📊 Balance after $50 deposit: $${userAfterDeposit.balance}`);
    console.log(`   Expected: $40 (50 - 10)`);
    console.log(`   Actual: $${userAfterDeposit.balance}`);
    console.log(`   Status: ${userAfterDeposit.balance === 40 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 3: Withdraw $50
    console.log('📋 STEP 3: WITHDRAW $50');
    console.log('===========================');
    
    const withdrawal50 = new WithdrawalRequest({
      userId: testUser._id,
      amount: 50,
      walletAddress: 'test-wallet-123',
      status: 'completed', // Mark as completed immediately for testing
      createdAt: new Date()
    });
    await withdrawal50.save();
    console.log('✅ Withdrawal $50 created and completed');
    
    // Simulate withdrawal processing logic
    console.log('\n🔧 SIMULATING WITHDRAWAL PROCESSING LOGIC...');
    
    const totalDepositsAfterWithdraw = await Deposit.aggregate([
      { $match: { userId: testUser._id, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDepositAmountAfterWithdraw = totalDepositsAfterWithdraw.length > 0 ? totalDepositsAfterWithdraw[0].total : 0;
    
    const totalWithdrawnAfterWithdraw = await WithdrawalRequest.aggregate([
      { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawnAmountAfterWithdraw = totalWithdrawnAfterWithdraw.length > 0 ? totalWithdrawnAfterWithdraw[0].total : 0;
    
    const newBalanceAfterWithdraw = Math.max(0, totalDepositAmountAfterWithdraw - 10 - totalWithdrawnAmountAfterWithdraw);
    
    console.log(`   Balance Calculation: ($${totalDepositAmountAfterWithdraw} - $10) - $${totalWithdrawnAmountAfterWithdraw} = $${newBalanceAfterWithdraw}`);
    
    testUser.balance = newBalanceAfterWithdraw;
    await testUser.save();
    
    // Verify balance
    const userAfterWithdraw = await User.findById(testUser._id);
    console.log(`📊 Balance after $50 withdrawal: $${userAfterWithdraw.balance}`);
    console.log(`   Expected: $0 (50 - 10 - 50)`);
    console.log(`   Actual: $${userAfterWithdraw.balance}`);
    console.log(`   Status: ${userAfterWithdraw.balance === 0 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 4: Deposit $10
    console.log('📋 STEP 4: DEPOSIT $10');
    console.log('==========================');
    
    const deposit10 = new Deposit({
      userId: testUser._id,
      amount: 10,
      status: 'confirmed',
      createdAt: new Date()
    });
    await deposit10.save();
    console.log('✅ Deposit $10 created and confirmed');
    
    // Simulate the deposit confirmation logic again
    console.log('\n🔧 SIMULATING SECOND DEPOSIT CONFIRMATION LOGIC...');
    
    const existingConfirmedDeposits2 = await Deposit.find({ 
      userId: testUser._id, 
      status: 'confirmed',
      _id: { $ne: deposit10._id }
    });
    
    const isFirstDeposit2 = existingConfirmedDeposits2.length === 0;
    const isMinimumAmount2 = deposit10.amount >= 10;
    
    console.log(`   Is First Deposit: ${isFirstDeposit2}`);
    console.log(`   Is Minimum Amount ($10+): ${isMinimumAmount2}`);
    
    if (!isFirstDeposit2) {
      // Subsequent deposit logic
      const totalConfirmedDeposits2 = await Deposit.aggregate([
        { $match: { userId: testUser._id, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalDeposits2 = totalConfirmedDeposits2.length > 0 ? totalConfirmedDeposits2[0].total : 0;
      
      const totalWithdrawn2 = await WithdrawalRequest.aggregate([
        { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalWithdrawnAmount2 = totalWithdrawn2.length > 0 ? totalWithdrawn2[0].total : 0;
      
      testUser.balance = Math.max(0, totalDeposits2 - 10 - totalWithdrawnAmount2);
      console.log(`   Balance Calculation: ($${totalDeposits2} - $10) - $${totalWithdrawnAmount2} = $${testUser.balance}`);
    }
    
    await testUser.save();
    
    // Verify final balance
    const userAfterSecondDeposit = await User.findById(testUser._id);
    console.log(`📊 FINAL BALANCE after $10 deposit: $${userAfterSecondDeposit.balance}`);
    console.log(`   Expected: $0 (60 - 10 - 50)`);
    console.log(`   Actual: $${userAfterSecondDeposit.balance}`);
    console.log(`   Status: ${userAfterSecondDeposit.balance === 0 ? '✅ CORRECT' : '❌ BUG REPRODUCED!'}\n`);
    
    // Step 5: Analysis
    console.log('📋 STEP 5: BUG ANALYSIS');
    console.log('==========================');
    
    if (userAfterSecondDeposit.balance !== 0) {
      console.log('🚨 BUG SUCCESSFULLY REPRODUCED!');
      console.log(`   Final balance shows: $${userAfterSecondDeposit.balance}`);
      console.log(`   Expected balance: $0`);
      console.log(`   Difference: $${userAfterSecondDeposit.balance - 0}`);
      
      console.log('\n🔍 ROOT CAUSE ANALYSIS:');
      console.log('========================');
      
      // Check all transactions
      const allDeposits = await Deposit.find({ userId: testUser._id, status: 'confirmed' });
      const allWithdrawals = await WithdrawalRequest.find({ userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } });
      
      console.log('💰 All Confirmed Deposits:');
      allDeposits.forEach((dep, index) => {
        console.log(`   ${index + 1}. $${dep.amount} - ${dep.createdAt.toLocaleDateString()}`);
      });
      
      console.log('\n🏦 All Active Withdrawals:');
      allWithdrawals.forEach((withdrawal, index) => {
        console.log(`   ${index + 1}. $${withdrawal.amount} - ${withdrawal.status} - ${withdrawal.createdAt.toLocaleDateString()}`);
      });
      
      const totalDeposits = allDeposits.reduce((sum, d) => sum + d.amount, 0);
      const totalWithdrawn = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      
      console.log('\n🧮 Transaction Summary:');
      console.log(`   Total Deposits: $${totalDeposits}`);
      console.log(`   Total Withdrawn: $${totalWithdrawn}`);
      console.log(`   Expected Balance: ($${totalDeposits} - $10) - $${totalWithdrawn} = $${Math.max(0, totalDeposits - 10 - totalWithdrawn)}`);
      console.log(`   Actual Balance: $${userAfterSecondDeposit.balance}`);
      
      console.log('\n💡 LIKELY ROOT CAUSE:');
      console.log('   The deposit confirmation logic is recalculating balance from scratch');
      console.log('   instead of properly accounting for completed withdrawals.');
      
    } else {
      console.log('✅ BUG NOT REPRODUCED - Balance calculation is working correctly');
    }
    
    console.log('\n🎉 Bug reproduction test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the reproduction test
console.log('🚀 Starting balance bug reproduction test...\n');
reproduceBalanceBug();
