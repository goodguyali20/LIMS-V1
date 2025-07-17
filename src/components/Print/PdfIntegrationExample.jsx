import React, { useState } from 'react';
import styled from 'styled-components';
// Use the PDF API endpoint instead.

const Container = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
`;

const Title = styled.h3`
  color: #005A9C;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#005A9C' : '#f8f9fa'};
  color: ${props => props.variant === 'primary' ? 'white' : '#005A9C'};
  border: 1px solid #005A9C;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#004a8c' : '#e9ecef'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
  background: ${props => props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#d1ecf1'};
  color: ${props => props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0c5460'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : props.type === 'error' ? '#f5c6cb' : '#bee5eb'};
  font-size: 0.9rem;
`;

const PdfIntegrationExample = ({ orderData, patientData, testResults }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState(null);

  // Transform existing data to PDF format
  const transformToPdfData = () => {
    return {
      patientInfo: {
        patientId: patientData?.patientId || orderData?.patientId || 'N/A',
        name: patientData?.name || orderData?.patientName || 'N/A',
        age: patientData?.age || orderData?.age || 'N/A',
        gender: patientData?.gender || orderData?.gender || 'N/A',
        referringDoctor: orderData?.referringDoctor || 'N/A'
      },
      visitInfo: {
        visitId: orderData?.id || orderData?.visitId || 'N/A',
        registrationDate: orderData?.registrationDate || new Date().toISOString(),
        collectionDate: orderData?.collectionDate || new Date().toISOString(),
        reportDate: new Date().toISOString()
      },
      tests: testResults?.map(result => ({
        testId: result.testId || result.testName?.substring(0, 3).toUpperCase(),
        testName: result.testName || result.test || 'Unknown Test',
        department: result.department || 'General',
        result: result.value || result.result || 'N/A',
        units: result.unit || result.units || '',
        referenceRange: result.referenceRange || result.normalRange || 'N/A',
        flag: result.status === 'critical' ? 'high' : 
              result.status === 'abnormal' ? 'high' : 'normal'
      })) || [],
      hospitalInfo: {
        name: "Aziziyah General Hospital",
        address: "123 Health St, Wasit, Iraq",
        contact: "contact@agh.iq"
      }
    };
  };

  const handleGeneratePdf = async (documentType) => {
    setIsGenerating(true);
    setStatus({ type: 'info', message: `Generating ${documentType}...` });
    
    try {
      const pdfData = transformToPdfData();
      
      // Validate data
      if (!pdfData.tests || pdfData.tests.length === 0) {
        throw new Error('No test data available for PDF generation');
      }
      
      const filename = `${documentType}_${pdfData.patientInfo.patientId}_${Date.now()}.pdf`;
      // Use the PDF API endpoint instead.
      
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
      const pdfData = transformToPdfData();
      // Use the PDF API endpoint instead.
      const base64Data = await generatePdfAsBase64(documentType, pdfData);
      
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

  // Check if we have enough data to generate PDFs
  const hasValidData = orderData && (patientData || orderData.patientName) && testResults?.length > 0;

  return (
    <Container>
      <Title>📄 PDF Generation</Title>
      
      {!hasValidData && (
        <StatusMessage type="error">
          ⚠️ Insufficient data for PDF generation. Please ensure patient information and test results are available.
        </StatusMessage>
      )}
      
      <ButtonGroup>
        <Button
          variant="primary"
          onClick={() => handleGeneratePdf('masterSlip')}
          disabled={isGenerating || !hasValidData}
        >
          📋 Master Slip
        </Button>
        <Button
          variant="primary"
          onClick={() => handleGeneratePdf('labSlip')}
          disabled={isGenerating || !hasValidData}
        >
          🧪 Lab Slips
        </Button>
        <Button
          variant="primary"
          onClick={() => handleGeneratePdf('resultsReport')}
          disabled={isGenerating || !hasValidData}
        >
          📊 Results Report
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button
          onClick={() => handlePreviewPdf('masterSlip')}
          disabled={isGenerating || !hasValidData}
        >
          👁️ Preview Master
        </Button>
        <Button
          onClick={() => handlePreviewPdf('resultsReport')}
          disabled={isGenerating || !hasValidData}
        >
          👁️ Preview Report
        </Button>
      </ButtonGroup>

      {status && (
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>
      )}

      {hasValidData && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          <strong>Available data:</strong> {testResults?.length || 0} tests, 
          Patient: {patientData?.name || orderData?.patientName || 'N/A'}
        </div>
      )}
    </Container>
  );
};

export default PdfIntegrationExample; 