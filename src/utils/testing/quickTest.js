// Quick test script for PDF generation
import { testPdfGeneration, sampleData } from './pdfGenerator.test.js';

// Run the test when this module is imported
console.log('🚀 Starting PDF Generation Quick Test...');

// Test the PDF generation
testPdfGeneration()
  .then(success => {
    if (success) {
      console.log('✅ PDF Generation Test Completed Successfully!');
    } else {
      console.log('❌ PDF Generation Test Failed!');
    }
  })
  .catch(error => {
    console.error('💥 PDF Generation Test Error:', error);
  });

// Export for use in browser console
window.testPdfGeneration = testPdfGeneration;
window.sampleData = sampleData;

console.log('📋 PDF Generation functions available in browser console:');
console.log('- testPdfGeneration() - Run comprehensive tests');
console.log('- sampleData - Sample data for testing'); 