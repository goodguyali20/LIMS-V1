#!/usr/bin/env node

/**
 * File Organization Utility
 * Helps organize loose files in the project root
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const organizationRules = {
  // Documentation files
  'PHASE_': 'docs/phases/',
  'ADVANCED_': 'docs/summaries/',
  'COMPREHENSIVE_': 'docs/guides/',
  'LIBRARIES_': 'docs/guides/',
  'PDF_': 'docs/guides/',
  'PATIENT_': 'docs/guides/',
  'PERFORMANCE_': 'docs/summaries/',
  'DASHBOARD_': 'docs/summaries/',
  'LAYOUT_': 'docs/summaries/',
  'VISUAL_': 'docs/summaries/',
  'OPTIMIZATION_': 'docs/summaries/',
  'SOCKET_': 'docs/guides/',
  'RELEASE_': 'docs/releases/',
  'LIMS_': 'docs/guides/',
  
  // Script files
  'update_': 'scripts/data-migration/',
  'fix': 'scripts/data-migration/',
  'clean': 'scripts/data-migration/',
  'export': 'scripts/data-migration/',
  'seed': 'scripts/data-migration/',
  'test-': 'scripts/utilities/',
  
  // Configuration files
  'smartlab-lims-firebase-adminsdk': 'config/',
};

function organizeFiles() {
  const rootDir = path.resolve(__dirname, '../..');
  const files = fs.readdirSync(rootDir);
  
  let movedCount = 0;
  
  files.forEach(file => {
    // Skip directories and already organized files
    if (fs.statSync(path.join(rootDir, file)).isDirectory()) return;
    if (file === 'package.json' || file === 'README.md' || file === '.gitignore') return;
    
    // Check if file matches any organization rule
    for (const [prefix, targetDir] of Object.entries(organizationRules)) {
      if (file.startsWith(prefix)) {
        const targetPath = path.join(rootDir, targetDir);
        
        // Create target directory if it doesn't exist
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        
        const sourcePath = path.join(rootDir, file);
        const destPath = path.join(targetPath, file);
        
        // Move file
        fs.renameSync(sourcePath, destPath);
        console.log(`✅ Moved ${file} to ${targetDir}`);
        movedCount++;
        break;
      }
    }
  });
  
  if (movedCount === 0) {
    console.log('🎉 No files needed organization!');
  } else {
    console.log(`\n📁 Organized ${movedCount} files`);
  }
}

// Clean up temporary files
function cleanupTempFiles() {
  const rootDir = path.resolve(__dirname, '../..');
  const tempFiles = [
    '.DS_Store',
    'pglite-debug.log',
    'test-report.pdf'
  ];
  
  tempFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed ${file}`);
    }
  });
}

console.log('🧹 Organizing project files...\n');
organizeFiles();
console.log('\n🧹 Cleaning up temporary files...');
cleanupTempFiles();
console.log('\n✨ File organization complete!');
