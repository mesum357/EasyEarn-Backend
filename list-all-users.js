require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mesum357:pDliM118811@cluster0.h3knh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  balance: { type: Number, default: 0 },
  hasDeposited: { type: Boolean, default: false },
  referredBy: String,
  referralCode: String,
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function listAllUsers() {
  try {
    console.log('🔍 Listing all users in the database...\n');
    
    const users = await User.find({}).sort({ username: 1 });
    
    console.log(`📊 Total users found: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - Balance: $${user.balance.toFixed(2)} - Has Deposited: ${user.hasDeposited}`);
    });
    
    console.log('\n✅ User listing completed');
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    mongoose.connection.close();
  }
}

listAllUsers();


