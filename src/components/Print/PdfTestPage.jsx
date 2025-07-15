import React, { useState } from 'react';
import styled from 'styled-components';
import { generateAndDownloadPdf, generatePdfAsBase64 } from '../../utils/pdfGenerator.js';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  background: white;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #005A9C, #004a8c);
  color: white;
  border-radius: 12px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const TestSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#005A9C' : '#f8f9fa'};
  color: ${props => props.variant === 'primary' ? 'white' : '#005A9C'};
  border: 2px solid #005A9C;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#004a8c' : '#e9ecef'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: ${props => props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#d1ecf1'};
  color: ${props => props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0c5460'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : props.type === 'error' ? '#f5c6cb' : '#bee5eb'};
`;

const DataPreview = styled.div`
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-top: 1rem;
`;

const PdfTestPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState(null);

  // Sample data for testing
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
        testId: "GLU",
        testName: "Glucose, Fasting",
        department: "Chemistry",
        result: 150,
        units: "mg/dL",
        referenceRange: "70 - 99",
        flag: "high"
      },
      {
        testId: "RF",
        testName: "Rheumatoid Factor",
        department: "Serology",
        result: 25,
        units: "IU/mL",
        referenceRange: "< 15",
        flag: "high"
      }
    ],
    hospitalInfo: {
      name: "Aziziyah General Hospital",
      address: "123 Health St, Wasit, Iraq",
      contact: "contact@agh.iq"
    }
  };

  const handleGeneratePdf = async (documentType) => {
    setIsGenerating(true);
    setStatus({ type: 'info', message: `Generating ${documentType}...` });
    
    try {
      const filename = `${documentType}_test_${Date.now()}.pdf`;
      await generateAndDownloadPdf(documentType, sampleData, filename);
      
      setStatus({ 
        type: 'success', 
        message: `✅ ${documentType} generated and downloaded successfully!` 
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setStatus({ 
        type: 'error', 
        message: `❌ Error generating ${documentType}: ${error.message}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPdf = async (documentType) => {
    setIsGenerating(true);
    setStatus({ type: 'info', message: `Generating ${documentType} preview...` });
    
    try {
      const base64Data = await generatePdfAsBase64(documentType, sampleData);
      
      // Open PDF in new tab
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head><title>${documentType} Preview</title></head>
          <body style="margin:0;padding:0;">
            <embed src="${base64Data}" type="application/pdf" width="100%" height="100%">
          </body>
        </html>
      `);
      
      setStatus({ 
        type: 'success', 
        message: `✅ ${documentType} preview opened in new tab!` 
      });
    } catch (error) {
      console.error('PDF preview error:', error);
      setStatus({ 
        type: 'error', 
        message: `❌ Error generating ${documentType} preview: ${error.message}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>PDF Generation Test</Title>
        <Subtitle>
          Test the PDF generation system for your LIMS
        </Subtitle>
      </Header>

      <TestSection>
        <h2 style={{ color: '#005A9C', marginBottom: '1rem' }}>📄 Generate PDF Documents</h2>
        
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={() => handleGeneratePdf('masterSlip')}
            disabled={isGenerating}
          >
            📋 Master Work Slip
          </Button>
          <Button
            variant="primary"
            onClick={() => handleGeneratePdf('labSlip')}
            disabled={isGenerating}
          >
            🧪 Lab-Specific Slips
          </Button>
          <Button
            variant="primary"
            onClick={() => handleGeneratePdf('resultsReport')}
            disabled={isGenerating}
          >
            📊 Results Report
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            onClick={() => handlePreviewPdf('masterSlip')}
            disabled={isGenerating}
          >
            👁️ Preview Master Slip
          </Button>
          <Button
            onClick={() => handlePreviewPdf('resultsReport')}
            disabled={isGenerating}
          >
            👁️ Preview Results Report
          </Button>
        </ButtonGroup>

        {status && (
          <StatusMessage type={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </TestSection>

      <TestSection>
        <h2 style={{ color: '#005A9C', marginBottom: '1rem' }}>📊 Sample Data</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          The PDF generator uses this sample data for testing:
        </p>
        <DataPreview>
          {JSON.stringify(sampleData, null, 2)}
        </DataPreview>
      </TestSection>

      <TestSection>
        <h2 style={{ color: '#005A9C', marginBottom: '1rem' }}>🎯 Features Tested</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>📋 Master Work Slips</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              3×3 grid on A4 page, 70mm × 99mm slips with patient info and barcodes.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>🧪 Lab-Specific Slips</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Department-filtered slips for Hematology, Chemistry, and Serology.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>📊 Results Reports</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Professional patient reports with abnormal result highlighting.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>🎨 Professional Design</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Medical-grade typography, clinical colors, and proper layout.
            </p>
          </div>
        </div>
      </TestSection>

      <TestSection>
        <h2 style={{ color: '#005A9C', marginBottom: '1rem' }}>✅ System Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#155724' }}>PDF Engine</div>
            <div style={{ fontSize: '0.9rem', color: '#155724' }}>Ready</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#155724' }}>Barcode Support</div>
            <div style={{ fontSize: '0.9rem', color: '#155724' }}>Ready</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#155724' }}>QR Codes</div>
            <div style={{ fontSize: '0.9rem', color: '#155724' }}>Ready</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#155724' }}>Medical Design</div>
            <div style={{ fontSize: '0.9rem', color: '#155724' }}>Ready</div>
          </div>
        </div>
      </TestSection>
    </Container>
  );
};

export default PdfTestPage; 