import { generatePdf, generateAndDownloadPdf, generatePdfAsBase64 } from './pdfGenerator.js';

// Sample test data
const sampleData = {
  patientInfo: {
    patientId: "P-12345",
    name: "Jane S. Smith",
    age: 42,
    gender: "Female",
    referringDoctor: "Dr. Emily Carter"
  },
  visitInfo: {
    visitId: "V-67890",
    registrationDate: "2025-01-15T10:30:00Z",
    collectionDate: "2025-01-15T10:45:00Z",
    reportDate: "2025-01-16T09:00:00Z"
  },
  tests: [
    {
      testId: "HGB",
      testName: "Hemoglobin",
      department: "Hematology",
      result: 10.5,
      units: "g/dL",
      referenceRange: "12.0 - 15.5",
      flag: "low"
    },
    {
      testId: "WBC",
      testName: "White Blood Cell Count",
      department: "Hematology",
      result: 7.2,
      units: "K/μL",
      referenceRange: "4.5 - 11.0",
      flag: "normal"
    },
    {
      testId: "GLU",
      testName: "Glucose, Fasting",
      department: "Chemistry",
      result: 150,
      units: "mg/dL",
      referenceRange: "70 - 99",
      flag: "high"
    },
    {
      testId: "CREA",
      testName: "Creatinine",
      department: "Chemistry",
      result: 0.9,
      units: "mg/dL",
      referenceRange: "0.6 - 1.2",
      flag: "normal"
    },
    {
      testId: "RF",
      testName: "Rheumatoid Factor",
      department: "Serology",
      result: 25,
      units: "IU/mL",
      referenceRange: "< 15",
      flag: "high"
    },
    {
      testId: "ANA",
      testName: "Antinuclear Antibody",
      department: "Serology",
      result: "1:40",
      units: "Titer",
      referenceRange: "< 1:40",
      flag: "normal"
    }
  ],
  hospitalInfo: {
    name: "Aziziyah General Hospital",
    address: "123 Health St, Wasit, Iraq",
    contact: "contact@agh.iq"
  }
};

// Test function
export async function testPdfGeneration() {
  console.log('🧪 Testing PDF Generation System...');
  
  try {
    // Test 1: Generate master slip
    console.log('📋 Testing Master Work Slip generation...');
    const masterSlipBytes = await generatePdf('masterSlip', sampleData);
    console.log('✅ Master slip generated successfully:', masterSlipBytes.length, 'bytes');
    
    // Test 2: Generate lab-specific slips
    console.log('🧪 Testing Lab-Specific Slips generation...');
    const labSlipBytes = await generatePdf('labSlip', sampleData);
    console.log('✅ Lab slips generated successfully:', labSlipBytes.length, 'bytes');
    
    // Test 3: Generate results report
    console.log('📊 Testing Results Report generation...');
    const resultsReportBytes = await generatePdf('resultsReport', sampleData);
    console.log('✅ Results report generated successfully:', resultsReportBytes.length, 'bytes');
    
    // Test 4: Generate base64
    console.log('🔗 Testing Base64 generation...');
    const base64Data = await generatePdfAsBase64('resultsReport', sampleData);
    console.log('✅ Base64 generated successfully:', base64Data.substring(0, 50) + '...');
    
    console.log('🎉 All PDF generation tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
    return false;
  }
}

// Test data validation
export function validateTestData(data) {
  const required = ['patientInfo', 'visitInfo', 'tests', 'hospitalInfo'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (!Array.isArray(data.tests) || data.tests.length === 0) {
    throw new Error('Tests array is required and must not be empty');
  }
  
  console.log('✅ Test data validation passed');
  return true;
}

// Export sample data for use in other components
export { sampleData }; 