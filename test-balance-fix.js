require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection options (same as in app.js)
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: process.env.NODE_ENV === 'production',
  tls: process.env.NODE_ENV === 'production',
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true
};

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test a simple query
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      balance: Number
    }));
    
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('✅ Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();