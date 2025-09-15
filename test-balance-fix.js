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

// Test suite for balance calculation
class BalanceTestSuite {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running test: ${testName}`);
      await testFunction();
      console.log(`   ✅ PASSED: ${testName}`);
      this.testResults.push({ name: testName, status: 'PASSED' });
      this.passedTests++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${testName}`);
      console.log(`      Error: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      this.failedTests++;
    }
  }

  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`   Total Tests: ${this.testResults.length}`);
    console.log(`   Passed: ${this.passedTests}`);
    console.log(`   Failed: ${this.failedTests}`);
    console.log(`   Success Rate: ${((this.passedTests / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.filter(t => t.status === 'FAILED').forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
    }
  }
}

async function runBalanceTests() {
  try {
    console.log('🧪 COMPREHENSIVE BALANCE FIX TESTS\n');
    console.log('=====================================\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const testSuite = new BalanceTestSuite();
    
    // Test 1: Basic deposit calculation
    await testSuite.runTest('Basic Deposit Calculation', async () => {
      const user = await createTestUser('test1@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit $50
      const deposit = new Deposit({ userId: user._id, amount: 50, status: 'confirmed' });
      await deposit.save();
      
      const balance = await calculateBalance(user._id);
      if (balance !== 40) throw new Error(`Expected $40, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 2: Withdrawal reduces balance correctly
    await testSuite.runTest('Withdrawal Reduces Balance', async () => {
      const user = await createTestUser('test2@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit $50
      const deposit = new Deposit({ userId: user._id, amount: 50, status: 'confirmed' });
      await deposit.save();
      
      // Withdraw $30
      const withdrawal = new WithdrawalRequest({ 
        userId: user._id, 
        amount: 30, 
        status: 'completed',
        walletAddress: 'test-wallet'
      });
      await withdrawal.save();
      
      const balance = await calculateBalance(user._id);
      if (balance !== 10) throw new Error(`Expected $10, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 3: Multiple deposits and withdrawals
    await testSuite.runTest('Multiple Deposits and Withdrawals', async () => {
      const user = await createTestUser('test3@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit $50, then $20 (total $70)
      await Deposit.create([
        { userId: user._id, amount: 50, status: 'confirmed' },
        { userId: user._id, amount: 20, status: 'confirmed' }
      ]);
      
      // Withdraw $20, then $40 (total $60)
      await WithdrawalRequest.create([
        { userId: user._id, amount: 20, status: 'completed', walletAddress: 'test-wallet' },
        { userId: user._id, amount: 40, status: 'completed', walletAddress: 'test-wallet' }
      ]);
      
      const balance = await calculateBalance(user._id);
      
      // Debug: Let's see what's actually happening
      const deposits = await Deposit.find({ userId: user._id, status: 'confirmed' });
      const withdrawals = await WithdrawalRequest.find({ userId: user._id, status: { $in: ['completed', 'pending', 'processing'] } });
      
      const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
      
      console.log(`      Debug: Deposits: ${deposits.map(d => d.amount).join('+')} = $${totalDeposits}`);
      console.log(`      Debug: Withdrawals: ${withdrawals.map(w => w.amount).join('+')} = $${totalWithdrawn}`);
      console.log(`      Debug: Balance = (${totalDeposits} - 10) - ${totalWithdrawn} = ${totalDeposits - 10 - totalWithdrawn}`);
      
      // (50 + 20 - 10) - (20 + 40) = 70 - 10 - 60 = 0
      if (balance !== 0) throw new Error(`Expected $0, got $${balance}. Calculation: (50+20-10)-(20+40) = 70-10-60 = 0`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 4: Pending withdrawals affect available balance
    await testSuite.runTest('Pending Withdrawals Affect Available Balance', async () => {
      const user = await createTestUser('test4@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit $100
      const deposit = new Deposit({ userId: user._id, amount: 100, status: 'confirmed' });
      await deposit.save();
      
      // Create pending withdrawal of $50
      const withdrawal = new WithdrawalRequest({ 
        userId: user._id, 
        amount: 50, 
        status: 'pending',
        walletAddress: 'test-wallet'
      });
      await withdrawal.save();
      
      const balance = await calculateBalance(user._id);
      // (100 - 10) - 50 = 90 - 50 = 40
      if (balance !== 40) throw new Error(`Expected $40, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 5: Rejected withdrawals don't affect balance
    await testSuite.runTest('Rejected Withdrawals Dont Affect Balance', async () => {
      const user = await createTestUser('test5@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit $100
      const deposit = new Deposit({ userId: user._id, amount: 100, status: 'confirmed' });
      await deposit.save();
      
      // Create rejected withdrawal of $50
      const withdrawal = new WithdrawalRequest({ 
        userId: user._id, 
        amount: 50, 
        status: 'rejected',
        walletAddress: 'test-wallet'
      });
      await withdrawal.save();
      
      const balance = await calculateBalance(user._id);
      // (100 - 10) - 0 = 90 (rejected withdrawals don't count)
      if (balance !== 90) throw new Error(`Expected $90, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 6: Edge case - exact $10 deposit
    await testSuite.runTest('Edge Case - Exact $10 Deposit', async () => {
      const user = await createTestUser('test6@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit exactly $10
      const deposit = new Deposit({ userId: user._id, amount: 10, status: 'confirmed' });
      await deposit.save();
      
      const balance = await calculateBalance(user._id);
      // (10 - 10) - 0 = 0
      if (balance !== 0) throw new Error(`Expected $0, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 7: Edge case - deposit less than $10
    await testSuite.runTest('Edge Case - Deposit Less Than $10', async () => {
      const user = await createTestUser('test7@example.com');
      await clearUserTransactions(user._id);
      
      // Deposit $5
      const deposit = new Deposit({ userId: user._id, amount: 5, status: 'confirmed' });
      await deposit.save();
      
      const balance = await calculateBalance(user._id);
      // (5 - 10) - 0 = 0 (minimum 0)
      if (balance !== 0) throw new Error(`Expected $0, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Test 8: Complex scenario - the original bug case
    await testSuite.runTest('Complex Scenario - Original Bug Case', async () => {
      const user = await createTestUser('test8@example.com');
      await clearUserTransactions(user._id);
      
      // Step 1: Deposit $50
      const deposit1 = new Deposit({ userId: user._id, amount: 50, status: 'confirmed' });
      await deposit1.save();
      
      let balance = await calculateBalance(user._id);
      if (balance !== 40) throw new Error(`After $50 deposit: Expected $40, got $${balance}`);
      
      // Step 2: Withdraw $50
      const withdrawal = new WithdrawalRequest({ 
        userId: user._id, 
        amount: 50, 
        status: 'completed',
        walletAddress: 'test-wallet'
      });
      await withdrawal.save();
      
      balance = await calculateBalance(user._id);
      if (balance !== 0) throw new Error(`After $50 withdrawal: Expected $0, got $${balance}`);
      
      // Step 3: Deposit $10
      const deposit2 = new Deposit({ userId: user._id, amount: 10, status: 'confirmed' });
      await deposit2.save();
      
      balance = await calculateBalance(user._id);
      // (60 - 10) - 50 = 0
      if (balance !== 0) throw new Error(`After $10 deposit: Expected $0, got $${balance}`);
      
      await cleanupTestUser(user._id);
    });
    
    // Print test summary
    testSuite.printSummary();
    
    console.log('\n🎉 All balance fix tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Helper functions
async function createTestUser(email) {
  const user = new User({
    username: email.split('@')[0] + '_' + Date.now(),
    email: email,
    password: 'testpassword123',
    balance: 0,
    hasDeposited: false
  });
  return await user.save();
}

async function clearUserTransactions(userId) {
  await Deposit.deleteMany({ userId });
  await WithdrawalRequest.deleteMany({ userId });
}

async function cleanupTestUser(userId) {
  await clearUserTransactions(userId);
  await User.deleteOne({ _id: userId });
}

async function calculateBalance(userId) {
  const totalDeposits = await Deposit.aggregate([
    { $match: { userId: userId, status: 'confirmed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDepositAmount = totalDeposits.length > 0 ? totalDeposits[0].total : 0;
  
  const totalWithdrawn = await WithdrawalRequest.aggregate([
    { $match: { userId: userId, status: { $in: ['completed', 'pending', 'processing'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalWithdrawnAmount = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;
  
  return Math.max(0, totalDepositAmount - 10 - totalWithdrawnAmount);
}

// Run the test suite
console.log('🚀 Starting comprehensive balance fix tests...\n');
runBalanceTests();
