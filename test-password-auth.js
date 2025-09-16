const mongoose = require('mongoose');
require('dotenv').config();

async function testPasswordAuthentication() {
    console.log('🔍 Testing Password Authentication');
    console.log('==================================');
    
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
        
        // Find the test user
        console.log('\n3. Finding test user...');
        const testUser = await User.findOne({ 
            $or: [
                { username: 'massux357@gmail.com' },
                { email: 'massux357@gmail.com' }
            ]
        });
        
        if (!testUser) {
            console.log('❌ Test user not found');
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
        const testPassword = '123456';
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
            }
            
        } catch (error) {
            console.log('❌ Password authentication threw error:', error.message);
            console.log('   Error details:', error);
        }
        
        // Test with different password
        console.log('\n5. Testing with wrong password...');
        const wrongPassword = 'wrongpassword';
        console.log('   Testing wrong password:', wrongPassword);
        
        try {
            const result2 = await testUser.authenticate(wrongPassword);
            console.log('   Wrong password result:', result2);
            
            if (result2.user) {
                console.log('❌ Wrong password was accepted (this is bad!)');
            } else {
                console.log('✅ Wrong password correctly rejected');
            }
            
        } catch (error) {
            console.log('❌ Wrong password test threw error:', error.message);
        }
        
        // Check if user has password field
        console.log('\n6. Checking user document structure...');
        console.log('   User document keys:', Object.keys(testUser.toObject()));
        console.log('   Has password field:', testUser.hasOwnProperty('password'));
        console.log('   Has salt field:', testUser.hasOwnProperty('salt'));
        console.log('   Has hash field:', testUser.hasOwnProperty('hash'));
        
        // Check if user was created with passport-local-mongoose
        console.log('\n7. Checking passport-local-mongoose setup...');
        console.log('   User schema plugins:', testUser.constructor.schema.plugins);
        
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
testPasswordAuthentication();
