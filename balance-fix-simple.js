// Simple balance fix that can be run when the server is already running
// This script will make an HTTP request to the balance fix endpoint

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/admin/fix-balances',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 0
  }
};

console.log('🚀 Calling balance fix endpoint...');
console.log('📍 URL: http://localhost:3005/api/admin/fix-balances');

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
        console.log('✅ Balance fix completed successfully!');
        console.log('📊 Summary:');
        console.log(`   Total users: ${response.summary.totalUsers}`);
        console.log(`   Users updated: ${response.summary.usersUpdated}`);
        console.log(`   Tasks unlocked: ${response.summary.tasksUnlocked}`);
        console.log(`   Total system balance: $${response.summary.totalSystemBalance}`);
        
        if (response.results && response.results.length > 0) {
          console.log('\n📋 Updated users:');
          response.results.filter(r => r.updated).forEach(result => {
            console.log(`   ${result.username}: $${result.oldBalance} → $${result.newBalance}`);
          });
        }
      } else {
        console.error('❌ Balance fix failed:', response.error);
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
