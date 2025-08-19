const mongoose = require('mongoose');
const Institute = require('./models/Institute');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmed357:pDliM118811@cluster0.vtangzf.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestEntityWithAgent() {
  try {
    console.log('🔧 Creating test entity with Agent ID...\n');

    // Find a user to use as owner
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`Using user: ${user.username} (${user._id})`);

    // Create a test institute with Agent ID
    const testInstitute = new Institute({
      name: 'Test Institute with Agent ID',
      type: 'College',
      agentId: 'AGENT-001', // This is the key field we're testing
      location: 'Test Location',
      city: 'Karachi',
      province: 'Sindh',
      description: 'This is a test institute to demonstrate Agent ID functionality',
      phone: '+92-300-1234567',
      email: 'test@institute.com',
      address: 'Test Address, Karachi, Sindh',
      owner: user._id,
      ownerName: user.fullName || user.username,
      ownerEmail: user.email,
      ownerPhone: user.phone || '',
      approvalStatus: 'approved',
      verified: true
    });

    await testInstitute.save();
    console.log(`✅ Created test institute: ${testInstitute.name}`);
    console.log(`   Agent ID: ${testInstitute.agentId}`);
    console.log(`   Institute ID: ${testInstitute._id}`);
    console.log(`   Owner: ${testInstitute.ownerName}`);

    // Now create a payment request linked to this institute
    const PaymentRequest = require('./models/PaymentRequest');
    
    const testPayment = new PaymentRequest({
      user: user._id,
      entityType: 'institute',
      entityId: testInstitute._id, // Link to the institute we just created
      agentId: testInstitute.agentId, // This should be populated automatically
      amount: 15000,
      totalAmount: 15000, // Add the required totalAmount field
      transactionId: `TEST_${Date.now()}`,
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      transactionDate: new Date(),
      notes: 'Test payment for Agent ID demonstration',
      status: 'pending'
    });

    await testPayment.save();
    console.log(`✅ Created test payment request: ${testPayment._id}`);
    console.log(`   Entity Type: ${testPayment.entityType}`);
    console.log(`   Entity ID: ${testPayment.entityId}`);
    console.log(`   Agent ID: ${testPayment.agentId}`);
    console.log(`   Amount: ${testPayment.amount}`);

    console.log('\n🎯 Test Setup Complete!');
    console.log('Now when you view the admin panel, you should see:');
    console.log('1. The test institute with Agent ID: AGENT-001');
    console.log('2. The test payment request showing Agent ID: AGENT-001');
    console.log('3. Other payment requests showing Agent ID: N/A (because they have no entityId or no Agent ID)');

  } catch (error) {
    console.error('❌ Test setup failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
createTestEntityWithAgent();
