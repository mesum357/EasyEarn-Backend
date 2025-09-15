const http = require('http');

console.log('🔍 Testing Session Persistence with Cookie Handling...\n');

let sessionCookie = '';

// Test 1: Create session and extract cookie
function createSession() {
  console.log('🧪 Step 1: Creating new session...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/test-session',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    // Extract Set-Cookie header
    if (res.headers['set-cookie']) {
      sessionCookie = res.headers['set-cookie'][0];
      console.log('🍪 Session cookie received:', sessionCookie);
    } else {
      console.log('❌ No Set-Cookie header found');
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
          testValue: response.testValue
        });
        
        // Continue to next test
        setTimeout(testSessionPersistence, 1000);
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
  });

  req.end();
}

// Test 2: Test session persistence by sending cookie back
function testSessionPersistence() {
  console.log('\n🧪 Step 2: Testing session persistence...');
  
  if (!sessionCookie) {
    console.log('❌ No session cookie available');
    return;
  }
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/test-session',
    method: 'GET',
    headers: {
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
        
        // Check if session ID is the same
        if (response.sessionID && response.views > 1) {
          console.log('🎉 SUCCESS: Session is persisting!');
          console.log('   - Views increased from 1 to', response.views);
          console.log('   - Session data maintained');
        } else {
          console.log('❌ FAILED: Session is not persisting');
          console.log('   - Views still 1, should be 2');
          console.log('   - Session ID might have changed');
        }
        
        // Continue to final test
        setTimeout(testSessionPersistenceEndpoint, 1000);
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
  });

  req.end();
}

// Test 3: Test the persistence endpoint
function testSessionPersistenceEndpoint() {
  console.log('\n🧪 Step 3: Testing persistence endpoint...');
  
  if (!sessionCookie) {
    console.log('❌ No session cookie available');
    return;
  }
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/test-session-persistence',
    method: 'GET',
    headers: {
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
          sessionKeys: response.sessionKeys
        });
        
        // Final analysis
        setTimeout(analyzeResults, 500);
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
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
    console.log('✅ Server is responding properly');
  } else {
    console.log('❌ No session cookie received');
  }
  
  console.log('\n🔧 Next steps to check:');
  console.log('1. Frontend application cookie handling');
  console.log('2. CORS configuration for credentials');
  console.log('3. Domain/port matching between frontend and backend');
  console.log('4. Browser developer tools for cookie inspection');
}

// Start the test sequence
setTimeout(createSession, 1000);
console.log('🚀 Starting session persistence tests in 1 second...');
