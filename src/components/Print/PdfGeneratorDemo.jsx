import React, { useState } from 'react';
import styled from 'styled-components';
import { generateAndDownloadPdf, generatePdfAsBase64 } from '../../utils/pdfGenerator';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: #005A9C;
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const DemoSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #005A9C;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
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

const DataPreview = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const JsonDisplay = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: ${props => props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#d1ecf1'};
  color: ${props => props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0c5460'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : props.type === 'error' ? '#f5c6cb' : '#bee5eb'};
`;

const PdfGeneratorDemo = () => {
  const [status, setStatus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data matching the required structure
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
      contact: "contact@agh.iq",
      logoUrl: "path/to/your/logo.png"
    }
  };

  const handleGeneratePdf = async (documentType) => {
    setIsGenerating(true);
    setStatus({ type: 'info', message: `Generating ${documentType}...` });
    
    try {
      const filename = `${documentType}_${sampleData.patientInfo.patientId}_${Date.now()}.pdf`;
      await generateAndDownloadPdf(documentType, sampleData, filename);
      
      setStatus({ 
        type: 'success', 
        message: `${documentType} generated and downloaded successfully!` 
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setStatus({ 
        type: 'error', 
        message: `Error generating ${documentType}: ${error.message}` 
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
        message: `${documentType} preview opened in new tab!` 
      });
    } catch (error) {
      console.error('PDF preview error:', error);
      setStatus({ 
        type: 'error', 
        message: `Error generating ${documentType} preview: ${error.message}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>PDF Generation Demo</Title>
        <Subtitle>
          Advanced PDF generation system for Laboratory Information Management System (LIMS)
        </Subtitle>
      </Header>

      <DemoSection>
        <SectionTitle>Document Types</SectionTitle>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Generate professional medical documents with precise formatting and professional design.
        </p>
        
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
            onClick={() => handlePreviewPdf('labSlip')}
            disabled={isGenerating}
          >
            👁️ Preview Lab Slips
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
      </DemoSection>

      <DemoSection>
        <SectionTitle>Sample Data Structure</SectionTitle>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          The PDF generator expects data in the following format:
        </p>
        <DataPreview>
          <JsonDisplay>
            {JSON.stringify(sampleData, null, 2)}
          </JsonDisplay>
        </DataPreview>
      </DemoSection>

      <DemoSection>
        <SectionTitle>Features</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>🎨 Professional Design</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Clean, medical-grade typography with professional color scheme and layout.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>📏 Precise Dimensions</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Work slips sized at 70mm x 99mm, arranged in 3x3 grid on A4 paper for efficient printing.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>🏥 Medical Standards</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Abnormal result highlighting, proper flagging, and clinical color coding.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>📱 QR & Barcode Ready</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Integrated QR codes and barcode support for efficient tracking and scanning.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>🔧 Flexible Output</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Download as PDF file or generate base64 for embedding in web applications.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#005A9C', marginBottom: '0.5rem' }}>📊 Department Grouping</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Automatic grouping of tests by department with clear visual separation.
            </p>
          </div>
        </div>
      </DemoSection>
    </Container>
  );
};

export default PdfGeneratorDemo; 