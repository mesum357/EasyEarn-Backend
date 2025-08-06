const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Manually fixing session update in deposit endpoints...');

// Split content into lines
const lines = content.split('\n');

// Find and fix the admin endpoint (around line 1648)
let foundAdmin = false;
for (let i = 1640; i < 1660; i++) {
  if (lines[i] && lines[i].includes('await user.save();')) {
    // Insert session update after user.save()
    lines.splice(i + 1, 0, '      ');
    lines.splice(i + 2, 0, '      // Update the session user object if the user is logged in');
    lines.splice(i + 3, 0, '      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {');
    lines.splice(i + 4, 0, '        req.user = user;');
    lines.splice(i + 5, 0, '        console.log(\'✅ Updated session user object\');');
    lines.splice(i + 6, 0, '      }');
    lines.splice(i + 7, 0, '      ');
    foundAdmin = true;
    console.log('✅ Fixed admin endpoint at line', i);
    break;
  }
}

// Find and fix the user endpoint (around line 1422)
let foundUser = false;
for (let i = 1410; i < 1430; i++) {
  if (lines[i] && lines[i].includes('await user.save();')) {
    // Insert session update after user.save()
    lines.splice(i + 1, 0, '      ');
    lines.splice(i + 2, 0, '      // Update the session user object if the user is logged in');
    lines.splice(i + 3, 0, '      if (req.session && req.session.passport && req.session.passport.user === user._id.toString()) {');
    lines.splice(i + 4, 0, '        req.user = user;');
    lines.splice(i + 5, 0, '        console.log(\'✅ Updated session user object\');');
    lines.splice(i + 6, 0, '      }');
    lines.splice(i + 7, 0, '      ');
    foundUser = true;
    console.log('✅ Fixed user endpoint at line', i);
    break;
  }
}

if (!foundAdmin) {
  console.log('❌ Could not find admin endpoint');
}

if (!foundUser) {
  console.log('❌ Could not find user endpoint');
}

// Write the updated content back to the file
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');

console.log('✅ Session update fixes applied successfully!'); 