require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testWithdrawalSystem() {
  try {
    console.log('🧪 Testing Withdrawal System...\n');

    // 1. Test withdrawal requirements endpoint
    console.log('1. Testing /api/withdrawal-requirements...');
    try {
      const requirementsResponse = await axios.get(`${BASE_URL}/api/withdrawal-requirements`, {
        withCredentials: true
      });
      console.log('✅ Requirements Response:', requirementsResponse.data);
    } catch (error) {
      console.log('❌ Requirements Error:', error.response?.data || error.message);
    }

    // 2. Test withdrawal request endpoint
    console.log('\n2. Testing /api/withdrawal-request...');
    try {
      const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawal-request`, {
        amount: 25,
        walletAddress: 'test-wallet-address'
      }, {
        withCredentials: true
      });
      console.log('✅ Withdrawal Response:', withdrawalResponse.data);
    } catch (error) {
      console.log('❌ Withdrawal Error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      console.log('Headers:', error.response?.headers);
    }

    // 3. Test withdrawal history endpoint
    console.log('\n3. Testing /api/withdrawal-history...');
    try {
      const historyResponse = await axios.get(`${BASE_URL}/api/withdrawal-history`, {
        withCredentials: true
      });
      console.log('✅ History Response:', historyResponse.data);
    } catch (error) {
      console.log('❌ History Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithdrawalSystem(); 