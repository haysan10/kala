
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Fungsi rekursif manual karena saya tidak mau install glob package kalau belum ada
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file === 'route.ts') {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const apiDir = path.join(process.cwd(), 'src/app/api');
const files = getAllFiles(apiDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('force-dynamic')) {
    console.log(`Skipping ${file} - already dynamic`);
    return;
  }

  // Insert logic: Cari import terakhir, lalu sisipkan
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('importtype ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, '\nexport const dynamic = \'force-dynamic\';');
    console.log(`Updated ${file}`);
    fs.writeFileSync(file, lines.join('\n'));
  } else {
    // Fallback jika tidak ada import (jarang)
    console.log(`Warning: No imports found in ${file}, prepending...`);
    fs.writeFileSync(file, `export const dynamic = 'force-dynamic';\n${content}`);
  }
});

console.log('Update complete.');
