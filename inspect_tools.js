const fs = require('fs');
const file = 'C:\\Users\\hp\\AppData\\Local\\npm-cache\\_npx\\af83b2f376097e2c\\node_modules\\@insforge\\mcp\\dist\\chunk-VMC7ZO3K.js';
const content = fs.readFileSync(file, 'utf8');
const toolMatches = content.matchAll(/registerTool\(\s*["']([^"']+)["']/g);
for (const match of toolMatches) {
  console.log('Tool:', match[1]);
}
