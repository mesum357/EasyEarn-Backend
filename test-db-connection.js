const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection');
    console.log('==============================');
    
    try {
        // Test 1: Check environment variables
        console.log('\n1. Checking environment variables...');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
        console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
        
        if (!process.env.MONGODB_URI) {
            console.log('❌ MONGODB_URI not set, cannot test connection');
            return;
        }
        
        // Test 2: Connect to MongoDB
        console.log('\n2. Connecting to MongoDB...');
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
        
        // Test 3: Check if User model is accessible
        console.log('\n3. Testing User model...');
        try {
            const User = require('./React Websitee/pak-nexus/backend/models/User');
            console.log('✅ User model imported successfully');
            
            // Test 4: Check if user exists
            console.log('\n4. Checking if test user exists...');
            const testUser = await User.findOne({ 
                $or: [
                    { username: 'massux357@gmail.com' },
                    { email: 'massux357@gmail.com' }
                ]
            });
            
            if (testUser) {
                console.log('✅ Test user found:');
                console.log('   ID:', testUser._id);
                console.log('   Username:', testUser.username);
                console.log('   Email:', testUser.email);
                console.log('   Verified:', testUser.verified);
                console.log('   Has authenticate method:', typeof testUser.authenticate === 'function');
            } else {
                console.log('❌ Test user not found');
                console.log('   Searching for: massux357@gmail.com');
                
                // List all users to see what's in the database
                const allUsers = await User.find({}).select('username email verified').limit(5);
                console.log('   Available users (first 5):', allUsers);
            }
            
        } catch (error) {
            console.log('❌ Error with User model:', error.message);
        }
        
        // Test 5: Check database collections
        console.log('\n5. Checking database collections...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('   Collections found:', collections.map(c => c.name));
        
        // Test 6: Check sessions collection
        if (collections.some(c => c.name === 'sessions')) {
            console.log('✅ Sessions collection exists');
            const sessionCount = await mongoose.connection.db.collection('sessions').countDocuments();
            console.log('   Active sessions:', sessionCount);
        } else {
            console.log('❌ Sessions collection not found');
        }
        
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
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
testDatabaseConnection();
