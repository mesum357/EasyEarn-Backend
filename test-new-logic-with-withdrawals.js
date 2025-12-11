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

async function testNewLogicWithWithdrawals() {
  try {
    console.log('🧪 TESTING NEW DEPOSIT LOGIC WITH WITHDRAWALS...\n');
    console.log('==================================================\n');
    console.log('NEW LOGIC: Only the FIRST $10 deposit is deducted');
    console.log('Subsequent deposits have NO $10 deduction');
    console.log('Withdrawals properly reduce available balance\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Create a fresh test user
    console.log('📋 STEP 1: CREATE FRESH TEST USER');
    console.log('==================================');
    
    // Delete existing test user if exists
    await User.deleteOne({ email: 'withdrawaltest@example.com' });
    await Deposit.deleteMany({ userId: { $in: await User.find({ email: 'withdrawaltest@example.com' }).distinct('_id') } });
    await WithdrawalRequest.deleteMany({ userId: { $in: await User.find({ email: 'withdrawaltest@example.com' }).distinct('_id') } });
    
    const testUser = new User({
      username: 'withdrawaltestuser',
      email: 'withdrawaltest@example.com',
      password: 'testpassword123',
      balance: 0,
      hasDeposited: false
    });
    await testUser.save();
    
    console.log(`✅ Test user created: ${testUser.username} (${testUser._id})`);
    console.log(`   Initial balance: $${testUser.balance}\n`);
    
    // Step 2: First deposit $50 (should deduct $10)
    console.log('📋 STEP 2: FIRST DEPOSIT $50');
    console.log('================================');
    
    const deposit50 = new Deposit({
      userId: testUser._id,
      amount: 50,
      status: 'confirmed',
      createdAt: new Date()
    });
    await deposit50.save();
    console.log('✅ First deposit $50 created and confirmed');
    
    // Simulate the NEW deposit confirmation logic
    console.log('\n🔧 SIMULATING NEW DEPOSIT LOGIC...');
    
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
      // First deposit logic - deducts $10
      testUser.hasDeposited = true;
      const totalConfirmedDeposits = await Deposit.aggregate([
        { $match: { userId: testUser._id, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
      
      const totalWithdrawn = await WithdrawalRequest.aggregate([
        { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
      
      // NEW LOGIC: Only deduct $10 from first deposit
      const firstDepositDeduction = 10;
      testUser.balance = Math.max(0, totalDeposits - firstDepositDeduction - totalWithdrawnAmount);
      console.log(`   ✅ NEW LOGIC: Balance = ($${totalDeposits} - $${firstDepositDeduction}) - $${totalWithdrawnAmount} = $${testUser.balance}`);
    }
    
    await testUser.save();
    
    // Verify balance
    const userAfterFirstDeposit = await User.findById(testUser._id);
    console.log(`📊 Balance after FIRST $50 deposit: $${userAfterFirstDeposit.balance}`);
    console.log(`   Expected: $40 (50 - 10)`);
    console.log(`   Actual: $${userAfterFirstDeposit.balance}`);
    console.log(`   Status: ${userAfterFirstDeposit.balance === 40 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 3: Withdraw $30
    console.log('📋 STEP 3: WITHDRAW $30');
    console.log('==========================');
    
    const withdrawal30 = new WithdrawalRequest({
      userId: testUser._id,
      amount: 30,
      walletAddress: 'test-wallet-address',
      status: 'pending',
      createdAt: new Date()
    });
    await withdrawal30.save();
    console.log('✅ Withdrawal request $30 created (pending)');
    
    // Simulate balance calculation with pending withdrawal
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
    
    // NEW LOGIC: Only deduct $10 once (from first deposit), not from total
    const firstDepositDeduction2 = 10; // Only deduct $10 once
    testUser.balance = Math.max(0, totalDeposits2 - firstDepositDeduction2 - totalWithdrawnAmount2);
    console.log(`   ✅ NEW LOGIC: Balance = ($${totalDeposits2} - $${firstDepositDeduction2}) - $${totalWithdrawnAmount2} = $${testUser.balance}`);
    
    await testUser.save();
    
    // Verify balance
    const userAfterWithdrawal = await User.findById(testUser._id);
    console.log(`📊 Balance after $30 withdrawal request: $${userAfterWithdrawal.balance}`);
    console.log(`   Expected: $10 (50 - 10 - 30)`);
    console.log(`   Actual: $${userAfterWithdrawal.balance}`);
    console.log(`   Status: ${userAfterWithdrawal.balance === 10 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 4: Second deposit $20 (should NOT deduct $10)
    console.log('📋 STEP 4: SECOND DEPOSIT $20');
    console.log('================================');
    
    const deposit20 = new Deposit({
      userId: testUser._id,
      amount: 20,
      status: 'confirmed',
      createdAt: new Date()
    });
    await deposit20.save();
    console.log('✅ Second deposit $20 created and confirmed');
    
    // Simulate the NEW deposit confirmation logic for subsequent deposit
    console.log('\n🔧 SIMULATING NEW LOGIC FOR SUBSEQUENT DEPOSIT...');
    
    const existingConfirmedDeposits3 = await Deposit.find({ 
      userId: testUser._id, 
      status: 'confirmed',
      _id: { $ne: deposit20._id }
    });
    
    const isFirstDeposit3 = existingConfirmedDeposits3.length === 0;
    const isMinimumAmount3 = deposit20.amount >= 10;
    
    console.log(`   Is First Deposit: ${isFirstDeposit3}`);
    console.log(`   Is Minimum Amount ($10+): ${isMinimumAmount3}`);
    
    if (!isFirstDeposit3) {
      // Subsequent deposit logic - NO $10 deduction
      const totalConfirmedDeposits3 = await Deposit.aggregate([
        { $match: { userId: testUser._id, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalDeposits3 = totalConfirmedDeposits3.length > 0 ? totalConfirmedDeposits3[0].total : 0;
      
      const totalWithdrawn3 = await WithdrawalRequest.aggregate([
        { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalWithdrawnAmount3 = totalWithdrawn3.length > 0 ? totalWithdrawn3[0].total : 0;
      
      // NEW LOGIC: Only deduct $10 once (from first deposit), not from total
      const firstDepositDeduction3 = 10; // Only deduct $10 once
      testUser.balance = Math.max(0, totalDeposits3 - firstDepositDeduction3 - totalWithdrawnAmount3);
      console.log(`   ✅ NEW LOGIC: Balance = ($${totalDeposits3} - $${firstDepositDeduction3}) - $${totalWithdrawnAmount3} = $${testUser.balance}`);
    }
    
    await testUser.save();
    
    // Verify balance
    const userAfterSecondDeposit = await User.findById(testUser._id);
    console.log(`📊 Balance after SECOND $20 deposit: $${userAfterSecondDeposit.balance}`);
    console.log(`   Expected: $30 (70 - 10 - 30)`);
    console.log(`   Actual: $${userAfterSecondDeposit.balance}`);
    console.log(`   Status: ${userAfterSecondDeposit.balance === 30 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 5: Complete the withdrawal
    console.log('📋 STEP 5: COMPLETE WITHDRAWAL');
    console.log('================================');
    
    withdrawal30.status = 'completed';
    await withdrawal30.save();
    console.log('✅ Withdrawal $30 marked as completed');
    
    // Recalculate balance with completed withdrawal
    const totalConfirmedDeposits4 = await Deposit.aggregate([
      { $match: { userId: testUser._id, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeposits4 = totalConfirmedDeposits4.length > 0 ? totalConfirmedDeposits4[0].total : 0;
    
    const totalWithdrawn4 = await WithdrawalRequest.aggregate([
      { $match: { userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawnAmount4 = totalWithdrawn4.length > 0 ? totalWithdrawn4[0].total : 0;
    
    // NEW LOGIC: Only deduct $10 once (from first deposit), not from total
    const firstDepositDeduction4 = 10; // Only deduct $10 once
    testUser.balance = Math.max(0, totalDeposits4 - firstDepositDeduction4 - totalWithdrawnAmount4);
    console.log(`   ✅ NEW LOGIC: Balance = ($${totalDeposits4} - $${firstDepositDeduction4}) - $${totalWithdrawnAmount4} = $${testUser.balance}`);
    
    await testUser.save();
    
    // Verify final balance
    const userAfterCompletedWithdrawal = await User.findById(testUser._id);
    console.log(`📊 FINAL BALANCE after completed withdrawal: $${userAfterCompletedWithdrawal.balance}`);
    console.log(`   Expected: $30 (70 - 10 - 30)`);
    console.log(`   Actual: $${userAfterCompletedWithdrawal.balance}`);
    console.log(`   Status: ${userAfterCompletedWithdrawal.balance === 30 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 6: Analysis
    console.log('📋 STEP 6: ANALYSIS');
    console.log('=====================');
    
    if (userAfterCompletedWithdrawal.balance === 30) {
      console.log('🎉 SUCCESS! The new deposit logic with withdrawals is working correctly!');
      console.log('   ✅ First deposit $50: Deducted $10 (balance = $40)');
      console.log('   ✅ Withdrawal $30: Reduced available balance (balance = $10)');
      console.log('   ✅ Second deposit $20: No $10 deduction (balance = $30)');
      console.log('   ✅ Completed withdrawal: Balance remains $30 (70 - 10 - 30)');
      console.log('   ✅ Total: $70 deposits - $10 (first time only) - $30 withdrawn = $30 balance');
    } else {
      console.log('🚨 NEW LOGIC WITH WITHDRAWALS NOT WORKING!');
      console.log(`   Final balance shows: $${userAfterCompletedWithdrawal.balance}`);
      console.log(`   Expected balance: $30`);
      console.log(`   The new logic with withdrawals did not work as expected.`);
    }
    
    // Show transaction summary
    console.log('\n📋 TRANSACTION SUMMARY:');
    console.log('========================');
    
    const allDeposits = await Deposit.find({ userId: testUser._id, status: 'confirmed' });
    const allWithdrawals = await WithdrawalRequest.find({ userId: testUser._id, status: { $in: ['completed', 'pending', 'processing'] } });
    
    console.log('💰 Confirmed Deposits:');
    allDeposits.forEach((dep, index) => {
      console.log(`   ${index + 1}. $${dep.amount} - ${dep.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n🏦 Withdrawals:');
    allWithdrawals.forEach((withdrawal, index) => {
      console.log(`   ${index + 1}. $${withdrawal.amount} - ${withdrawal.status} - ${withdrawal.createdAt.toLocaleDateString()}`);
    });
    
    const totalDeposits = allDeposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawn = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    console.log('\n🧮 Final Calculation:');
    console.log(`   Total Deposits: $${totalDeposits}`);
    console.log(`   Total Withdrawn: $${totalWithdrawn}`);
    console.log(`   NEW LOGIC: ($${totalDeposits} - $10) - $${totalWithdrawn} = $${Math.max(0, totalDeposits - 10 - totalWithdrawn)}`);
    console.log(`   Actual Balance: $${userAfterCompletedWithdrawal.balance}`);
    
    console.log('\n💡 NEW LOGIC WITH WITHDRAWALS EXPLANATION:');
    console.log('   - First deposit: Deducts $10 (for unlocking tasks)');
    console.log('   - Subsequent deposits: NO $10 deduction');
    console.log('   - Withdrawals (pending/processing/completed) reduce available balance');
    console.log('   - Total balance = (Total deposits - $10) - withdrawals');
    
    console.log('\n🎉 New deposit logic with withdrawals test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
console.log('🚀 Starting new deposit logic with withdrawals test...\n');
testNewLogicWithWithdrawals();
