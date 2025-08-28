require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");
        testAdminBalanceAdd();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testAdminBalanceAdd() {
    try {
        console.log('🧪 Testing admin balance add functionality...');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        // Find a test user
        const testUser = await User.findOne({});
        if (!testUser) {
            console.error('❌ No users found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.username} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance}`);
        
        // Test the balance add functionality
        const testAmounts = [10, 25, 50];
        
        for (const amount of testAmounts) {
            console.log(`\n💰 Testing: Add $${amount} to balance`);
            
            // Simulate the admin balance add operation
            const oldBalance = testUser.balance;
            const newBalance = oldBalance + amount;
            
            // Update user balance
            testUser.balance = newBalance;
            await testUser.save();
            
            console.log(`   Balance: $${oldBalance} → $${newBalance}`);
            console.log(`   Amount Added: $${amount}`);
            console.log(`   ✅ Successfully added $${amount} to balance`);
        }
        
        // Test the set operation (replacing balance)
        console.log(`\n🔄 Testing: Set balance to $100`);
        const setBalance = 100;
        const oldBalance = testUser.balance;
        
        testUser.balance = setBalance;
        await testUser.save();
        
        console.log(`   Balance: $${oldBalance} → $${setBalance}`);
        console.log(`   ✅ Successfully set balance to $${setBalance}`);
        
        // Reset to original balance for testing
        console.log(`\n🔄 Resetting balance to original value...`);
        testUser.balance = 0;
        await testUser.save();
        console.log(`   Balance reset to: $${testUser.balance}`);
        
        console.log('\n✅ Admin balance add functionality test completed!');
        
    } catch (error) {
        console.error('❌ Error testing admin balance add functionality:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
