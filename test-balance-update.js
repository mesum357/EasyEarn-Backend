const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testBalanceUpdate() {
  try {
    console.log('🧪 Testing balance update endpoint...\n');

    // First, get a list of users to find one to test with
    console.log('1. Fetching users list...');
    const usersResponse = await axios.get(`${BASE_URL}/api/admin/users?page=1&limit=5`);
    const users = usersResponse.data.users;
    
    if (users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.username} (ID: ${testUser._id})`);
    console.log(`   Current balance: $${testUser.balance || 0}`);

    // Test updating the balance
    const newBalance = 150.50;
    console.log(`\n2. Updating balance to $${newBalance}...`);
    
    const updateResponse = await axios.put(`${BASE_URL}/api/admin/users/${testUser._id}/balance`, {
      balance: newBalance
    });

    if (updateResponse.data.success) {
      console.log('✅ Balance updated successfully!');
      console.log(`   Response:`, updateResponse.data);
    } else {
      console.log('❌ Failed to update balance');
      console.log(`   Response:`, updateResponse.data);
    }

    // Verify the update by fetching the user again
    console.log('\n3. Verifying the update...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/admin/users?page=1&limit=5`);
    const updatedUsers = verifyResponse.data.users;
    const updatedUser = updatedUsers.find(u => u._id === testUser._id);
    
    if (updatedUser && updatedUser.balance === newBalance) {
      console.log('✅ Balance update verified!');
      console.log(`   New balance: $${updatedUser.balance}`);
    } else {
      console.log('❌ Balance update verification failed');
      console.log(`   Expected: $${newBalance}, Got: $${updatedUser?.balance}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    if (error.code) {
      console.error('   Code:', error.code);
    }
  }
}

// Test invalid balance
async function testInvalidBalance() {
  try {
    console.log('\n🧪 Testing invalid balance input...\n');

    const usersResponse = await axios.get(`${BASE_URL}/api/admin/users?page=1&limit=1`);
    const testUser = usersResponse.data.users[0];
    
    if (!testUser) {
      console.log('❌ No users found to test with');
      return;
    }

    // Test negative balance
    console.log('1. Testing negative balance...');
    try {
      await axios.put(`${BASE_URL}/api/admin/users/${testUser._id}/balance`, {
        balance: -10
      });
      console.log('❌ Should have rejected negative balance');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected negative balance');
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error for negative balance:', error.response?.data);
      }
    }

    // Test non-numeric balance
    console.log('\n2. Testing non-numeric balance...');
    try {
      await axios.put(`${BASE_URL}/api/admin/users/${testUser._id}/balance`, {
        balance: "invalid"
      });
      console.log('❌ Should have rejected non-numeric balance');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected non-numeric balance');
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error for non-numeric balance:', error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Invalid balance test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    if (error.code) {
      console.error('   Code:', error.code);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting balance update endpoint tests...\n');
  
  await testBalanceUpdate();
  await testInvalidBalance();
  
  console.log('\n✨ Tests completed!');
}

runTests();
