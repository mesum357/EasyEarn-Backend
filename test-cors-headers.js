const https = require('https');

// Test CORS headers on the backend
const testCorsHeaders = async () => {
  const options = {
    hostname: 'easyearn-backend-production-01ac.up.railway.app',
    port: 443,
    path: '/api/test-cors',
    method: 'GET',
    headers: {
      'Origin': 'https://easyearn-adminpanel-production.up.railway.app',
      'User-Agent': 'CORS-Test-Script'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Body:', data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });

    req.end();
  });
};

// Test admin dashboard stats endpoint
const testAdminEndpoint = async () => {
  const options = {
    hostname: 'easyearn-backend-production-01ac.up.railway.app',
    port: 443,
    path: '/api/admin/dashboard-stats',
    method: 'GET',
    headers: {
      'Origin': 'https://easyearn-adminpanel-production.up.railway.app',
      'User-Agent': 'CORS-Test-Script'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('\n=== ADMIN DASHBOARD STATS TEST ===');
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Body:', data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });

    req.end();
  });
};

// Run tests
const runTests = async () => {
  try {
    console.log('🧪 Testing CORS headers...\n');
    
    console.log('=== TEST CORS ENDPOINT ===');
    await testCorsHeaders();
    
    console.log('\n=== TEST ADMIN ENDPOINT ===');
    await testAdminEndpoint();
    
    console.log('\n✅ CORS tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

runTests();
