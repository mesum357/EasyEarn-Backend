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
        debugOngoingTasks();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function debugOngoingTasks() {
    try {
        console.log('🔍 Debugging ongoing tasks for shahsahab@gmail.com');
        
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
        
        // Get all task submissions for this user
        const allTaskSubmissions = await TaskSubmission.find({ userId: testUser._id })
            .populate('taskId')
            .sort({ createdAt: 1 });
        
        console.log(`\n📋 All task submissions:`);
        allTaskSubmissions.forEach((submission, index) => {
            const isAfterAdmin = submission.createdAt > latestAdminAdjustment.createdAt;
            const isApproved = submission.status === 'approved';
            console.log(`   ${index + 1}. Status: ${submission.status}, Reward: $${submission.taskId?.reward || 0}, Created: ${submission.createdAt}, After Admin: ${isAfterAdmin ? '✅ YES' : '❌ NO'}, Approved: ${isApproved ? '✅ YES' : '❌ NO'}`);
        });
        
        // Test the aggregation query
        console.log(`\n🔍 Testing aggregation query...`);
        
        const userIdObj = new mongoose.Types.ObjectId(testUser._id.toString());
        console.log(`   User ID type: ${typeof testUser._id}, value: ${testUser._id}`);
        console.log(`   User ID ObjectId type: ${typeof userIdObj}, value: ${userIdObj}`);
        
        // Check the first task submission's userId field
        if (allTaskSubmissions.length > 0) {
            const firstSubmission = allTaskSubmissions[0];
            console.log(`   First submission userId type: ${typeof firstSubmission.userId}, value: ${firstSubmission.userId}`);
            console.log(`   First submission userId constructor: ${firstSubmission.userId.constructor.name}`);
        }
        
        // Test with string userId
        console.log(`\n🔍 Testing with string userId...`);
        const matchStepString = await TaskSubmission.aggregate([
            { $match: { 
                userId: testUser._id.toString(), 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }}
        ]);
        console.log(`   String userId match result: ${matchStepString.length} documents`);
        
        // Test with ObjectId
        console.log(`\n🔍 Testing with ObjectId...`);
        const matchStepObjectId = await TaskSubmission.aggregate([
            { $match: { 
                userId: userIdObj, 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }}
        ]);
        console.log(`   ObjectId match result: ${matchStepObjectId.length} documents`);
        
        // Test without userId filter first
        console.log(`\n🔍 Testing without userId filter...`);
        const matchStepNoUserId = await TaskSubmission.aggregate([
            { $match: { 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }}
        ]);
        console.log(`   No userId filter match result: ${matchStepNoUserId.length} documents`);
        
        // Test date comparison
        console.log(`\n🔍 Testing date comparison...`);
        console.log(`   Admin adjustment date: ${latestAdminAdjustment.createdAt}`);
        console.log(`   Admin adjustment timestamp: ${latestAdminAdjustment.createdAt.getTime()}`);
        
        if (allTaskSubmissions.length > 0) {
            const firstSubmission = allTaskSubmissions[0];
            console.log(`   First submission date: ${firstSubmission.createdAt}`);
            console.log(`   First submission timestamp: ${firstSubmission.createdAt.getTime()}`);
            console.log(`   Is first submission after admin adjustment: ${firstSubmission.createdAt > latestAdminAdjustment.createdAt}`);
        }
        
        // Test with just status filter
        console.log(`\n🔍 Testing with just status filter...`);
        const matchStepStatusOnly = await TaskSubmission.aggregate([
            { $match: { 
                status: 'approved'
            }}
        ]);
        console.log(`   Status only match result: ${matchStepStatusOnly.length} documents`);
        
        // Test with just date filter
        console.log(`\n🔍 Testing with just date filter...`);
        const matchStepDateOnly = await TaskSubmission.aggregate([
            { $match: { 
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }}
        ]);
        console.log(`   Date only match result: ${matchStepDateOnly.length} documents`);
        
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Error debugging ongoing tasks:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
