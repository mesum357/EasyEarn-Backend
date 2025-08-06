const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Fixing session update in deposit endpoints...');

// Fix the admin deposit confirmation endpoint to update session
const adminEndpointPattern = /\/\/ Admin: Confirm deposit \(no authentication required for admin panel\)[\s\S]*?await checkAndCompleteReferrals\(user\._id\);\s*}\s*res\.json\(/;
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

    // Update deposit status
    deposit.status = 'confirmed';
    deposit.confirmedAt = new Date();
    if (notes) deposit.notes = notes;

    // Save the deposit first so it's counted in confirmed deposits
    await deposit.save();

    // Update user balance and check for task unlocking
    const user = await User.findById(deposit.userId);
    if (user) {
      // Check if this is the user's first confirmed deposit (now including the current one)
      const totalConfirmedDeposits = await Deposit.countDocuments({ 
        userId: deposit.userId, 
        status: 'confirmed'
      });
      
      // If this is the first confirmed deposit and it's exactly $10, only unlock tasks
      if (totalConfirmedDeposits === 1 && deposit.amount === 10) {
        // This is the first $10 deposit - only unlock tasks, don't add to balance
        user.hasDeposited = true;
        console.log(`First $10 deposit confirmed for user ${user.username} - tasks unlocked, no balance added`);
      } else {
        // For subsequent deposits or different amounts, add to balance normally
        user.balance += deposit.amount;
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(`Deposit of $${deposit.amount} confirmed for user ${user.username} - balance updated`);
      }
      
      await user.save();
      
      // Update the session user object if the user is logged in
      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {
        req.user = user;
        console.log('✅ Updated session user object');
      }
      
      // Check if this deposit completes any pending referrals
      await checkAndCompleteReferrals(user._id);
    }

    res.json(`;

// Replace the admin endpoint
content = content.replace(adminEndpointPattern, adminEndpointReplacement);

// Fix the regular user deposit confirmation endpoint to update session
const userEndpointPattern = /\/\/ Admin: Confirm deposit \(for admin use\)[\s\S]*?await checkAndCompleteReferrals\(user\._id\);\s*}\s*res\.json\(/;
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

    // Update deposit status
    deposit.status = 'confirmed';
    deposit.confirmedAt = new Date();
    if (notes) deposit.notes = notes;

    // Save the deposit first so it's counted in confirmed deposits
    await deposit.save();

    // Update user balance and check for task unlocking
    const user = await User.findById(deposit.userId);
    if (user) {
      // Check if this is the user's first confirmed deposit (now including the current one)
      const totalConfirmedDeposits = await Deposit.countDocuments({ 
        userId: deposit.userId, 
        status: 'confirmed'
      });
      
      // If this is the first confirmed deposit and it's exactly $10, only unlock tasks
      if (totalConfirmedDeposits === 1 && deposit.amount === 10) {
        // This is the first $10 deposit - only unlock tasks, don't add to balance
        user.hasDeposited = true;
        console.log(`First $10 deposit confirmed for user ${user.username} - tasks unlocked, no balance added`);
      } else {
        // For subsequent deposits or different amounts, add to balance normally
        user.balance += deposit.amount;
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(`Deposit of $${deposit.amount} confirmed for user ${user.username} - balance updated`);
      }
      
      await user.save();
      
      // Update the session user object if the user is logged in
      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {
        req.user = user;
        console.log('✅ Updated session user object');
      }
      
      // Check if this deposit completes any pending referrals
      await checkAndCompleteReferrals(user._id);
    }

    res.json(`;

// Replace the user endpoint
content = content.replace(userEndpointPattern, userEndpointReplacement);

// Write the updated content back to the file
fs.writeFileSync(appJsPath, content, 'utf8');

console.log('✅ Session update fixes applied successfully!');
console.log('📝 Changes made:');
console.log('  - Added session user object update after user.save()');
console.log('  - This ensures the /me endpoint returns updated user data'); 