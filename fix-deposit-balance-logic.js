const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Applying new deposit balance logic: balance = total deposits - 10');

// Fix 1: Update the admin deposit confirmation endpoint with new logic
const adminEndpointPattern = /\/\/ Admin: Confirm deposit \(no authentication required for admin panel\)[\s\S]*?res\.json\(\{[\s\S]*?success: true,[\s\S]*?message: 'Deposit confirmed successfully',[\s\S]*?deposit[\s\S]*?\}\);[\s\S]*?\} catch \(error\) \{[\s\S]*?res\.status\(500\)\.json\([\s\S]*?\}\);[\s\S]*?\}\);[\s\S]*?\}\);[\s\S]*?\}\);/;

const adminEndpointReplacement = `// Admin: Confirm deposit (no authentication required for admin panel)
app.put('/api/admin/deposits/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ 
        success: false, 
        error: 'Deposit not found' 
      });
    }

    // Update user balance and check for task unlocking
    const user = await User.findById(deposit.userId);
    if (user) {
      // Update deposit status first
      deposit.status = 'confirmed';
      deposit.confirmedAt = new Date();
      if (notes) deposit.notes = notes;

      // Save the deposit
      await deposit.save();
      
      // Calculate total confirmed deposits for this user
      const totalConfirmedDeposits = await Deposit.aggregate([
        { $match: { userId: deposit.userId, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
      
      console.log(\`🔍 ADMIN DEPOSIT DEBUG: User \${user.username}, totalDeposits=\${totalDeposits}, deposit.amount=\${deposit.amount}\`);
      
      // Set hasDeposited to true if user has any confirmed deposits
      user.hasDeposited = totalDeposits > 0;
      
      // Calculate balance: total deposits - 10 (first $10 is for unlocking tasks)
      if (totalDeposits >= 10) {
        user.balance = totalDeposits - 10;
        console.log(\`✅ ADMIN: Balance calculated as \${totalDeposits} - 10 = \${user.balance} for user \${user.username}\`);
      } else {
        user.balance = 0;
        console.log(\`✅ ADMIN: Balance set to 0 (total deposits \${totalDeposits} < 10) for user \${user.username}\`);
      }
      
      await user.save();
      
      // Update the session user object if the user is logged in
      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {
        req.user = user;
        console.log('✅ Updated session user object');
      } else {
        console.log('⚠️ Could not update session - session info:', {
          hasSession: !!req.session,
          hasPassport: !!(req.session && req.session.passport),
          sessionUserId: req.session?.passport?.user,
          actualUserId: user._id.toString(),
          isAdminEndpoint: true
        });
      }
      
      // Check if this deposit completes any pending referrals
      await checkAndCompleteReferrals(user._id);
    }

    res.json({
      success: true,
      message: 'Deposit confirmed successfully',
      deposit
    });

  } catch (error) {
    console.error('Error confirming deposit:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to confirm deposit',
      details: error.message 
    });
  }
});`;

// Fix 2: Update the regular user deposit confirmation endpoint with new logic
const userEndpointPattern = /\/\/ Admin: Confirm deposit \(for admin use\)[\s\S]*?res\.json\(\{[\s\S]*?success: true,[\s\S]*?message: 'Deposit confirmed successfully',[\s\S]*?deposit[\s\S]*?\}\);[\s\S]*?\} catch \(error\) \{[\s\S]*?res\.status\(500\)\.json\([\s\S]*?\\);[\s\S]*?\}\);[\s\S]*?\}\);[\s\S]*?\}\);/;

const userEndpointReplacement = `// Admin: Confirm deposit (for admin use)
app.put('/api/deposits/:id/confirm', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ 
        success: false, 
        error: 'Deposit not found' 
      });
    }

    // Update user balance and check for task unlocking
    const user = await User.findById(deposit.userId);
    if (user) {
      // Update deposit status first
      deposit.status = 'confirmed';
      deposit.confirmedAt = new Date();
      if (notes) deposit.notes = notes;

      // Save the deposit
      await deposit.save();
      
      // Calculate total confirmed deposits for this user
      const totalConfirmedDeposits = await Deposit.aggregate([
        { $match: { userId: deposit.userId, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const totalDeposits = totalConfirmedDeposits.length > 0 ? totalConfirmedDeposits[0].total : 0;
      
      console.log(\`🔍 USER DEPOSIT DEBUG: User \${user.username}, totalDeposits=\${totalDeposits}, deposit.amount=\${deposit.amount}\`);
      
      // Set hasDeposited to true if user has any confirmed deposits
      user.hasDeposited = totalDeposits > 0;
      
      // Calculate balance: total deposits - 10 (first $10 is for unlocking tasks)
      if (totalDeposits >= 10) {
        user.balance = totalDeposits - 10;
        console.log(\`✅ USER: Balance calculated as \${totalDeposits} - 10 = \${user.balance} for user \${user.username}\`);
      } else {
        user.balance = 0;
        console.log(\`✅ USER: Balance set to 0 (total deposits \${totalDeposits} < 10) for user \${user.username}\`);
      }
      
      await user.save();
      
      // Update the session user object if the user is logged in
      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {
        req.user = user;
        console.log('✅ Updated session user object');
      } else {
        console.log('⚠️ Could not update session - session info:', {
          hasSession: !!req.session,
          hasPassport: !!(req.session && req.session.passport),
          sessionUserId: req.session?.passport?.user,
          actualUserId: user._id.toString(),
          isUserEndpoint: true
        });
      }
      
      // Check if this deposit completes any pending referrals
      await checkAndCompleteReferrals(user._id);
    }

    res.json({
      success: true,
      message: 'Deposit confirmed successfully',
      deposit
    });

  } catch (error) {
    console.error('Error confirming deposit:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to confirm deposit',
      details: error.message 
    });
  }
});`;

// Apply the fixes
let updatedContent = content;

// Replace admin endpoint
if (content.includes('// Admin: Confirm deposit (no authentication required for admin panel)')) {
  updatedContent = updatedContent.replace(adminEndpointPattern, adminEndpointReplacement);
  console.log('✅ Updated admin deposit confirmation endpoint');
} else {
  console.log('⚠️ Could not find admin deposit confirmation endpoint pattern');
}

// Replace user endpoint
if (content.includes('// Admin: Confirm deposit (for admin use)')) {
  updatedContent = updatedContent.replace(userEndpointPattern, userEndpointReplacement);
  console.log('✅ Updated user deposit confirmation endpoint');
} else {
  console.log('⚠️ Could not find user deposit confirmation endpoint pattern');
}

// Write the updated content back to app.js
fs.writeFileSync(appJsPath, updatedContent, 'utf8');
console.log('✅ Successfully updated app.js with new deposit balance logic');

console.log('\n📋 Summary of new logic applied:');
console.log('1. ✅ New balance calculation: balance = total deposits - 10');
console.log('2. ✅ hasDeposited = true when user has any confirmed deposits');
console.log('3. ✅ First $10 deposit: balance = 0, hasDeposited = true');
console.log('4. ✅ Second $10 deposit: balance = 10, hasDeposited = true');
console.log('5. ✅ Third $5 deposit: balance = 15, hasDeposited = true');
console.log('\n🚀 The backend will now correctly:');
console.log('   - Calculate balance as total deposits - 10');
console.log('   - Set hasDeposited = true for any confirmed deposit');
console.log('   - Unlock tasks after first deposit');
console.log('   - Show correct balance in frontend'); 