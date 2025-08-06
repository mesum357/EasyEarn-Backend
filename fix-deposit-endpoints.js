const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Fixing deposit endpoints...');

// Fix the admin deposit confirmation endpoint
const adminEndpointPattern = /\/\/ Admin: Confirm deposit \(no authentication required for admin panel\)[\s\S]*?await deposit\.save\(\);/;
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
        console.log(\`First $10 deposit confirmed for user \${user.username} - tasks unlocked, no balance added\`);
      } else {
        // For subsequent deposits or different amounts, add to balance normally
        user.balance += deposit.amount;
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(\`Deposit of $\${deposit.amount} confirmed for user \${user.username} - balance updated\`);
      }
      
      await user.save();
      
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

// Replace the admin endpoint
content = content.replace(adminEndpointPattern, adminEndpointReplacement);

// Fix the regular user deposit confirmation endpoint
const userEndpointPattern = /\/\/ Admin: Confirm deposit \(for admin use\)[\s\S]*?await deposit\.save\(\);/;
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
        console.log(\`First $10 deposit confirmed for user \${user.username} - tasks unlocked, no balance added\`);
      } else {
        // For subsequent deposits or different amounts, add to balance normally
        user.balance += deposit.amount;
        user.hasDeposited = true; // Ensure tasks remain unlocked
        console.log(\`Deposit of $\${deposit.amount} confirmed for user \${user.username} - balance updated\`);
      }
      
      await user.save();
      
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

// Replace the user endpoint
content = content.replace(userEndpointPattern, userEndpointReplacement);

// Write the updated content back to the file
fs.writeFileSync(appJsPath, content, 'utf8');

console.log('✅ Deposit endpoints fixed successfully!');
console.log('📝 Changes made:');
console.log('  - Save deposit before checking count');
console.log('  - Use totalConfirmedDeposits === 1 for first deposit check');
console.log('  - Fixed logic for first $10 deposit handling'); 