const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy markdown files from src to dist
const srcChecklists = path.join(__dirname, '..', 'src', 'resources', 'checklists');
const distChecklists = path.join(__dirname, '..', 'dist', 'resources', 'checklists');
const srcPolicies = path.join(__dirname, '..', 'src', 'resources', 'policies');
const distPolicies = path.join(__dirname, '..', 'dist', 'resources', 'policies');

console.log('Copying markdown files...');
copyDir(srcChecklists, distChecklists);
copyDir(srcPolicies, distPolicies);
console.log('Markdown files copied successfully!');
