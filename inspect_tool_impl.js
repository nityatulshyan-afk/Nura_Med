const fs = require('fs');
const file = 'C:\\Users\\hp\\AppData\\Local\\npm-cache\\_npx\\af83b2f376097e2c\\node_modules\\@insforge\\mcp\\dist\\chunk-VMC7ZO3K.js';
const content = fs.readFileSync(file, 'utf8');

function showAround(str, length = 600) {
  const idx = content.indexOf(str);
  if (idx !== -1) {
    console.log(`=== FOUND: ${str} ===`);
    console.log(content.slice(idx, idx + length));
  } else {
    console.log(`=== NOT FOUND: ${str} ===`);
  }
}

showAround('"get-anon-key"');
showAround('"get-backend-metadata"');
showAround('"run-raw-sql"');
showAround('"get-table-schema"');
