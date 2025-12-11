const http = require('http');

const API_BASE = 'http://localhost:3005';

async function testAPIEndpoint() {
    console.log('🧪 Testing Plus/Minus Balance API Endpoint...\n');
    
    // First, get a user to test with
    const users = await makeRequest('GET', '/api/admin/users?page=1&limit=1');
    if (!users || !users.users || users.users.length === 0) {
        console.error('❌ No users found for testing');
        return;
    }
    
    const testUser = users.users[0];
    console.log(`👤 Test User: ${testUser.username} (${testUser._id})`);
    console.log(`   Current Balance: $${testUser.balance || 0}\n`);
    
    // Test scenarios
    const testScenarios = [
        { operation: 'add', amount: 10, description: 'Add $10' },
        { operation: 'add', amount: 25, description: 'Add $25' },
        { operation: 'subtract', amount: 15, description: 'Subtract $15' },
        { operation: 'subtract', amount: 5, description: 'Subtract $5' },
        { operation: 'add', amount: 50, description: 'Add $50' },
        { operation: 'subtract', amount: 30, description: 'Subtract $30' }
    ];
    
    let currentBalance = testUser.balance || 0;
    
    for (const scenario of testScenarios) {
        console.log(`💰 Testing: ${scenario.description}`);
        console.log(`   Current Balance: $${currentBalance}`);
        
        try {
            const response = await makeRequest('PUT', `/api/admin/users/${testUser._id}/balance`, {
                amount: scenario.amount,
                operation: scenario.operation
            });
            
            if (response.success) {
                console.log(`   ${scenario.operation === 'add' ? '+' : '-'}$${scenario.amount} = $${response.newBalance}`);
                console.log(`   ✅ API Response: ${response.message}`);
                currentBalance = response.newBalance;
            } else {
                console.log(`   ❌ API Error: ${response.error}`);
            }
        } catch (error) {
            console.log(`   ❌ Request Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎯 Final Results:');
    console.log(`   Final Balance: $${currentBalance}`);
    console.log(`   Original Balance: $${testUser.balance || 0}`);
    console.log(`   Net Change: $${currentBalance - (testUser.balance || 0)}`);
    
    console.log('\n✅ Plus/Minus Balance API Test Completed!');
}

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3005,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Run the test
testAPIEndpoint().catch(console.error);
