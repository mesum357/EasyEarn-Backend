const https = require('https');

const baseURL = 'https://easyearn-backend-production-01ac.up.railway.app';
const frontendOrigin = 'https://kingeasyearn.com';

// Function to make HTTP requests with cookies
function makeRequest(path, method = 'GET', body = null, cookies = '') {
    return new Promise((resolve, reject) => {
        const url = new URL(baseURL + path);
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Origin': frontendOrigin,
                'Referer': frontendOrigin + '/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Content-Type': method === 'POST' ? 'application/json' : undefined,
                'Cookie': cookies
            }
        };

        // Remove undefined headers
        Object.keys(options.headers).forEach(key => {
            if (options.headers[key] === undefined) {
                delete options.headers[key];
            }
        });

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    cookies: res.headers['set-cookie'] || []
                });
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// Function to extract cookies from Set-Cookie headers
function extractCookies(setCookieHeaders) {
    if (!setCookieHeaders || setCookieHeaders.length === 0) return '';
    
    return setCookieHeaders.map(cookie => {
        return cookie.split(';')[0];
    }).join('; ');
}

async function testCompleteAuthFlow() {
    console.log('🧪 Testing Complete Authentication Flow\n');
    
    let sessionCookies = '';
    
    try {
        // Step 1: Get initial session
        console.log('1️⃣ Getting initial session...');
        const healthResponse = await makeRequest('/health');
        sessionCookies = extractCookies(healthResponse.cookies);
        console.log(`   Status: ${healthResponse.statusCode}`);
        console.log(`   Session cookies: ${sessionCookies || 'None'}`);
        console.log('');
        
        // Step 2: Test /me before login (should be 401)
        console.log('2️⃣ Testing /me before login...');
        const meResponse1 = await makeRequest('/me', 'GET', null, sessionCookies);
        console.log(`   Status: ${meResponse1.statusCode} (Expected: 401)`);
        
        // Update cookies from this response
        const newCookies = extractCookies(meResponse1.cookies);
        if (newCookies) {
            sessionCookies = newCookies;
        }
        console.log('');
        
        // Step 3: Attempt login with test credentials
        console.log('3️⃣ Testing login with test credentials...');
        const loginBody = {
            username: 'test@example.com',
            password: 'testpassword'
        };
        
        const loginResponse = await makeRequest('/login', 'POST', loginBody, sessionCookies);
        console.log(`   Status: ${loginResponse.statusCode}`);
        console.log(`   Body: ${loginResponse.body}`);
        
        // Update cookies from login response
        const loginCookies = extractCookies(loginResponse.cookies);
        if (loginCookies) {
            sessionCookies = loginCookies;
            console.log(`   Updated cookies: ${sessionCookies}`);
        }
        console.log('');
        
        // Step 4: Test /me after login attempt
        console.log('4️⃣ Testing /me after login attempt...');
        const meResponse2 = await makeRequest('/me', 'GET', null, sessionCookies);
        console.log(`   Status: ${meResponse2.statusCode}`);
        console.log(`   Body: ${meResponse2.body}`);
        console.log('');
        
        // Step 5: Test debug endpoints to understand session state
        console.log('5️⃣ Testing session debug...');
        const debugResponse = await makeRequest('/debug/session', 'GET', null, sessionCookies);
        console.log(`   Status: ${debugResponse.statusCode}`);
        
        try {
            const debugData = JSON.parse(debugResponse.body);
            console.log(`   Session ID: ${debugData.sessionID}`);
            console.log(`   Is Authenticated: ${debugData.isAuthenticated}`);
            console.log(`   Has User: ${debugData.user ? 'Yes' : 'No'}`);
        } catch (e) {
            console.log(`   Raw debug response: ${debugResponse.body}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteAuthFlow();
