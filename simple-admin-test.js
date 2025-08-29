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
        simpleAdminTest();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function simpleAdminTest() {
    try {
        console.log('🧪 Simple admin balance test...');
        
        // Use the exact same schema as in app.js
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
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        const testUser = await User.findOne({});
        if (!testUser) {
            console.error('❌ No users found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.username} (${testUser._id})`);
        
        // Create a simple admin adjustment
        console.log(`\n🔍 Creating admin adjustment...`);
        const adminAdjustment = new AdminBalanceAdjustment({
            userId: testUser._id,
            adminId: testUser._id,
            operation: 'set',
            amount: 100,
            reason: 'Simple test',
            previousBalance: 0,
            newBalance: 100
        });
        
        await adminAdjustment.save();
        console.log(`   ✅ Created adjustment with ID: ${adminAdjustment._id}`);
        console.log(`   Operation: ${adminAdjustment.operation}`);
        console.log(`   Amount: ${adminAdjustment.amount}`);
        console.log(`   New Balance: ${adminAdjustment.newBalance}`);
        
        // Now try to find it
        console.log(`\n🔍 Finding admin adjustment...`);
        const foundAdjustment = await AdminBalanceAdjustment.findById(adminAdjustment._id);
        
        if (foundAdjustment) {
            console.log(`   ✅ Found adjustment by ID:`);
            console.log(`   Operation: ${foundAdjustment.operation}`);
            console.log(`   Amount: ${foundAdjustment.amount}`);
            console.log(`   New Balance: ${foundAdjustment.newBalance}`);
            console.log(`   Created At: ${foundAdjustment.createdAt}`);
        } else {
            console.log(`   ❌ Not found by ID`);
        }
        
        // Try to find by userId
        console.log(`\n🔍 Finding by userId...`);
        const foundByUserId = await AdminBalanceAdjustment.findOne({ userId: testUser._id });
        
        if (foundByUserId) {
            console.log(`   ✅ Found by userId:`);
            console.log(`   Operation: ${foundByUserId.operation}`);
            console.log(`   Amount: ${foundByUserId.amount}`);
            console.log(`   New Balance: ${foundByUserId.newBalance}`);
            console.log(`   Created At: ${foundByUserId.createdAt}`);
        } else {
            console.log(`   ❌ Not found by userId`);
        }
        
        // Try to find with sort
        console.log(`\n🔍 Finding with sort...`);
        const foundWithSort = await AdminBalanceAdjustment.findOne(
            { userId: testUser._id },
            { sort: { createdAt: -1 } }
        );
        
        if (foundWithSort) {
            console.log(`   ✅ Found with sort:`);
            console.log(`   Operation: ${foundWithSort.operation}`);
            console.log(`   Amount: ${foundWithSort.amount}`);
            console.log(`   New Balance: ${foundWithSort.newBalance}`);
            console.log(`   Created At: ${foundWithSort.createdAt}`);
        } else {
            console.log(`   ❌ Not found with sort`);
        }
        
        // Check raw data
        console.log(`\n🔍 Checking raw data...`);
        const rawData = await mongoose.connection.db.collection('adminbalanceadjustments').findOne(
            { _id: adminAdjustment._id }
        );
        if (rawData) {
            console.log(`   Raw data:`, rawData);
        }
        
        // Cleanup
        console.log(`\n🧹 Cleaning up...`);
        await adminAdjustment.deleteOne();
        console.log(`   ✅ Cleaned up`);
        
        console.log('\n✅ Simple test completed!');
        
    } catch (error) {
        console.error('❌ Error during simple test:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
