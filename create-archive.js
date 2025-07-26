import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output stream
const output = fs.createWriteStream('quest-journal-app.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for archive events
output.on('close', function() {
  console.log(`Archive created: ${archive.pointer()} total bytes`);
  console.log('Download quest-journal-app.zip from the file explorer');
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to file
archive.pipe(output);

// Add files and directories
const filesToInclude = [
  'client/',
  'server/',
  'shared/',
  'public/',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  'drizzle.config.ts',
  'replit.md',
  '.replit',
  'README.md'
];

filesToInclude.forEach(item => {
  const itemPath = path.join(__dirname, item);
  if (fs.existsSync(itemPath)) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      archive.directory(itemPath, item);
    } else {
      archive.file(itemPath, { name: item });
    }
  }
});

// Exclude node_modules and other unnecessary files
archive.glob('**/*', {
  cwd: __dirname,
  ignore: [
    'node_modules/**',
    '.git/**',
    '*.zip',
    'dist/**',
    '.next/**',
    'coverage/**',
    '*.log',
    'attached_assets/**'
  ]
});

// Finalize the archive
archive.finalize();