const axios = require('axios');

async function testBackendConnectivity() {
  console.log('🔍 Testing Backend Connectivity...\n');

  // Test different common ports
  const ports = [3000, 3005, 8080, 5000];
  
  for (const port of ports) {
    console.log(`Testing port ${port}...`);
    try {
      const response = await axios.get(`http://localhost:${port}/health`, {
        timeout: 3000
      });
      console.log(`✅ Backend found on port ${port}!`);
      console.log('Response:', response.data);
      return port;
    } catch (error) {
      console.log(`❌ Port ${port} not accessible: ${error.message}`);
    }
  }
  
  console.log('❌ Backend not found on any common ports');
  return null;
}

testBackendConnectivity(); 