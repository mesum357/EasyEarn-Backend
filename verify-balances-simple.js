const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/admin/verify-balances',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Calling balance verification endpoint...');
console.log('📍 URL: http://localhost:3005/api/admin/verify-balances');

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`📡 Response status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Balance verification completed successfully!');
        console.log('\n📊 SUMMARY:');
        console.log(`   Total users: ${response.summary.totalUsers}`);
        console.log(`   Correct balances: ${response.summary.correctBalances}`);
        console.log(`   Incorrect balances: ${response.summary.incorrectBalances}`);
        console.log(`   Accuracy: ${response.summary.accuracy}`);
        console.log('');
        
        console.log('💰 SYSTEM TOTALS:');
        console.log(`   Total System Balance: $${response.summary.totalSystemBalance}`);
        console.log(`   Total Deposits: $${response.summary.totalDeposits}`);
        console.log(`   Total Task Rewards: $${response.summary.totalTaskRewards}`);
        console.log(`   Total Withdrawals: $${response.summary.totalWithdrawals}`);
        console.log('');
        
        if (response.issues && response.issues.length > 0) {
          console.log('❌ BALANCE ISSUES FOUND:');
          console.log('========================');
          response.issues.forEach((issue, index) => {
            console.log(`\n${index + 1}. ${issue.username} (${issue.email})`);
            console.log(`   Actual: $${issue.actualBalance}`);
            console.log(`   Expected: $${issue.expectedBalance}`);
            console.log(`   Difference: $${issue.difference.toFixed(4)}`);
            console.log(`   Deposits: $${issue.totalDeposits}, Tasks: $${issue.totalTaskRewards}, Withdrawals: $${issue.totalWithdrawn}`);
          });
        } else {
          console.log('✅ ALL BALANCES ARE CORRECT!');
        }
        
        // Show some examples of users with balances
        console.log('\n📋 SAMPLE USERS WITH BALANCES:');
        console.log('================================');
        const usersWithBalances = response.userDetails.filter(u => u.expectedBalance > 0).slice(0, 10);
        usersWithBalances.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username} (${user.email})`);
          console.log(`   Balance: $${user.actualBalance} (${user.isCorrect ? '✅' : '❌'})`);
          console.log(`   Deposits: $${user.totalDeposits}, Tasks: $${user.totalTaskRewards}, Withdrawals: $${user.totalWithdrawn}`);
          console.log(`   Deposit Contribution: $${user.depositContribution} (${user.totalDeposits} - 10)`);
          console.log('');
        });
        
      } else {
        console.error('❌ Balance verification failed:', response.error);
        if (response.details) {
          console.error('Details:', response.details);
        }
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('💡 Make sure the server is running on port 3005');
});

req.end();
