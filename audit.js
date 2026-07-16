const fs = require('fs');
const path = require('path');

const DIR_TO_SCAN = path.join(__dirname, 'src');

const PATTERNS = [
  { name: 'JSON.parse without try/catch', regex: /JSON\.parse\(/g, checkContext: true },
  { name: 'window.location.reload()', regex: /window\.location\.reload\(\)/g },
  { name: 'console.log left in code', regex: /console\.log\(/g },
  { name: 'Hardcoded passwords', regex: /password\s*[:=]\s*['"].+['"]/gi },
];

const API_ROUTES_DIR = path.join(DIR_TO_SCAN, 'app', 'api');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const issues = [];

walkDir(DIR_TO_SCAN, (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check generic patterns
  lines.forEach((line, index) => {
    PATTERNS.forEach(pattern => {
      if (line.match(pattern.regex)) {
        // Skip console.log in api or server files if we only want to warn on client
        if (pattern.name === 'console.log left in code' && (filePath.includes('api') || filePath.includes('actions'))) {
           return;
        }
        
        if (pattern.checkContext) {
          // crude check if surrounded by try
          const contextStart = Math.max(0, index - 3);
          const context = lines.slice(contextStart, index + 1).join('\n');
          if (context.includes('try {') || context.includes('try{')) return;
        }

        issues.push({
          file: filePath.replace(__dirname, ''),
          line: index + 1,
          issue: pattern.name,
          snippet: line.trim()
        });
      }
    });
  });

  // Check API auth
  if (filePath.includes(path.join('app', 'api')) && filePath.endsWith('route.ts')) {
    if (!content.includes('getServerSession') && !content.includes('next-auth')) {
       issues.push({
          file: filePath.replace(__dirname, ''),
          line: 1,
          issue: 'Missing Authentication in API Route',
          snippet: 'No getServerSession found in route.ts'
        });
    }
  }
});

console.log(JSON.stringify(issues, null, 2));
