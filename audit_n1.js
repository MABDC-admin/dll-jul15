const fs = require('fs');
const path = require('path');

const DIR_TO_SCAN = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const nPlusOneIssues = [];

walkDir(DIR_TO_SCAN, (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Very rough regex to find loops with await prisma inside
  if (content.match(/(for\s*\(|map\(|forEach\()[^{}]*\{[^{}]*await\s+prisma\./is)) {
    nPlusOneIssues.push(filePath.replace(__dirname, ''));
  }
});

console.log("N+1 queries possible in:");
console.log(JSON.stringify(nPlusOneIssues, null, 2));
