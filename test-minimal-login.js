const mongoose = require('mongoose');
require('dotenv').config();

async function testMinimalLogin() {
    console.log('🔍 Testing Minimal Login Flow');
    console.log('==============================');
    
    try {
        // Connect to MongoDB
        console.log('\n1. Connecting to MongoDB...');
        const mongoURI = process.env.MONGODB_URI;
        const mongooseOptions = {};
        
        if (process.env.NODE_ENV === 'production') {
            mongooseOptions.ssl = true;
            mongooseOptions.tls = true;
            mongooseOptions.tlsAllowInvalidCertificates = true;
            mongooseOptions.tlsAllowInvalidHostnames = true;
        }
        
        await mongoose.connect(mongoURI, mongooseOptions);
        console.log('✅ Connected to MongoDB');
        
        // Import User model
        console.log('\n2. Testing User model...');
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        console.log('✅ User model imported successfully');
        
        // Test with the user from the frontend logs
        const testEmail = 'ishaqyash333@gmail.com';
        console.log(`\n3. Testing with user: ${testEmail}`);
        
        // Find the user
        const testUser = await User.findOne({ 
            $or: [
                { username: testEmail },
                { email: testEmail }
            ]
        });
        
        if (!testUser) {
            console.log('❌ Test user not found');
            console.log('   This user does not exist in the database');
            console.log('   The frontend is trying to login with a non-existent user');
            return;
        }
        
        console.log('✅ Test user found:');
        console.log('   ID:', testUser._id);
        console.log('   Username:', testUser.username);
        console.log('   Email:', testUser.email);
        console.log('   Verified:', testUser.verified);
        console.log('   Has authenticate method:', typeof testUser.authenticate === 'function');
        
        // Test password authentication
        console.log('\n4. Testing password authentication...');
        const testPassword = '123456'; // Assuming this is the password
        console.log('   Testing password:', testPassword);
        
        try {
            const result = await testUser.authenticate(testPassword);
            console.log('   Authentication result:', result);
            
            if (result.user) {
                console.log('✅ Password authentication successful!');
                console.log('   Authenticated user:', result.user.username);
            } else {
                console.log('❌ Password authentication failed');
                console.log('   Error:', result.error);
                console.log('   This user might have a different password');
            }
            
        } catch (error) {
            console.log('❌ Password authentication threw error:', error.message);
            console.log('   Error details:', error);
        }
        
        // Check if user has password fields
        console.log('\n5. Checking user document structure...');
        const userDoc = testUser.toObject();
        console.log('   User document keys:', Object.keys(userDoc));
        console.log('   Has password field:', userDoc.hasOwnProperty('password'));
        console.log('   Has salt field:', userDoc.hasOwnProperty('salt'));
        console.log('   Has hash field:', userDoc.hasOwnProperty('hash'));
        
        // Check if user was created with passport-local-mongoose
        console.log('\n6. Checking passport-local-mongoose setup...');
        console.log('   User schema plugins:', testUser.constructor.schema.plugins);
        
        // Test with a different password to see if this user has any password set
        console.log('\n7. Testing with common passwords...');
        const commonPasswords = ['password', '123456', 'admin', 'test', 'user'];
        
        for (const password of commonPasswords) {
            try {
                const result = await testUser.authenticate(password);
                if (result.user) {
                    console.log(`   ✅ Password "${password}" works!`);
                    break;
                }
            } catch (error) {
                // Ignore errors for wrong passwords
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    } finally {
        // Close connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run the test
testMinimalLogin();
