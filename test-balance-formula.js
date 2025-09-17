#!/usr/bin/env node

/**
 * Test Balance Formula
 * 
 * This script tests the balance calculation formula with various scenarios
 * to ensure it's working correctly.
 */

console.log('🧪 Testing Balance Calculation Formula');
console.log('=====================================\n');

// Test the balance calculation formula
function calculateBalance(totalDeposits, totalTaskRewards, totalWithdrawn) {
  // Calculate balance: (deposits - $10) + task rewards - withdrawals
  const depositContribution = Math.max(0, totalDeposits - 10);
  const balance = Math.max(0, depositContribution + totalTaskRewards - totalWithdrawn);
  
  return {
    balance,
    depositContribution,
    totalDeposits,
    totalTaskRewards,
    totalWithdrawn
  };
}

// Test cases
const testCases = [
  {
    name: "First $10 deposit (unlocks tasks, no balance)",
    deposits: 10,
    taskRewards: 0,
    withdrawals: 0,
    expected: 0
  },
  {
    name: "First $10 deposit + task rewards",
    deposits: 10,
    taskRewards: 5,
    withdrawals: 0,
    expected: 5
  },
  {
    name: "Multiple deposits beyond $10",
    deposits: 50,
    taskRewards: 0,
    withdrawals: 0,
    expected: 40
  },
  {
    name: "Deposits + task rewards + withdrawals",
    deposits: 100,
    taskRewards: 20,
    withdrawals: 30,
    expected: 80
  },
  {
    name: "User with only task rewards",
    deposits: 0,
    taskRewards: 15,
    withdrawals: 0,
    expected: 15
  },
  {
    name: "User with withdrawals exceeding balance",
    deposits: 20,
    taskRewards: 5,
    withdrawals: 30,
    expected: 0
  },
  {
    name: "Complex scenario",
    deposits: 80,
    taskRewards: 25,
    withdrawals: 60,
    expected: 35
  }
];

console.log('Running test cases...\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = calculateBalance(testCase.deposits, testCase.taskRewards, testCase.withdrawals);
  const passed = Math.abs(result.balance - testCase.expected) < 0.01;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: Deposits=$${testCase.deposits}, Tasks=$${testCase.taskRewards}, Withdrawals=$${testCase.withdrawals}`);
  console.log(`  Expected: $${testCase.expected}`);
  console.log(`  Actual: $${result.balance}`);
  console.log(`  Deposit Contribution: $${result.depositContribution} (${testCase.deposits} - 10)`);
  console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (passed) passedTests++;
});

console.log('📊 TEST RESULTS:');
console.log(`   Total Tests: ${totalTests}`);
console.log(`   Passed: ${passedTests}`);
console.log(`   Failed: ${totalTests - passedTests}`);
console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

if (passedTests === totalTests) {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('   The balance calculation formula is working correctly.');
} else {
  console.log('❌ SOME TESTS FAILED!');
  console.log('   Please check the balance calculation logic.');
}

console.log('\n📝 FORMULA EXPLANATION:');
console.log('   Balance = max(0, (Total Deposits - $10) + Task Rewards - Total Withdrawals)');
console.log('   • First $10 deposit unlocks tasks but doesn\'t contribute to balance');
console.log('   • Additional deposits beyond $10 add to balance');
console.log('   • Task rewards are added when tasks are approved');
console.log('   • Withdrawals deduct from available balance');
console.log('   • Balance cannot go below $0');
