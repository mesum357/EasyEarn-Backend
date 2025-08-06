const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Removing duplicate response block...');

// The duplicate block starts with "    res.json({" and ends with "  });"
// Let me find and remove it
const lines = content.split('\n');

// Find the duplicate block (around line 1450)
let startIndex = -1;
let endIndex = -1;

for (let i = 1445; i < 1470; i++) {
  if (lines[i] && lines[i].trim() === '});' && 
      lines[i+1] && lines[i+1].includes('    res.json({') &&
      lines[i+1].includes('success: true')) {
    startIndex = i + 1;
    console.log('Found duplicate block start at line', startIndex);
    break;
  }
}

if (startIndex !== -1) {
  // Find the end of the duplicate block
  for (let i = startIndex; i < startIndex + 20; i++) {
    if (lines[i] && lines[i].trim() === '});') {
      endIndex = i;
      console.log('Found duplicate block end at line', endIndex);
      break;
    }
  }
  
  if (endIndex !== -1) {
    // Remove the duplicate block
    lines.splice(startIndex, endIndex - startIndex + 1);
    console.log('✅ Removed duplicate response block');
  }
}

// Write the updated content back to the file
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');

console.log('✅ Duplicate block fix applied successfully!'); 