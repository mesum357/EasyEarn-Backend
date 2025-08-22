const mongoose = require('mongoose');
const User = require('./React Websitee/pak-nexus/backend/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmed357:pDliM118811357@cluster0.vtangzf.mongodb.net/');

async function checkAndCreateTestUser() {
    try {
        console.log('🔍 Checking for existing users in database...');
        
        // Check if there are any verified users
        const verifiedUsers = await User.find({ verified: true }).limit(5);
        
        if (verifiedUsers.length > 0) {
            console.log(`✅ Found ${verifiedUsers.length} verified users:`);
            verifiedUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email}) - Verified: ${user.verified}`);
            });
            
            console.log('\n📝 You can use any of these users for session testing:');
            console.log('   Update the TEST_USER credentials in test-session-consistency.js');
            console.log('   with one of the verified users above.');
            
            return verifiedUsers[0]; // Return first verified user
        } else {
            console.log('❌ No verified users found. Creating a test user...');
            
            // Create a test user
            const testUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                verified: true,
                fullName: 'Test User'
            });
            
            // Set password using passport-local-mongoose
            await testUser.setPassword('testpassword123');
            await testUser.save();
            
            console.log('✅ Test user created successfully:');
            console.log(`   Username: ${testUser.username}`);
            console.log(`   Email: ${testUser.email}`);
            console.log(`   Password: testpassword123`);
            console.log(`   Verified: ${testUser.verified}`);
            
            console.log('\n📝 You can now use these credentials in test-session-consistency.js:');
            console.log('   username: "test@example.com"');
            console.log('   password: "testpassword123"');
            
            return testUser;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 11000) {
            console.log('💡 User already exists. Try using existing credentials.');
        }
        
        return null;
    } finally {
        mongoose.connection.close();
    }
}

// Run the function
checkAndCreateTestUser();

