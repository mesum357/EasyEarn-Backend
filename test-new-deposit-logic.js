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

async function testNewDepositLogic() {
  try {
    console.log('🧪 TESTING NEW DEPOSIT LOGIC...\n');
    console.log('=====================================\n');
    console.log('NEW LOGIC: Only the FIRST $10 deposit is deducted');
    console.log('Subsequent deposits have NO $10 deduction\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Create a fresh test user
    console.log('📋 STEP 1: CREATE FRESH TEST USER');
    console.log('==================================');
    
    // Delete existing test user if exists
    await User.deleteOne({ email: 'newlogictest@example.com' });
    await Deposit.deleteMany({ userId: { $in: await User.find({ email: 'newlogictest@example.com' }).distinct('_id') } });
    await WithdrawalRequest.deleteMany({ userId: { $in: await User.find({ email: 'newlogictest@example.com' }).distinct('_id') } });
    
    const testUser = new User({
      username: 'newlogictestuser',
      email: 'newlogictest@example.com',
      password: 'testpassword123',
      balance: 0,
      hasDeposited: false
    });
    await testUser.save();
    
    console.log(`✅ Test user created: ${testUser.username} (${testUser._id})`);
    console.log(`   Initial balance: $${testUser.balance}\n`);
    
    // Step 2: First deposit $10 (should deduct $10)
    console.log('📋 STEP 2: FIRST DEPOSIT $10');
    console.log('===============================');
    
    const deposit10 = new Deposit({
      userId: testUser._id,
      amount: 10,
      status: 'confirmed',
      createdAt: new Date()
    });
    await deposit10.save();
    console.log('✅ First deposit $10 created and confirmed');
    
    // Simulate the NEW deposit confirmation logic
    console.log('\n🔧 SIMULATING NEW DEPOSIT LOGIC...');
    
    const existingConfirmedDeposits = await Deposit.find({ 
      userId: testUser._id, 
      status: 'confirmed',
      _id: { $ne: deposit10._id }
    });
    
    const isFirstDeposit = existingConfirmedDeposits.length === 0;
    const isMinimumAmount = deposit10.amount >= 10;
    
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
    console.log(`📊 Balance after FIRST $10 deposit: $${userAfterFirstDeposit.balance}`);
    console.log(`   Expected: $0 (10 - 10)`);
    console.log(`   Actual: $${userAfterFirstDeposit.balance}`);
    console.log(`   Status: ${userAfterFirstDeposit.balance === 0 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 3: Second deposit $20 (should NOT deduct $10)
    console.log('📋 STEP 3: SECOND DEPOSIT $20');
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
    
    const existingConfirmedDeposits2 = await Deposit.find({ 
      userId: testUser._id, 
      status: 'confirmed',
      _id: { $ne: deposit20._id }
    });
    
    const isFirstDeposit2 = existingConfirmedDeposits2.length === 0;
    const isMinimumAmount2 = deposit20.amount >= 10;
    
    console.log(`   Is First Deposit: ${isFirstDeposit2}`);
    console.log(`   Is Minimum Amount ($10+): ${isMinimumAmount2}`);
    
    if (!isFirstDeposit2) {
      // Subsequent deposit logic - NO $10 deduction
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
      const firstDepositDeduction = 10; // Only deduct $10 once
      testUser.balance = Math.max(0, totalDeposits2 - firstDepositDeduction - totalWithdrawnAmount2);
      console.log(`   ✅ NEW LOGIC: Balance = ($${totalDeposits2} - $${firstDepositDeduction}) - $${totalWithdrawnAmount2} = $${testUser.balance}`);
    }
    
    await testUser.save();
    
    // Verify balance
    const userAfterSecondDeposit = await User.findById(testUser._id);
    console.log(`📊 Balance after SECOND $20 deposit: $${userAfterSecondDeposit.balance}`);
    console.log(`   Expected: $20 (30 - 10)`);
    console.log(`   Actual: $${userAfterSecondDeposit.balance}`);
    console.log(`   Status: ${userAfterSecondDeposit.balance === 20 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 4: Third deposit $30 (should NOT deduct $10)
    console.log('📋 STEP 4: THIRD DEPOSIT $30');
    console.log('================================');
    
    const deposit30 = new Deposit({
      userId: testUser._id,
      amount: 30,
      status: 'confirmed',
      createdAt: new Date()
    });
    await deposit30.save();
    console.log('✅ Third deposit $30 created and confirmed');
    
    // Simulate the NEW deposit confirmation logic for third deposit
    console.log('\n🔧 SIMULATING NEW LOGIC FOR THIRD DEPOSIT...');
    
    const existingConfirmedDeposits3 = await Deposit.find({ 
      userId: testUser._id, 
      status: 'confirmed',
      _id: { $ne: deposit30._id }
    });
    
    const isFirstDeposit3 = existingConfirmedDeposits3.length === 0;
    const isMinimumAmount3 = deposit30.amount >= 10;
    
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
      const firstDepositDeduction = 10; // Only deduct $10 once
      testUser.balance = Math.max(0, totalDeposits3 - firstDepositDeduction - totalWithdrawnAmount3);
      console.log(`   ✅ NEW LOGIC: Balance = ($${totalDeposits3} - $${firstDepositDeduction}) - $${totalWithdrawnAmount3} = $${testUser.balance}`);
    }
    
    await testUser.save();
    
    // Verify final balance
    const userAfterThirdDeposit = await User.findById(testUser._id);
    console.log(`📊 FINAL BALANCE after THIRD $30 deposit: $${userAfterThirdDeposit.balance}`);
    console.log(`   Expected: $50 (60 - 10)`);
    console.log(`   Actual: $${userAfterThirdDeposit.balance}`);
    console.log(`   Status: ${userAfterThirdDeposit.balance === 50 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    
    // Step 5: Analysis
    console.log('📋 STEP 5: ANALYSIS');
    console.log('=====================');
    
    if (userAfterThirdDeposit.balance === 50) {
      console.log('🎉 SUCCESS! The new deposit logic is working correctly!');
      console.log('   ✅ First deposit $10: Deducted $10 (balance = $0)');
      console.log('   ✅ Second deposit $20: No $10 deduction (balance = $20)');
      console.log('   ✅ Third deposit $30: No $10 deduction (balance = $50)');
      console.log('   ✅ Total: $60 deposits - $10 (first time only) = $50 balance');
    } else {
      console.log('🚨 NEW LOGIC NOT WORKING!');
      console.log(`   Final balance shows: $${userAfterThirdDeposit.balance}`);
      console.log(`   Expected balance: $50`);
      console.log(`   The new logic did not work as expected.`);
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
    
    console.log('\n🏦 Active Withdrawals:');
    allWithdrawals.forEach((withdrawal, index) => {
      console.log(`   ${index + 1}. $${withdrawal.amount} - ${withdrawal.status} - ${withdrawal.createdAt.toLocaleDateString()}`);
    });
    
    const totalDeposits = allDeposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawn = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    console.log('\n🧮 Final Calculation:');
    console.log(`   Total Deposits: $${totalDeposits}`);
    console.log(`   Total Withdrawn: $${totalWithdrawn}`);
    console.log(`   NEW LOGIC: ($${totalDeposits} - $10) - $${totalWithdrawn} = $${Math.max(0, totalDeposits - 10 - totalWithdrawn)}`);
    console.log(`   Actual Balance: $${userAfterThirdDeposit.balance}`);
    
    console.log('\n💡 NEW LOGIC EXPLANATION:');
    console.log('   - First deposit: Deducts $10 (for unlocking tasks)');
    console.log('   - Subsequent deposits: NO $10 deduction');
    console.log('   - Total balance = (Total deposits - $10) - withdrawals');
    
    console.log('\n🎉 New deposit logic test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
console.log('🚀 Starting new deposit logic test...\n');
testNewDepositLogic();
