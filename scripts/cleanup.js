#!/usr/bin/env node

/**
 * SmartLab Project Cleanup Script
 * 
 * This script helps maintain the organized project structure by:
 * - Finding duplicate files
 * - Identifying unused imports
 * - Suggesting file moves
 * - Cleaning up temporary files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// File patterns to check
const PATTERNS = {
  components: 'src/components/**/*.{js,jsx,ts,tsx}',
  pages: 'src/pages/**/*.{js,jsx,ts,tsx}',
  utils: 'src/utils/**/*.{js,jsx,ts,tsx}',
  tempFiles: '**/.DS_Store',
  duplicateFiles: '**/*.{js,jsx,ts,tsx}'
};

// Directories that should be organized
const ORGANIZED_DIRS = [
  'src/components',
  'src/pages', 
  'src/utils',
  'src/contexts',
  'src/hooks',
  'src/styles',
  'src/types'
];

function findFiles(pattern) {
  return glob.sync(pattern, { cwd: ROOT_DIR });
}

function findDuplicates() {
  console.log('🔍 Finding duplicate files...');
  
  const allFiles = findFiles(PATTERNS.duplicateFiles);
  const fileMap = new Map();
  const duplicates = [];
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    const hash = require('crypto').createHash('md5').update(content).digest('hex');
    
    if (fileMap.has(hash)) {
      duplicates.push({
        original: fileMap.get(hash),
        duplicate: file,
        hash
      });
    } else {
      fileMap.set(hash, file);
    }
  });
  
  return duplicates;
}

function findUnusedImports() {
  console.log('🔍 Finding potentially unused imports...');
  
  const componentFiles = findFiles(PATTERNS.components);
  const pageFiles = findFiles(PATTERNS.pages);
  const allFiles = [...componentFiles, ...pageFiles];
  
  const unusedImports = [];
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
    
    if (importMatches) {
      importMatches.forEach(match => {
        const importPath = match.match(/from\s+['"]([^'"]+)['"]/)[1];
        
        // Check if it's a relative import
        if (importPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(path.join(ROOT_DIR, file)), importPath);
          const possibleExtensions = ['.js', '.jsx', '.ts', '.tsx'];
          
          const exists = possibleExtensions.some(ext => {
            return fs.existsSync(resolvedPath + ext) || fs.existsSync(resolvedPath + '/index' + ext);
          });
          
          if (!exists) {
            unusedImports.push({
              file,
              import: match,
              path: importPath
            });
          }
        }
      });
    }
  });
  
  return unusedImports;
}

function suggestFileMoves() {
  console.log('🔍 Suggesting file moves for better organization...');
  
  const suggestions = [];
  
  // Check for files that should be in organized directories
  const allFiles = findFiles('src/**/*.{js,jsx,ts,tsx}');
  
  allFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    const stats = fs.statSync(filePath);
    
    // Skip if file is already in an organized directory
    const isInOrganizedDir = ORGANIZED_DIRS.some(dir => file.startsWith(dir));
    
    if (!isInOrganizedDir && stats.size > 1000) { // Files larger than 1KB
      const fileName = path.basename(file);
      const dirName = path.dirname(file);
      
      // Suggest moves based on file name patterns
      if (fileName.includes('Component') || fileName.includes('Modal') || fileName.includes('Button')) {
        suggestions.push({
          file,
          suggestedPath: `src/components/${fileName}`,
          reason: 'Component file should be in components directory'
        });
      } else if (fileName.includes('Page') || fileName.includes('View')) {
        suggestions.push({
          file,
          suggestedPath: `src/pages/${fileName}`,
          reason: 'Page file should be in pages directory'
        });
      } else if (fileName.includes('Util') || fileName.includes('Helper') || fileName.includes('Utils')) {
        suggestions.push({
          file,
          suggestedPath: `src/utils/${fileName}`,
          reason: 'Utility file should be in utils directory'
        });
      }
    }
  });
  
  return suggestions;
}

function cleanupTempFiles() {
  console.log('🧹 Cleaning up temporary files...');
  
  const tempFiles = findFiles(PATTERNS.tempFiles);
  let cleanedCount = 0;
  
  tempFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`  ✅ Removed: ${file}`);
      cleanedCount++;
    } catch (error) {
      console.log(`  ❌ Failed to remove: ${file}`);
    }
  });
  
  return cleanedCount;
}

function generateReport() {
  console.log('\n📊 SmartLab Project Cleanup Report\n');
  console.log('=' .repeat(50));
  
  // Find duplicates
  const duplicates = findDuplicates();
  if (duplicates.length > 0) {
    console.log('\n🔴 Duplicate Files Found:');
    duplicates.forEach(({ original, duplicate }) => {
      console.log(`  - ${original} ↔ ${duplicate}`);
    });
  } else {
    console.log('\n✅ No duplicate files found');
  }
  
  // Find unused imports
  const unusedImports = findUnusedImports();
  if (unusedImports.length > 0) {
    console.log('\n🔴 Potentially Unused Imports:');
    unusedImports.forEach(({ file, import: importStatement, path: importPath }) => {
      console.log(`  - ${file}: ${importStatement}`);
    });
  } else {
    console.log('\n✅ No unused imports found');
  }
  
  // Suggest file moves
  const suggestions = suggestFileMoves();
  if (suggestions.length > 0) {
    console.log('\n🟡 File Organization Suggestions:');
    suggestions.forEach(({ file, suggestedPath, reason }) => {
      console.log(`  - ${file} → ${suggestedPath} (${reason})`);
    });
  } else {
    console.log('\n✅ All files are well organized');
  }
  
  // Cleanup temp files
  const cleanedCount = cleanupTempFiles();
  if (cleanedCount > 0) {
    console.log(`\n✅ Cleaned up ${cleanedCount} temporary files`);
  } else {
    console.log('\n✅ No temporary files to clean');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n💡 Recommendations:');
  console.log('1. Review duplicate files and remove unnecessary ones');
  console.log('2. Fix unused imports to improve build performance');
  console.log('3. Consider moving files to suggested locations');
  console.log('4. Run this script regularly to maintain organization');
}

// Run the cleanup
if (require.main === module) {
  generateReport();
}

module.exports = {
  findDuplicates,
  findUnusedImports,
  suggestFileMoves,
  cleanupTempFiles,
  generateReport
};
