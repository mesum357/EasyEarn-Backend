const { exec } = require('child_process');

console.log('🔧 Testing Balance Restoration with curl...\n');

// Test the balance fix endpoint
const curlCommand = 'curl -X POST http://localhost:3005/api/admin/fix-user-balances -H "Content-Type: application/json"';

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error executing curl:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('❌ Curl stderr:', stderr);
  }
  
  console.log('✅ Curl response:');
  console.log(stdout);
  
  try {
    const response = JSON.parse(stdout);
    console.log('\n📊 Parsed Response:');
    console.log('Message:', response.message);
    console.log('Users Processed:', response.summary.usersProcessed);
    console.log('Total Deposits Processed:', `$${response.summary.totalDepositsProcessed}`);
    
    if (response.results && response.results.length > 0) {
      console.log('\n📋 User Balance Changes:');
      response.results.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username}:`);
        console.log(`   Previous: $${user.previousBalance} → New: $${user.newBalance}`);
        console.log(`   Confirmed Deposits: ${user.confirmedDeposits}`);
        console.log(`   Total Amount: $${user.totalDepositAmount}`);
      });
    }
    
  } catch (parseError) {
    console.log('⚠️ Could not parse response as JSON');
    console.log('Raw response:', stdout);
  }
});
