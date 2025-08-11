#!/usr/bin/env node

/**
 * Test script to validate styled-components issues
 * This script tests the components directly to identify the root cause
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Styled Components Test Script ===\n');

// Test 1: Check if styled components are being recreated
console.log('1. Testing styled component recreation...');
try {
  // Simulate what happens when components are imported multiple times
  const styled = await import('styled-components');
  
  // Create a test styled component
  const TestComponent = styled.default.div`
    color: red;
  `;
  
  console.log('✓ TestComponent created successfully');
  console.log('  - Type:', typeof TestComponent);
  console.log('  - styledComponentId:', TestComponent.styledComponentId);
  console.log('  - $$typeof:', TestComponent.$$typeof);
  
  // Check if it's a valid React component
  if (TestComponent.$$typeof) {
    console.log('⚠️  WARNING: TestComponent has $$typeof - this suggests it might be a React element');
  }
  
} catch (error) {
  console.error('✗ Error creating test styled component:', error.message);
}

console.log('\n2. Testing component import patterns...');
try {
  // Check the actual component files for potential issues
  const printPreviewPath = path.join(__dirname, '../src/components/PatientRegistration/PrintPreviewModal.jsx');
  const styledMotionPath = path.join(__dirname, '../src/utils/styledMotion.jsx');
  
  if (fs.existsSync(printPreviewPath)) {
    const content = fs.readFileSync(printPreviewPath, 'utf8');
    
    // Check for styled components defined inside the component
    const styledInsideComponent = content.match(/const\s+\w+\s*=\s*styled\.\w+`/g);
    if (styledInsideComponent) {
      console.log('⚠️  WARNING: Found styled components defined inside component:', styledInsideComponent);
    } else {
      console.log('✓ No styled components defined inside component');
    }
    
    // Check for potential import issues
    const importIssues = content.match(/import\s+.*\s+from\s+['"]\.\.\/\.\.\/utils\/styledMotion\.jsx['"]/g);
    if (importIssues) {
      console.log('✓ StyledMotion import found');
    }
    
  } else {
    console.log('✗ PrintPreviewModal.jsx not found');
  }
  
  if (fs.existsSync(styledMotionPath)) {
    const content = fs.readFileSync(styledMotionPath, 'utf8');
    
    // Check for proper exports
    const exportPattern = /export\s+const\s+(\w+)\s*=\s*createStyledMotion\(/g;
    const exports = [];
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    console.log('✓ StyledMotion exports found:', exports);
    
  } else {
    console.log('✗ styledMotion.jsx not found');
  }
  
} catch (error) {
  console.error('✗ Error checking component files:', error.message);
}

console.log('\n3. Testing potential solutions...');
console.log('Based on the error analysis, the most likely issues are:');
console.log('  a) Styled components being created inside functional components');
console.log('  b) Styled components being passed as children instead of being rendered');
console.log('  c) Import/export issues with StyledMotion components');

console.log('\n4. Recommended fixes:');
console.log('  a) Move all styled component definitions outside of functional components');
console.log('  b) Ensure styled components are properly rendered with JSX syntax');
console.log('  c) Check for circular dependencies or import issues');
console.log('  d) Verify that StyledMotionDiv is properly exported and imported');

console.log('\n=== End Test Script ===');
