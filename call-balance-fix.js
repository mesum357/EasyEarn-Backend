const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3005';
const ENDPOINT = '/api/admin/fix-balances';

async function callBalanceFix() {
  try {
    console.log('🚀 Calling balance fix endpoint...');
    console.log(`📍 URL: ${API_BASE_URL}${ENDPOINT}`);
    
    const url = new URL(API_BASE_URL + ENDPOINT);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
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
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Error calling balance fix:', error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const url = new URL(API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      console.log('✅ Server is running, proceeding with balance fix...');
      callBalanceFix();
    });

    req.on('error', (error) => {
      console.log('⚠️  Server not responding, but trying balance fix anyway...');
      callBalanceFix();
    });

    req.on('timeout', () => {
      console.log('⚠️  Server timeout, but trying balance fix anyway...');
      callBalanceFix();
    });

    req.end();
    
  } catch (error) {
    console.log('⚠️  Could not check server status, trying balance fix anyway...');
    callBalanceFix();
  }
}

console.log('🔍 Checking if server is running...');
checkServer();
