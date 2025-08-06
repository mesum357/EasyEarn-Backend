const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Fixing syntax error in app.js...');

// Split content into lines
const lines = content.split('\n');

// Find and remove the duplicate response block (around line 1450)
let foundDuplicate = false;
for (let i = 1445; i < 1470; i++) {
  if (lines[i] && lines[i].includes('});') && 
      lines[i+1] && lines[i+1].includes('res.json({') &&
      lines[i+1].includes('success: true')) {
    
    // This is the duplicate block, remove it
    console.log('Found duplicate response block at line', i+1);
    
    // Remove the duplicate lines (from the res.json to the closing });
    let j = i + 1;
    while (j < lines.length && !(lines[j].includes('});') && lines[j].trim() === '});')) {
      j++;
    }
    
    // Remove the duplicate block
    lines.splice(i + 1, j - i);
    foundDuplicate = true;
    console.log('✅ Removed duplicate response block');
    break;
  }
}

if (!foundDuplicate) {
  console.log('❌ Could not find duplicate response block');
}

// Write the updated content back to the file
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');

console.log('✅ Syntax error fix applied successfully!'); 