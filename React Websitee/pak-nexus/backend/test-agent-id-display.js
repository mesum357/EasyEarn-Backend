const mongoose = require('mongoose');
const Institute = require('./models/Institute');
const Shop = require('./models/Shop');
const Product = require('./models/Product');
const PaymentRequest = require('./models/PaymentRequest');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmed357:pDliM118811@cluster0.vtangzf.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAgentIdDisplay() {
  try {
    console.log('🔍 Testing Agent ID Display System...\n');

    // 1. Check what entities we have with Agent IDs
    console.log('1. Entities with Agent IDs:');
    
    const institutesWithAgentId = await Institute.find({ agentId: { $exists: true, $ne: null } });
    console.log(`   Institutes: ${institutesWithAgentId.length}`);
    institutesWithAgentId.forEach(inst => {
      console.log(`   - ${inst.name}: Agent ID = ${inst.agentId}, Domain = ${inst.domain}, Type = ${inst.type}`);
    });

    const shopsWithAgentId = await Shop.find({ agentId: { $exists: true, $ne: null } });
    console.log(`   Shops: ${shopsWithAgentId.length}`);
    shopsWithAgentId.forEach(shop => {
      console.log(`   - ${shop.shopName}: Agent ID = ${shop.agentId}`);
    });

    const productsWithAgentId = await Product.find({ agentId: { $exists: true, $ne: null } });
    console.log(`   Products: ${productsWithAgentId.length}`);
    productsWithAgentId.forEach(product => {
      console.log(`   - ${product.title}: Agent ID = ${product.agentId}`);
    });

    // 2. Check payment requests
    console.log('\n2. Payment Requests:');
    
    const totalPayments = await PaymentRequest.countDocuments();
    console.log(`   Total payment requests: ${totalPayments}`);
    
    const paymentsWithAgentId = await PaymentRequest.find({ agentId: { $exists: true, $ne: null } });
    console.log(`   Payments with Agent ID: ${paymentsWithAgentId.length}`);
    
    const paymentsWithoutAgentId = await PaymentRequest.find({ 
      $or: [
        { agentId: { $exists: false } },
        { agentId: null },
        { agentId: '' }
      ]
    });
    console.log(`   Payments without Agent ID: ${paymentsWithoutAgentId.length}`);

    // 3. Test the public endpoint logic
    console.log('\n3. Testing Public Endpoint Logic:');
    
    const samplePayments = await PaymentRequest.find().limit(3);
    for (const payment of samplePayments) {
      console.log(`\n   Payment ${payment._id}:`);
      console.log(`     - Current agentId: ${payment.agentId}`);
      console.log(`     - Entity Type: ${payment.entityType}`);
      console.log(`     - Entity ID: ${payment.entityId}`);
      
      if (payment.entityId) {
        try {
          let entity;
          switch (payment.entityType) {
            case 'institute':
            case 'hospital':
              entity = await Institute.findById(payment.entityId);
              break;
            case 'shop':
              entity = await Shop.findById(payment.entityId);
              break;
            case 'marketplace':
              entity = await Product.findById(payment.entityId);
              break;
          }
          
          if (entity) {
            console.log(`     ✅ Entity found: ${entity.name || entity.shopName || entity.title}`);
            console.log(`     ✅ Entity Agent ID: ${entity.agentId || 'Not set'}`);
            
            if (entity.agentId) {
              console.log(`     🎯 Would populate Agent ID: ${entity.agentId}`);
            }
          } else {
            console.log(`     ❌ Entity not found`);
          }
        } catch (error) {
          console.log(`     ❌ Error fetching entity: ${error.message}`);
        }
      } else {
        console.log(`     ⚠️ No entityId, cannot populate Agent ID`);
      }
    }

    console.log('\n✅ Agent ID Display Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testAgentIdDisplay();
