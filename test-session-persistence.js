const http = require('http');

console.log('🔍 Testing Session Persistence...\n');

let sessionCookie = '';

// Test 1: First call to /test-session to create session
function testSessionCreation() {
  console.log('🧪 Test 1: Creating new session...');
  
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
    
    // Extract session cookie
    const setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader) {
      sessionCookie = setCookieHeader[0];
      console.log('🍪 Session cookie received:', sessionCookie);
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Session created:', {
          sessionID: response.sessionID,
          views: response.views,
          testValue: response.testValue,
          cookieSecure: response.cookieSecure,
          cookieSameSite: response.cookieSameSite
        });
        
        // Continue to next test
        setTimeout(testSessionPersistence, 1000);
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Session creation error: ${e.message}`);
  });

  req.end();
}

// Test 2: Second call to /test-session to test persistence
function testSessionPersistence() {
  console.log('\n🧪 Test 2: Testing session persistence...');
  
  if (!sessionCookie) {
    console.log('❌ No session cookie available for persistence test');
    return;
  }
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/test-session',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
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
        console.log('✅ Session persistence test:', {
          sessionID: response.sessionID,
          views: response.views,
          testValue: response.testValue,
          sessionData: response.sessionData
        });
        
        // Continue to next test
        setTimeout(testSessionPersistenceEndpoint, 1000);
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Session persistence error: ${e.message}`);
  });

  req.end();
}

// Test 3: Test the persistence endpoint
function testSessionPersistenceEndpoint() {
  console.log('\n🧪 Test 3: Testing persistence endpoint...');
  
  if (!sessionCookie) {
    console.log('❌ No session cookie available for persistence endpoint test');
    return;
  }
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/test-session-persistence',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
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
        console.log('✅ Persistence endpoint test:', {
          currentSessionID: response.currentSessionID,
          previousViews: response.previousViews,
          testValue: response.testValue,
          sessionKeys: response.sessionKeys,
          sessionExists: response.sessionExists
        });
        
        // Final analysis
        setTimeout(analyzeResults, 500);
      } catch (e) {
        console.log('❌ Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Persistence endpoint error: ${e.message}`);
  });

  req.end();
}

// Final analysis
function analyzeResults() {
  console.log('\n📊 Session Persistence Analysis:');
  console.log('================================');
  
  if (sessionCookie) {
    console.log('✅ Session cookie is being set');
    console.log('✅ Cookie format looks correct');
  } else {
    console.log('❌ No session cookie received');
  }
  
  console.log('\n🔧 If sessions are still not persisting, check:');
  console.log('1. MongoDB connection is stable');
  console.log('2. Session store is working');
  console.log('3. Frontend is sending cookies with requests');
  console.log('4. CORS settings allow credentials');
}

// Start the test sequence
setTimeout(testSessionCreation, 1000);
console.log('🚀 Starting session persistence tests in 1 second...');
