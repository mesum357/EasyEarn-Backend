const http = require('http');

console.log('🔍 Simple Session Test...\n');

// Test session creation
const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/test-session',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n✅ Session Response:');
      console.log('Session ID:', response.sessionID);
      console.log('Views:', response.views);
      console.log('Cookie Secure:', response.cookieSecure);
      console.log('Cookie SameSite:', response.cookieSameSite);
      console.log('Test Value:', response.testValue);
      
      // Check if Set-Cookie header is present
      if (res.headers['set-cookie']) {
        console.log('\n🍪 Set-Cookie header found:', res.headers['set-cookie']);
      } else {
        console.log('\n❌ No Set-Cookie header found');
      }
      
    } catch (e) {
      console.log('❌ Parse error:', e.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.end();
