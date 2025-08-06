const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Manually removing duplicate block...');

// Split content into lines
const lines = content.split('\n');

// Remove lines 1450-1465 (the duplicate response block)
// Note: array indices are 0-based, so line 1450 is at index 1449
const startIndex = 1449; // Line 1450
const endIndex = 1464;   // Line 1465

console.log(`Removing lines ${startIndex + 1} to ${endIndex + 1}`);

// Remove the duplicate block
lines.splice(startIndex, endIndex - startIndex + 1);

// Write the updated content back to the file
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');

console.log('✅ Duplicate block removed successfully!'); 