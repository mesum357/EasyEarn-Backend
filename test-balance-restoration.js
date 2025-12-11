const http = require('http');

console.log('🔧 Testing Balance Restoration Endpoint...\n');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/admin/fix-user-balances',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n✅ Balance Restoration Results:');
      console.log('================================');
      console.log('Message:', response.message);
      console.log('Users Processed:', response.summary.usersProcessed);
      console.log('Total Deposits Processed:', `$${response.summary.totalDepositsProcessed}`);
      console.log('Timestamp:', response.summary.timestamp);
      
      console.log('\n📊 Individual User Results:');
      response.results.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username}:`);
        console.log(`   Previous Balance: $${user.previousBalance}`);
        console.log(`   New Balance: $${user.newBalance}`);
        console.log(`   Confirmed Deposits: ${user.confirmedDeposits}`);
        console.log(`   Total Deposit Amount: $${user.totalDepositAmount}`);
        console.log(`   Has Deposited: ${user.previousHasDeposited} → ${user.newHasDeposited}`);
        console.log('');
      });
      
      console.log('🎉 All user balances have been restored successfully!');
      
    } catch (e) {
      console.log('❌ Parse error:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure the backend server is running on port 3005');
  console.log('2. Check if the /api/admin/fix-user-balances endpoint exists');
  console.log('3. Verify MongoDB connection is working');
});

req.end();
