const axios = require('axios');

async function testWithdrawalEndpoint() {
  try {
    console.log('🧪 TESTING ADMIN WITHDRAWAL REQUESTS ENDPOINT...\n');
    
    const baseURL = 'http://localhost:3005';
    const endpoint = '/api/admin/withdrawal-requests';
    
    console.log(`📍 Testing endpoint: ${baseURL}${endpoint}`);
    console.log('=====================================\n');
    
    // Test GET request
    console.log('📤 Sending GET request...');
    const response = await axios.get(`${baseURL}${endpoint}`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response received successfully!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Withdrawal Requests Count: ${response.data.withdrawalRequests?.length || 0}`);
    
    if (response.data.withdrawalRequests && response.data.withdrawalRequests.length > 0) {
      console.log('\n📋 SAMPLE WITHDRAWAL REQUEST:');
      const sample = response.data.withdrawalRequests[0];
      console.log(`   ID: ${sample.id}`);
      console.log(`   User: ${sample.user.username} (${sample.user.email})`);
      console.log(`   Amount: $${sample.amount}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Wallet: ${sample.walletAddress}`);
    }
    
    console.log('\n🎉 Endpoint test completed successfully!');
    
    } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received');
      console.error('   Request details:', error.request);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Make sure the backend is running on port 3005');
    console.error('   2. Check if there are any CORS issues');
    console.error('   3. Verify the endpoint URL is correct');
  }
}

// Run the test
console.log('🚀 Starting withdrawal endpoint test...\n');
testWithdrawalEndpoint(); 