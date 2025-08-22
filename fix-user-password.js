const mongoose = require('mongoose');
require('dotenv').config();

async function fixUserPassword() {
    console.log('🔧 Fixing User Password');
    console.log('========================');
    
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
        console.log('\n2. Importing User model...');
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
        
        // Check current password fields
        console.log('\n4. Checking current password fields...');
        const userDoc = testUser.toObject();
        console.log('   Has salt field:', userDoc.hasOwnProperty('salt'));
        console.log('   Has hash field:', userDoc.hasOwnProperty('hash'));
        console.log('   Has password field:', userDoc.hasOwnProperty('password'));
        
        // Set a new password using passport-local-mongoose
        console.log('\n5. Setting new password...');
        const newPassword = '123456';
        console.log('   Setting password to:', newPassword);
        
        // Use the setPassword method from passport-local-mongoose
        testUser.setPassword(newPassword);
        console.log('✅ Password set successfully');
        
        // Save the user
        console.log('\n6. Saving user...');
        await testUser.save();
        console.log('✅ User saved successfully');
        
        // Verify the password was set correctly
        console.log('\n7. Verifying password was set...');
        const updatedUser = await User.findById(testUser._id);
        const updatedUserDoc = updatedUser.toObject();
        
        console.log('   Has salt field:', updatedUserDoc.hasOwnProperty('salt'));
        console.log('   Has hash field:', updatedUserDoc.hasOwnProperty('hash'));
        console.log('   Salt length:', updatedUserDoc.salt ? updatedUserDoc.salt.length : 'N/A');
        console.log('   Hash length:', updatedUserDoc.hash ? updatedUserDoc.hash.length : 'N/A');
        
        // Test authentication with the new password
        console.log('\n8. Testing authentication with new password...');
        try {
            const result = await updatedUser.authenticate(newPassword);
            if (result.user) {
                console.log('✅ Password authentication successful!');
                console.log('   Authenticated user:', result.user.username);
            } else {
                console.log('❌ Password authentication failed');
                console.log('   Error:', result.error);
            }
        } catch (error) {
            console.log('❌ Password authentication threw error:', error.message);
        }
        
        console.log('\n🎯 User password has been fixed successfully!');
        console.log('   You can now login with:');
        console.log('   Username: massux357@gmail.com');
        console.log('   Password: 123456');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        console.error('Error details:', error);
    } finally {
        // Close connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run the fix
fixUserPassword();
