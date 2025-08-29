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
        testAggregationFix();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function testAggregationFix() {
    try {
        console.log('🧪 Testing aggregation fix for shahsahab@gmail.com');
        
        // Define models
        const User = require('./React Websitee/pak-nexus/backend/models/User');
        
        const taskSubmissionSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        });
        const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

        const taskSchema = new mongoose.Schema({
            title: String,
            description: String,
            reward: { type: Number, required: true },
            createdAt: { type: Date, default: Date.now }
        });
        const Task = mongoose.model('Task', taskSchema);

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

        // Find the specific user
        const testUser = await User.findOne({ email: 'shahsahab@gmail.com' });
        if (!testUser) {
            console.error('❌ User shahsahab@gmail.com not found in database');
            return;
        }
        
        console.log(`\n👤 Test User: ${testUser.email} (${testUser._id})`);
        
        // Get the latest admin adjustment
        const latestAdminAdjustment = await AdminBalanceAdjustment.find(
            { userId: testUser._id }
        ).sort({ createdAt: -1 }).limit(1).then(results => results[0]);
        
        if (!latestAdminAdjustment) {
            console.error('❌ No admin adjustment found');
            return;
        }
        
        console.log(`\n💰 Latest Admin Adjustment:`);
        console.log(`   Date: ${latestAdminAdjustment.createdAt}`);
        
        // Test the fixed aggregation
        console.log(`\n🔍 Testing fixed aggregation...`);
        
        const userIdObj = new mongoose.Types.ObjectId(testUser._id.toString());
        
        // Test the new aggregation with $toDate
        const ongoingTaskRewards = await TaskSubmission.aggregate([
            { $match: { 
                userId: userIdObj, 
                status: 'approved'
            }},
            { $addFields: {
                createdAtDate: { $toDate: '$createdAt' }
            }},
            { $match: { 
                createdAtDate: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $group: { _id: null, total: { $sum: '$task.reward' } } }
        ]);
        
        console.log(`   Fixed aggregation result:`, ongoingTaskRewards);
        const ongoingTaskRewardAmount = ongoingTaskRewards.length > 0 ? ongoingTaskRewards[0].total : 0;
        console.log(`   Ongoing task reward amount: $${ongoingTaskRewardAmount}`);
        
        // Test step by step
        console.log(`\n🔍 Testing step by step...`);
        
        // Step 1: Match approved submissions
        const step1 = await TaskSubmission.aggregate([
            { $match: { 
                userId: userIdObj, 
                status: 'approved'
            }}
        ]);
        console.log(`   Step 1 - Approved submissions: ${step1.length} documents`);
        
        // Step 2: Add date field
        const step2 = await TaskSubmission.aggregate([
            { $match: { 
                userId: userIdObj, 
                status: 'approved'
            }},
            { $addFields: {
                createdAtDate: { $toDate: '$createdAt' }
            }}
        ]);
        console.log(`   Step 2 - With date field: ${step2.length} documents`);
        if (step2.length > 0) {
            console.log(`   First document fields:`, Object.keys(step2[0]));
            console.log(`   First document createdAt: ${step2[0].createdAt}`);
            console.log(`   First document createdAtDate: ${step2[0].createdAtDate}`);
            console.log(`   First document full:`, JSON.stringify(step2[0], null, 2));
        }
        
        // Step 3: Filter by date
        const step3 = await TaskSubmission.aggregate([
            { $match: { 
                userId: userIdObj, 
                status: 'approved'
            }},
            { $addFields: {
                createdAtDate: { $toDate: '$createdAt' }
            }},
            { $match: { 
                createdAtDate: { $gt: latestAdminAdjustment.createdAt }
            }}
        ]);
        console.log(`   Step 3 - After date filter: ${step3.length} documents`);
        
        console.log('\n✅ Aggregation fix test completed!');
        
    } catch (error) {
        console.error('❌ Error testing aggregation fix:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
