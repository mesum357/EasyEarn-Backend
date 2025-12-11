const http = require('http');

console.log('🔍 Testing session endpoints...\n');

// Test 1: Test session endpoint
function testSessionEndpoint() {
  console.log('🧪 Testing /test-session endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/test-session',
    method: 'GET',
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
        console.log('✅ Session test response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Session test error: ${e.message}`);
  });

  req.end();
}

// Test 2: Test debug-auth endpoint
function testDebugAuth() {
  console.log('\n🧪 Testing /debug-auth endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/debug-auth',
    method: 'GET',
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
        console.log('✅ Debug auth response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Debug auth error: ${e.message}`);
  });

  req.end();
}

// Test 3: Test debug-cookies endpoint
function testDebugCookies() {
  console.log('\n🧪 Testing /debug-cookies endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/debug-cookies',
    method: 'GET',
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
        console.log('✅ Debug cookies response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Debug cookies error: ${e.message}`);
  });

  req.end();
}

// Run all tests
setTimeout(testSessionEndpoint, 1000);
setTimeout(testDebugAuth, 2000);
setTimeout(testDebugCookies, 3000);

console.log('🚀 Starting session tests in 1 second...');
