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
        // Extract just the name=value part
        return cookie.split(';')[0];
    }).join('; ');
}

async function testAuthFlow() {
    console.log('🧪 Testing Frontend Authentication Flow\n');
    
    try {
        // Step 1: Call /me without authentication
        console.log('1️⃣ Testing /me endpoint without authentication...');
        const meResponse1 = await makeRequest('/me');
        console.log(`   Status: ${meResponse1.statusCode}`);
        console.log(`   Body: ${meResponse1.body}`);
        
        // Check for cookies
        const initialCookies = extractCookies(meResponse1.cookies);
        console.log(`   Cookies received: ${initialCookies || 'None'}`);
        console.log('');
        
        // Step 2: Call debug-auth to see session details
        console.log('2️⃣ Testing debug-auth endpoint...');
        const debugResponse = await makeRequest('/debug-auth', 'GET', null, initialCookies);
        console.log(`   Status: ${debugResponse.statusCode}`);
        
        try {
            const debugData = JSON.parse(debugResponse.body);
            console.log(`   Session ID: ${debugData.sessionID || 'None'}`);
            console.log(`   Has Session: ${debugData.hasSession}`);
            console.log(`   Cookies Present: ${debugData.cookies !== 'no cookies in request'}`);
            console.log(`   Origin: ${debugData.origin}`);
        } catch (e) {
            console.log(`   Raw response: ${debugResponse.body}`);
        }
        console.log('');
        
        // Step 3: Test with cookies from debug-auth
        const debugCookies = extractCookies(debugResponse.cookies);
        const allCookies = [initialCookies, debugCookies].filter(Boolean).join('; ');
        
        console.log('3️⃣ Testing /me with accumulated cookies...');
        const meResponse2 = await makeRequest('/me', 'GET', null, allCookies);
        console.log(`   Status: ${meResponse2.statusCode}`);
        console.log(`   Body: ${meResponse2.body}`);
        console.log(`   Using cookies: ${allCookies || 'None'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthFlow();
