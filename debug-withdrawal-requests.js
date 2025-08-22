require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./React Websitee/pak-nexus/backend/models/User');

// Define schemas for testing
const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
  processedAt: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

async function debugWithdrawalRequests() {
  try {
    console.log('🔍 DEBUGGING WITHDRAWAL REQUESTS...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check total count of withdrawal requests
    const totalCount = await WithdrawalRequest.countDocuments({});
    console.log(`📊 Total withdrawal requests in database: ${totalCount}\n`);
    
    if (totalCount === 0) {
      console.log('❌ No withdrawal requests found in database');
      console.log('   This explains why the admin panel shows no data');
      return;
    }
    
    // Get all withdrawal requests
    const allRequests = await WithdrawalRequest.find({})
      .populate('userId', 'username email balance')
      .sort({ createdAt: -1 });
    
    console.log('📋 ALL WITHDRAWAL REQUESTS:');
    console.log('=============================');
    
    allRequests.forEach((request, index) => {
      console.log(`\n${index + 1}. Request ID: ${request._id}`);
      console.log(`   User: ${request.userId ? request.userId.username : 'USER NOT FOUND'} (${request.userId?._id || 'N/A'})`);
      console.log(`   Amount: $${request.amount}`);
      console.log(`   Wallet: ${request.walletAddress}`);
      console.log(`   Status: ${request.status}`);
      console.log(`   Created: ${request.createdAt.toLocaleDateString()}`);
      console.log(`   Processed: ${request.processedAt ? request.processedAt.toLocaleDateString() : 'Not processed'}`);
      console.log(`   Notes: ${request.notes || 'None'}`);
    });
    
    // Check for any requests with missing user references
    const requestsWithoutUser = allRequests.filter(req => !req.userId);
    if (requestsWithoutUser.length > 0) {
      console.log('\n⚠️  REQUESTS WITH MISSING USER REFERENCES:');
      console.log('==========================================');
      requestsWithoutUser.forEach((req, index) => {
        console.log(`${index + 1}. Request ID: ${req._id}`);
        console.log(`   User ID: ${req.userId}`);
        console.log(`   Amount: $${req.amount}`);
        console.log(`   Status: ${req.status}`);
      });
    }
    
    // Test the admin endpoint logic
    console.log('\n🧪 TESTING ADMIN ENDPOINT LOGIC:');
    console.log('==================================');
    
    try {
      const withdrawalRequests = await WithdrawalRequest.find({})
        .populate('userId', 'username email balance')
        .sort({ createdAt: -1 });

      console.log(`✅ Query successful: Found ${withdrawalRequests.length} requests`);
      
      const transformedRequests = withdrawalRequests.map(request => ({
        id: request._id,
        user: {
          id: request.userId?._id || 'N/A',
          username: request.userId?.username || 'Unknown User',
          email: request.userId?.email || 'No Email',
          balance: request.userId?.balance || 0
        },
        amount: request.amount,
        walletAddress: request.walletAddress,
        status: request.status,
        notes: request.notes,
        createdAt: request.createdAt,
        processedAt: request.processedAt
      }));
      
      console.log('✅ Transformation successful');
      console.log('   Sample transformed request:');
      if (transformedRequests.length > 0) {
        const sample = transformedRequests[0];
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - User: ${sample.user.username} (${sample.user.email})`);
        console.log(`   - Amount: $${sample.amount}`);
        console.log(`   - Status: ${sample.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error in admin endpoint logic:', error.message);
    }
    
    console.log('\n💡 DIAGNOSIS:');
    if (totalCount === 0) {
      console.log('   - No withdrawal requests exist in the database');
      console.log('   - Users need to create withdrawal requests first');
      console.log('   - Check if the frontend withdrawal request creation is working');
    } else {
      console.log('   - Withdrawal requests exist in the database');
      console.log('   - Admin endpoint should be working');
      console.log('   - Check if there are CORS or authentication issues');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the debug
console.log('🚀 Starting withdrawal requests debug...\n');
debugWithdrawalRequests();
