const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/health',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:8080',
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Testing backend accessibility from browser perspective...');
console.log('Testing connection to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log('✅ Backend is accessible!');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    console.log('🎉 Backend connection test successful!');
  });
});

req.on('error', (error) => {
  console.error('❌ Backend connection failed:', error.message);
  console.error('Error code:', error.code);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('💡 This means the backend server is not running or not accessible on port 3005');
  }
});

req.setTimeout(5000, () => {
  console.error('⏰ Request timed out after 5 seconds');
  req.destroy();
});

req.end(); 