const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String },
  email: { type: String, unique: true },
  mobile: { type: String },
  profileImage: { type: String },
  city: { type: String },
  bio: { type: String },
  website: { type: String },
  googleId: { type: String }, // for Google OAuth
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAdmin: { type: Boolean, default: false }, // Admin role for entity approval
  // Add missing fields for balance calculation
  balance: { type: Number, default: 0 },
  hasDeposited: { type: Boolean, default: false },
  tasksUnlocked: { type: Boolean, default: false }, // Tasks unlocked after $10 deposit
  referredBy: { type: String }, // Referral code of the user who referred this user
  referralCode: { type: String, unique: true }, // This user's referral code
  referralCount: { type: Number, default: 0 }, // Number of successful referrals
  referralEarnings: { type: Number, default: 0 } // Earnings from referrals
}, { timestamps: true });

// Add plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
 