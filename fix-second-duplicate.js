const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

console.log('🔧 Removing second duplicate block...');

// Split content into lines
const lines = content.split('\n');

// Remove lines 1666-1678 (the second duplicate response block)
const startIndex = 1665; // Line 1666
const endIndex = 1677;   // Line 1678

console.log(`Removing lines ${startIndex + 1} to ${endIndex + 1}`);

// Remove the duplicate block
lines.splice(startIndex, endIndex - startIndex + 1);

// Write the updated content back to the file
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');

console.log('✅ Second duplicate block removed successfully!'); 