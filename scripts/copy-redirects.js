const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'public', '_redirects');
const dest = path.join(__dirname, '..', 'dist', '_redirects');

try {
  fs.copyFileSync(source, dest);
  console.log('✓ Copied _redirects file to dist/');
} catch (err) {
  console.error('✗ Failed to copy _redirects:', err.message);
  process.exit(1);
}
