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
        debugAdminBalanceIntegration();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function debugAdminBalanceIntegration() {
    try {
        console.log('🔍 Debugging admin balance integration...');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        const adminBalanceAdjustmentSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            operation: { type: String, enum: ['set', 'add'], required: true },
            amount: { type: Number, required: true },
            reason: { type: String, default: 'Admin adjustment' },
            previousBalance: { type: Number, required: true },
            newBalance: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }
        });
        const AdminBalanceAdjustment = mongoose.model('AdminBalanceAdjustment', adminBalanceAdjustmentSchema);

        // Find a test user
        const testUser = await User.findOne({});
        if (!testUser) {
            console.error('❌ No users found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.username} (${testUser._id})`);
        console.log(`   Current Balance: $${testUser.balance}`);
        
        // Check if AdminBalanceAdjustment collection exists
        console.log(`\n🔍 Checking AdminBalanceAdjustment collection...`);
        const collections = await mongoose.connection.db.listCollections().toArray();
        const adminBalanceCollection = collections.find(col => col.name === 'adminbalanceadjustments');
        console.log(`   Collection exists: ${adminBalanceCollection ? '✅ YES' : '❌ NO'}`);
        if (adminBalanceCollection) {
            console.log(`   Collection name: ${adminBalanceCollection.name}`);
        }
        
        // Check if there are any existing admin adjustments
        console.log(`\n🔍 Checking existing admin adjustments...`);
        const existingAdjustments = await AdminBalanceAdjustment.find({ userId: testUser._id });
        console.log(`   Existing adjustments for user: ${existingAdjustments.length}`);
        
        if (existingAdjustments.length > 0) {
            console.log(`   Latest adjustment:`, {
                operation: existingAdjustments[0].operation,
                amount: existingAdjustments[0].amount,
                previousBalance: existingAdjustments[0].previousBalance,
                newBalance: existingAdjustments[0].newBalance,
                createdAt: existingAdjustments[0].createdAt
            });
        }
        
        // Create a test admin adjustment
        console.log(`\n🔍 Creating test admin adjustment...`);
        const adminAdjustment = new AdminBalanceAdjustment({
            userId: testUser._id,
            adminId: testUser._id,
            operation: 'set',
            amount: 100,
            reason: 'Debug test',
            previousBalance: testUser.balance,
            newBalance: 100
        });
        
        try {
            await adminAdjustment.save();
            console.log(`   ✅ Admin adjustment created successfully`);
            console.log(`   Adjustment ID: ${adminAdjustment._id}`);
            console.log(`   Created at: ${adminAdjustment.createdAt}`);
        } catch (error) {
            console.error(`   ❌ Failed to create admin adjustment:`, error.message);
            return;
        }
        
        // Now test the findOne query that calculateUserBalance uses
        console.log(`\n🔍 Testing findOne query...`);
        const latestAdminAdjustment = await AdminBalanceAdjustment.findOne(
            { userId: testUser._id },
            { sort: { createdAt: -1 } }
        );
        
        if (latestAdminAdjustment) {
            console.log(`   ✅ Found admin adjustment:`, {
                operation: latestAdminAdjustment.operation,
                amount: latestAdminAdjustment.amount,
                newBalance: latestAdminAdjustment.newBalance,
                createdAt: latestAdminAdjustment.createdAt
            });
            
            // Test the condition check
            const condition = latestAdminAdjustment && latestAdminAdjustment.operation === 'set';
            console.log(`   Condition check: ${condition}`);
            console.log(`   latestAdminAdjustment exists: ${!!latestAdminAdjustment}`);
            console.log(`   operation === 'set': ${latestAdminAdjustment.operation === 'set'}`);
            
            // Check raw document
            console.log(`   Raw document:`, latestAdminAdjustment.toObject());
        } else {
            console.log(`   ❌ No admin adjustment found`);
        }
        
        // Also check raw collection data
        console.log(`\n🔍 Checking raw collection data...`);
        const rawData = await mongoose.connection.db.collection('adminbalanceadjustments').findOne(
            { userId: testUser._id }
        );
        if (rawData) {
            console.log(`   Raw collection data:`, rawData);
        } else {
            console.log(`   ❌ No raw data found`);
        }
        
        // Cleanup
        console.log(`\n🧹 Cleaning up...`);
        await adminAdjustment.deleteOne();
        console.log(`   ✅ Test data cleaned up`);
        
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
