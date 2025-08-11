import fetch from 'node-fetch';
import fs from 'fs/promises';

const API_URL = 'http://localhost:4000/generate-pdf';

const sampleData = {
  documentOptions: {
    language: 'en',
    includeHistoryGraph: true,
    includePatientSummary: false
  },
  visitInfo: {
    visitId: "V-67890",
    isVerified: false,
    date: "2025-01-15",
    internalNotes: [
      { user: "Nora (Phleb)", note: "Patient was very nervous. Collection took two attempts." },
      { user: "Ahmed (Tech)", note: "Slight hemolysis observed in sample." }
    ]
  },
  patientInfo: {
    patientId: "P-12345",
    name: "Jane S. Smith",
    age: 42,
    gender: "Female"
  },
  hospitalInfo: {
    name: "Aziziyah General Hospital",
    address: "123 Health St, Wasit, Iraq"
  },
  tests: [
    {
      testName: "Hemoglobin",
      department: "Hematology",
      result: "9.5",
      units: "g/dL",
      referenceRange: "12.1 - 15.1",
      flag: "critical_low",
      history: [
        { date: "2025-01-20", value: 11.2 },
        { date: "2025-04-10", value: 10.8 },
        { date: "2025-07-15", value: 9.5 }
      ]
    },
    {
      testName: "Glucose",
      department: "Chemistry",
      result: "150",
      units: "mg/dL",
      referenceRange: "70 - 99",
      flag: "high",
      history: [
        { date: "2025-01-20", value: 140 },
        { date: "2025-04-10", value: 145 },
        { date: "2025-07-15", value: 150 }
      ]
    }
  ]
};

const lang = {
  reportTitle: "Laboratory Report",
  patientNameLabel: "Patient Name",
  patientIdLabel: "Patient ID",
  genderLabel: "Gender",
  ageLabel: "Age",
  visitIdLabel: "Visit ID",
  dateLabel: "Date",
  testNameLabel: "Test",
  resultLabel: "Result",
  unitsLabel: "Units",
  referenceRangeLabel: "Reference Range",
  flagLabel: "Flag",
  historyLabel: "History",
  historyGraphAlt: "Test History",
  preliminaryReportNote: "PRELIMINARY REPORT - PENDING FINAL VERIFICATION & SIGNATURE"
};

async function testPdfApi() {
  try {
    console.log('🧪 Testing PDF API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentType: 'resultsReport',
        data: sampleData,
        lang
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const pdfBuffer = await response.buffer();
    await fs.writeFile('test-report.pdf', pdfBuffer);
    
    console.log('✅ PDF generated successfully!');
    console.log('📄 Saved as: test-report.pdf');
    console.log('📊 Size:', pdfBuffer.length, 'bytes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPdfApi(); 