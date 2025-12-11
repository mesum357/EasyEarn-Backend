require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        testBalanceUpdate();
    })
    .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testBalanceUpdate() {
    try {
        console.log('🧪 Testing balance update...\n');
        
        // Define models
        const User = require('./models/User');
        
        // Get a specific user to test
        const testUser = await User.findOne({ email: 'shahbazking102s@gmail.com' });
        if (!testUser) {
            console.log('❌ Test user not found');
            return;
        }
        
        console.log(`👤 Testing with user: ${testUser.username} (${testUser.email})`);
        console.log(`   Current balance: $${testUser.balance}`);
        
        // Update balance
        testUser.balance = 10.0;
        const result = await testUser.save();
        
        console.log(`   Updated balance: $${result.balance}`);
        console.log(`   Save successful: ${result ? 'Yes' : 'No'}`);
        
        // Verify the update
        const updatedUser = await User.findById(testUser._id);
        console.log(`   Verified balance: $${updatedUser.balance}`);
        
        if (updatedUser.balance === 10.0) {
            console.log('✅ Balance update test successful!');
        } else {
            console.log('❌ Balance update test failed!');
        }
        
    } catch (error) {
        console.error('❌ Error during balance update test:', error);
    } finally {
        mongoose.disconnect();
    }
}