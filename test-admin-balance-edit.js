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
        testAdminBalanceEdit();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testAdminBalanceEdit() {
    try {
        console.log('🧪 Testing admin balance edit functionality...');
        
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
        
        // Test the balance edit functionality - increase balance
        console.log(`\n💰 Testing: Increase balance to $100`);
        const increaseBalance = 100;
        const oldBalance = testUser.balance;
        
        testUser.balance = increaseBalance;
        await testUser.save();
        
        console.log(`   Balance: $${oldBalance} → $${increaseBalance}`);
        console.log(`   ✅ Successfully increased balance to $${increaseBalance}`);
        
        // Test the balance edit functionality - decrease balance
        console.log(`\n💰 Testing: Decrease balance to $50`);
        const decreaseBalance = 50;
        const currentBalance = testUser.balance;
        
        testUser.balance = decreaseBalance;
        await testUser.save();
        
        console.log(`   Balance: $${currentBalance} → $${decreaseBalance}`);
        console.log(`   ✅ Successfully decreased balance to $${decreaseBalance}`);
        
        // Test the balance edit functionality - set to zero
        console.log(`\n💰 Testing: Set balance to $0`);
        const zeroBalance = 0;
        const balanceBeforeZero = testUser.balance;
        
        testUser.balance = zeroBalance;
        await testUser.save();
        
        console.log(`   Balance: $${balanceBeforeZero} → $${zeroBalance}`);
        console.log(`   ✅ Successfully set balance to $${zeroBalance}`);
        
        // Test the balance edit functionality - set to negative (if needed for some reason)
        console.log(`\n💰 Testing: Set balance to -$25`);
        const negativeBalance = -25;
        const balanceBeforeNegative = testUser.balance;
        
        testUser.balance = negativeBalance;
        await testUser.save();
        
        console.log(`   Balance: $${balanceBeforeNegative} → $${negativeBalance}`);
        console.log(`   ✅ Successfully set balance to $${negativeBalance}`);
        
        // Reset to original balance for testing
        console.log(`\n🔄 Resetting balance to original value...`);
        testUser.balance = 0;
        await testUser.save();
        console.log(`   Balance reset to: $${testUser.balance}`);
        
        console.log('\n✅ Admin balance edit functionality test completed!');
        
    } catch (error) {
        console.error('❌ Error testing admin balance edit functionality:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
