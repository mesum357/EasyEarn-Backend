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
        debugTaskApproval();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

async function debugTaskApproval() {
    try {
        console.log('🔍 Debugging task approval process for shahsahab@gmail.com');
        
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
        
        if (!latestAdminAdjustment || latestAdminAdjustment.operation !== 'set') {
            console.error('❌ No admin set adjustment found for this user');
            return;
        }
        
        console.log(`\n💰 Latest Admin Adjustment:`);
        console.log(`   Operation: ${latestAdminAdjustment.operation}`);
        console.log(`   Amount: $${latestAdminAdjustment.amount}`);
        console.log(`   New Balance: $${latestAdminAdjustment.newBalance}`);
        console.log(`   Date: ${latestAdminAdjustment.createdAt}`);
        
        // Step 1: Check all task submissions for this user
        console.log(`\n1️⃣ Checking all task submissions for this user...`);
        const allTaskSubmissions = await TaskSubmission.find({ userId: testUser._id })
            .populate('taskId')
            .sort({ createdAt: 1 });
        
        console.log(`   Total task submissions: ${allTaskSubmissions.length}`);
        allTaskSubmissions.forEach((submission, index) => {
            const isAfterAdmin = submission.createdAt > latestAdminAdjustment.createdAt;
            console.log(`   ${index + 1}. Status: ${submission.status}, Reward: $${submission.taskId?.reward || 0}, Created: ${submission.createdAt}, After Admin: ${isAfterAdmin ? '✅ YES' : '❌ NO'}`);
        });
        
        // Step 2: Check approved task submissions after admin adjustment
        console.log(`\n2️⃣ Checking approved task submissions after admin adjustment...`);
        const approvedAfterAdmin = allTaskSubmissions.filter(submission => 
            submission.status === 'approved' && 
            submission.createdAt > latestAdminAdjustment.createdAt
        );
        
        console.log(`   Approved after admin adjustment: ${approvedAfterAdmin.length}`);
        approvedAfterAdmin.forEach((submission, index) => {
            console.log(`   ${index + 1}. Reward: $${submission.taskId?.reward || 0}, Created: ${submission.createdAt}`);
        });
        
        // Step 3: Test the aggregation query manually
        console.log(`\n3️⃣ Testing aggregation query manually...`);
        
        console.log(`   User ID type: ${typeof testUser._id}, value: ${testUser._id}`);
        console.log(`   Admin adjustment date: ${latestAdminAdjustment.createdAt}`);
        
        // Test with ObjectId conversion
        const ongoingTaskRewards = await TaskSubmission.aggregate([
            { $match: { 
                userId: mongoose.Types.ObjectId(testUser._id.toString()), 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $group: { _id: null, total: { $sum: '$task.reward' } } }
        ]);
        
        console.log(`   Aggregation result:`, ongoingTaskRewards);
        const ongoingTaskRewardAmount = ongoingTaskRewards.length > 0 ? ongoingTaskRewards[0].total : 0;
        console.log(`   Ongoing task reward amount: $${ongoingTaskRewardAmount}`);
        
        // Step 4: Test the aggregation step by step
        console.log(`\n4️⃣ Testing aggregation step by step...`);
        
        // Step 4a: Match approved submissions after admin adjustment
        const matchStep = await TaskSubmission.aggregate([
            { $match: { 
                userId: mongoose.Types.ObjectId(testUser._id.toString()), 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }}
        ]);
        console.log(`   Step 1 - Match result: ${matchStep.length} documents`);
        matchStep.forEach((doc, index) => {
            console.log(`     ${index + 1}. taskId: ${doc.taskId}, createdAt: ${doc.createdAt}`);
        });
        
        // Step 4b: Add lookup
        const lookupStep = await TaskSubmission.aggregate([
            { $match: { 
                userId: mongoose.Types.ObjectId(testUser._id.toString()), 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } }
        ]);
        console.log(`   Step 2 - Lookup result: ${lookupStep.length} documents`);
        lookupStep.forEach((doc, index) => {
            console.log(`     ${index + 1}. taskId: ${doc.taskId}, task array length: ${doc.task.length}, task reward: ${doc.task[0]?.reward || 'N/A'}`);
        });
        
        // Step 4c: Unwind
        const unwindStep = await TaskSubmission.aggregate([
            { $match: { 
                userId: mongoose.Types.ObjectId(testUser._id.toString()), 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' }
        ]);
        console.log(`   Step 3 - Unwind result: ${unwindStep.length} documents`);
        unwindStep.forEach((doc, index) => {
            console.log(`     ${index + 1}. taskId: ${doc.taskId}, task reward: ${doc.task?.reward || 'N/A'}`);
        });
        
        // Step 4d: Group
        const groupStep = await TaskSubmission.aggregate([
            { $match: { 
                userId: mongoose.Types.ObjectId(testUser._id.toString()), 
                status: 'approved',
                createdAt: { $gt: latestAdminAdjustment.createdAt }
            }},
            { $lookup: { from: 'tasks', localField: 'taskId', foreignField: '_id', as: 'task' } },
            { $unwind: '$task' },
            { $group: { _id: null, total: { $sum: '$task.reward' } } }
        ]);
        console.log(`   Step 4 - Group result:`, groupStep);
        
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Error debugging task approval:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}
