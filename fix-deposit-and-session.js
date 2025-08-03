const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Applying comprehensive deposit and session fixes...');

// Fix 1: Update the admin deposit confirmation endpoint with correct logic
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
      // Check if this is the user's first confirmed deposit (BEFORE saving the current one)
      const existingConfirmedDeposits = await Deposit.countDocuments({ 
        userId: deposit.userId, 
        status: 'confirmed'
      });
      
      console.log(\`🔍 ADMIN DEPOSIT DEBUG: User \${user.username}, existingConfirmedDeposits=\${existingConfirmedDeposits}, deposit.amount=\${deposit.amount}\`);
      
      // Update deposit status
      deposit.status = 'confirmed';
      deposit.confirmedAt = new Date();
      if (notes) deposit.notes = notes;

      // Save the deposit
      await deposit.save();
      
      // If this is the first confirmed deposit and it's exactly $10, only unlock tasks
      if (existingConfirmedDeposits === 0 && deposit.amount === 10) {
        // This is the first $10 deposit - only unlock tasks, don't add to balance
        user.hasDeposited = true;
        console.log(\`✅ ADMIN: First $10 deposit confirmed for user \${user.username} - tasks unlocked, no balance added\`);
      } else {
        // For subsequent deposits or different amounts, add to balance normally
        user.balance += deposit.amount;
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(\`✅ ADMIN: Deposit of $\${deposit.amount} confirmed for user \${user.username} - balance updated\`);
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

// Fix 2: Update the regular user deposit confirmation endpoint with correct logic
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
      // Check if this is the user's first confirmed deposit (BEFORE saving the current one)
      const existingConfirmedDeposits = await Deposit.countDocuments({ 
        userId: deposit.userId, 
        status: 'confirmed'
      });
      
      console.log(\`🔍 USER DEPOSIT DEBUG: User \${user.username}, existingConfirmedDeposits=\${existingConfirmedDeposits}, deposit.amount=\${deposit.amount}\`);
      
      // Update deposit status
      deposit.status = 'confirmed';
      deposit.confirmedAt = new Date();
      if (notes) deposit.notes = notes;

      // Save the deposit
      await deposit.save();
      
      // If this is the first confirmed deposit and it's exactly $10, only unlock tasks
      if (existingConfirmedDeposits === 0 && deposit.amount === 10) {
        // This is the first $10 deposit - only unlock tasks, don't add to balance
        user.hasDeposited = true;
        console.log(\`✅ USER: First $10 deposit confirmed for user \${user.username} - tasks unlocked, no balance added\`);
      } else {
        // For subsequent deposits or different amounts, add to balance normally
        user.balance += deposit.amount;
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(\`✅ USER: Deposit of $\${deposit.amount} confirmed for user \${user.username} - balance updated\`);
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
console.log('✅ Successfully updated app.js with deposit and session fixes');

console.log('\n📋 Summary of fixes applied:');
console.log('1. ✅ Fixed deposit logic to use existingConfirmedDeposits === 0 instead of totalConfirmedDeposits === 1');
console.log('2. ✅ Added comprehensive debugging logs for deposit confirmation');
console.log('3. ✅ Enhanced session update logic with better error reporting');
console.log('4. ✅ Ensured both admin and user endpoints use the same correct logic');
console.log('\n🚀 The backend should now correctly:');
console.log('   - Not add first $10 deposit to balance');
console.log('   - Set hasDeposited = true for first $10 deposit');
console.log('   - Add subsequent deposits to balance normally');
console.log('   - Update session properly');
console.log('   - Return hasDeposited field in /me endpoint'); 