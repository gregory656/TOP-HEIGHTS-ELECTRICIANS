const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.copyFileSync(path.join(root, 'dist/index.html'), path.join(root, 'backend/functions/storefront.html'));
console.log('Prepared the Firebase storefront template for product and article metadata.');
