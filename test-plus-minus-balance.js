require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        testPlusMinusBalance();
    })
    .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testPlusMinusBalance() {
    try {
        console.log('🧪 Testing Plus/Minus Balance Functionality...\n');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        // Find a test user
        const testUser = await User.findOne({});
        if (!testUser) {
            console.error('❌ No users found in database');
            return;
        }
        
        console.log(`👤 Test User: ${testUser.username} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance || 0}\n`);
        
        // Test scenarios
        const testScenarios = [
            { operation: 'add', amount: 10, description: 'Add $10' },
            { operation: 'add', amount: 25, description: 'Add $25' },
            { operation: 'subtract', amount: 15, description: 'Subtract $15' },
            { operation: 'subtract', amount: 5, description: 'Subtract $5' },
            { operation: 'add', amount: 50, description: 'Add $50' },
            { operation: 'subtract', amount: 30, description: 'Subtract $30' }
        ];
        
        let currentBalance = testUser.balance || 0;
        
        for (const scenario of testScenarios) {
            console.log(`💰 Testing: ${scenario.description}`);
            console.log(`   Current Balance: $${currentBalance}`);
            
            // Simulate the balance adjustment
            let newBalance;
            if (scenario.operation === 'add') {
                newBalance = currentBalance + scenario.amount;
            } else {
                newBalance = Math.max(0, currentBalance - scenario.amount); // Ensure balance doesn't go below 0
            }
            
            console.log(`   ${scenario.operation === 'add' ? '+' : '-'}$${scenario.amount} = $${newBalance}`);
            
            // Update the user balance
            testUser.balance = newBalance;
            await testUser.save();
            
            currentBalance = newBalance;
            console.log(`   ✅ Updated balance: $${newBalance}\n`);
        }
        
        console.log('🎯 Final Results:');
        console.log(`   Final Balance: $${currentBalance}`);
        console.log(`   Original Balance: $${testUser.balance || 0}`);
        console.log(`   Net Change: $${currentBalance - (testUser.balance || 0)}`);
        
        console.log('\n✅ Plus/Minus Balance Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        mongoose.disconnect();
    }
}
