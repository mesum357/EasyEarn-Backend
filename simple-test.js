const axios = require('axios');

async function simpleTest() {
    console.log('Testing server connection...');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:3005/health');
        console.log('✅ Health check successful:', healthResponse.data);
        
        // Test registration endpoint
        console.log('2. Testing registration endpoint...');
        const registerResponse = await axios.post('http://localhost:3005/register', {
            username: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            email: 'test@example.com'
        });
        console.log('✅ Registration successful:', registerResponse.data);
        
    } catch (error) {
        console.error('❌ Error details:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Response headers:', error.response?.headers);
    }
}

simpleTest(); 