import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import QRCode from 'qrcode-generator';

// Color constants for professional medical documents
const COLORS = {
  primary: rgb(0, 0.35, 0.61), // #005A9C - Professional blue
  secondary: rgb(0.83, 0.18, 0.18), // #D32F2F - Clinical red
  text: rgb(0.13, 0.13, 0.13), // #222222 - Dark text
  textLight: rgb(0.4, 0.4, 0.4), // #666666 - Light text
  background: rgb(0.94, 0.94, 0.94), // #F0F0F0 - Light background
  border: rgb(0.9, 0.9, 0.9), // #E5E7EB - Border color
  abnormal: rgb(0.83, 0.18, 0.18), // #D32F2F - Abnormal result color
  normal: rgb(0.06, 0.73, 0.51), // #10B981 - Normal result color
  warning: rgb(0.96, 0.62, 0.26), // #F59E42 - Warning color
};

// Font sizes and spacing constants
const SIZES = {
  title: 18,
  subtitle: 14,
  heading: 12,
  body: 10,
  small: 8,
  tiny: 6,
};

// A4 dimensions in points (1 point = 1/72 inch)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

// Work slip dimensions (70mm x 99mm converted to points)
const SLIP_WIDTH = 198.43; // 70mm
const SLIP_HEIGHT = 280.63; // 99mm

/**
 * Generate QR code as PDF image
 */
function generateQRCode(text, size = 50) {
  const qr = QRCode(0, 'M');
  qr.addData(text);
  qr.make();
  
  const cellSize = size / qr.getModuleCount();
  const margin = 0;
  const canvas = document.createElement('canvas');
  canvas.width = size + 2 * margin;
  canvas.height = size + 2 * margin;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#000000';
  for (let row = 0; row < qr.getModuleCount(); row++) {
    for (let col = 0; col < qr.getModuleCount(); col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          margin + col * cellSize,
          margin + row * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate barcode (Code 128) as text representation
 * Note: For production, consider using a proper barcode library
 */
function generateBarcode(text) {
  // Simple text representation - in production use proper barcode library
  return `*${text}*`;
}

/**
 * Create a work slip (Master or Lab-specific)
 */
async function createWorkSlip(pdfDoc, data, slipType = 'master', department = null) {
  const page = pdfDoc.addPage([SLIP_WIDTH, SLIP_HEIGHT]);
  const { width, height } = page.getSize();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = height - 20;
  
  // Header
  page.drawText('Aziziyah General Hospital', {
    x: 10,
    y,
    size: SIZES.heading,
    font: boldFont,
    color: COLORS.primary,
  });
  
  y -= 20;
  page.drawText(slipType === 'master' ? 'Master Work Slip' : `${department} Work Slip`, {
    x: 10,
    y,
    size: SIZES.subtitle,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 30;
  
  // Patient Information
  page.drawText('Patient Information:', {
    x: 10,
    y,
    size: SIZES.body,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Name: ${data.patientInfo.name}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`ID: ${data.patientInfo.patientId}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`Age/Gender: ${data.patientInfo.age}Y / ${data.patientInfo.gender}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`Visit ID: ${data.visitInfo.visitId}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`Date: ${new Date(data.visitInfo.registrationDate).toLocaleDateString()}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 25;
  
  // Barcode
  const barcodeText = generateBarcode(data.visitInfo.visitId);
  page.drawText('Barcode:', {
    x: 10,
    y,
    size: SIZES.small,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 10;
  page.drawText(barcodeText, {
    x: 10,
    y,
    size: SIZES.tiny,
    font: font,
    color: COLORS.text,
  });
  
  y -= 20;
  
  // QR Code placeholder
  const qrData = JSON.stringify({
    patientId: data.patientInfo.patientId,
    visitId: data.visitInfo.visitId,
    name: data.patientInfo.name,
  });
  
  page.drawText('QR Code:', {
    x: 10,
    y,
    size: SIZES.small,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 10;
  page.drawText(qrData.substring(0, 30) + '...', {
    x: 10,
    y,
    size: SIZES.tiny,
    font: font,
    color: COLORS.textLight,
  });
  
  y -= 25;
  
  // Tests
  const filteredTests = department 
    ? data.tests.filter(test => test.department === department)
    : data.tests;
  
  page.drawText('Tests:', {
    x: 10,
    y,
    size: SIZES.body,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 15;
  
  filteredTests.forEach((test, index) => {
    if (y > 50) { // Ensure we don't go off the page
      page.drawText(`${index + 1}. ${test.testName}`, {
        x: 10,
        y,
        size: SIZES.small,
        font: font,
        color: COLORS.text,
      });
      y -= 10;
    }
  });
  
  // Footer
  y = 30;
  page.drawText('Phlebotomist Signature: _________________', {
    x: 10,
    y,
    size: SIZES.small,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText('Collection Time: _________________', {
    x: 10,
    y,
    size: SIZES.small,
    font: font,
    color: COLORS.text,
  });
  
  return page;
}

/**
 * Create a 3x3 grid of work slips on A4 page
 */
async function createWorkSlipGrid(pdfDoc, data, slipType = 'master', department = null) {
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const { width, height } = page.getSize();
  
  // Calculate grid positions
  const marginX = (width - (SLIP_WIDTH * 3)) / 4;
  const marginY = (height - (SLIP_HEIGHT * 3)) / 4;
  
  const positions = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      positions.push({
        x: marginX + col * (SLIP_WIDTH + marginX),
        y: height - marginY - row * (SLIP_HEIGHT + marginY) - SLIP_HEIGHT,
      });
    }
  }
  
  // Create individual slip
  const slipDoc = await PDFDocument.create();
  const slipPage = await createWorkSlip(slipDoc, data, slipType, department);
  
  // Embed the slip into the main document 9 times
  for (const position of positions) {
    const embeddedPage = await pdfDoc.embedPage(slipPage);
    page.drawPage(embeddedPage, {
      x: position.x,
      y: position.y,
      width: SLIP_WIDTH,
      height: SLIP_HEIGHT,
    });
  }
  
  return page;
}

/**
 * Create the unified patient results report
 */
async function createResultsReport(pdfDoc, data) {
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const { width, height } = page.getSize();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = height - 40;
  
  // Header
  page.drawText('Aziziyah General Hospital', {
    x: 40,
    y,
    size: SIZES.title,
    font: boldFont,
    color: COLORS.primary,
  });
  
  y -= 20;
  page.drawText('Laboratory Results Report', {
    x: 40,
    y,
    size: SIZES.subtitle,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 30;
  
  // Hospital info (left column)
  page.drawText('Address: 123 Health St, Wasit, Iraq', {
    x: 40,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.textLight,
  });
  
  y -= 15;
  page.drawText('Contact: contact@agh.iq', {
    x: 40,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.textLight,
  });
  
  // Patient info (right column)
  y = height - 40;
  page.drawText(`Patient: ${data.patientInfo.name}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`ID: ${data.patientInfo.patientId}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Age/Gender: ${data.patientInfo.age}Y / ${data.patientInfo.gender}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Doctor: ${data.patientInfo.referringDoctor}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Collection: ${new Date(data.visitInfo.collectionDate).toLocaleDateString()}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Report: ${new Date(data.visitInfo.reportDate).toLocaleDateString()}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y = height - 180;
  
  // Group tests by department
  const departments = [...new Set(data.tests.map(test => test.department))];
  
  departments.forEach((dept, deptIndex) => {
    const deptTests = data.tests.filter(test => test.department === dept);
    
    // Department header
    page.drawText(dept, {
      x: 40,
      y,
      size: SIZES.heading,
      font: boldFont,
      color: COLORS.primary,
    });
    
    y -= 25;
    
    // Table header
    const tableY = y;
    const colWidths = [200, 80, 60, 120, 60];
    const startX = 40;
    
    // Draw table headers
    const headers = ['Test Name', 'Result', 'Units', 'Reference Range', 'Flag'];
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0),
        y: tableY,
        size: SIZES.body,
        font: boldFont,
        color: COLORS.primary,
      });
    });
    
    y -= 20;
    
    // Draw table rows
    deptTests.forEach((test, testIndex) => {
      if (y < 100) {
        // Start new page if needed
        page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        y = height - 40;
      }
      
      const isAbnormal = test.flag === 'high' || test.flag === 'low';
      const rowColor = isAbnormal ? COLORS.abnormal : COLORS.text;
      const rowFont = isAbnormal ? boldFont : font;
      
      // Test name
      page.drawText(test.testName, {
        x: startX,
        y,
        size: SIZES.body,
        font: rowFont,
        color: rowColor,
      });
      
      // Result
      page.drawText(test.result.toString(), {
        x: startX + colWidths[0],
        y,
        size: SIZES.body,
        font: rowFont,
        color: rowColor,
      });
      
      // Units
      page.drawText(test.units, {
        x: startX + colWidths[0] + colWidths[1],
        y,
        size: SIZES.body,
        font: rowFont,
        color: rowColor,
      });
      
      // Reference range
      page.drawText(test.referenceRange, {
        x: startX + colWidths[0] + colWidths[1] + colWidths[2],
        y,
        size: SIZES.body,
        font: rowFont,
        color: rowColor,
      });
      
      // Flag
      const flagSymbol = test.flag === 'high' ? '⬆' : test.flag === 'low' ? '⬇' : '';
      page.drawText(flagSymbol, {
        x: startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        y,
        size: SIZES.body,
        font: rowFont,
        color: rowColor,
      });
      
      y -= 15;
    });
    
    y -= 20; // Space between departments
  });
  
  // Comments section
  y -= 20;
  page.drawText('Comments / Interpretation:', {
    x: 40,
    y,
    size: SIZES.heading,
    font: boldFont,
    color: COLORS.primary,
  });
  
  y -= 20;
  page.drawText('_________________________________________________________________', {
    x: 40,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.textLight,
  });
  
  y -= 20;
  page.drawText('_________________________________________________________________', {
    x: 40,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.textLight,
  });
  
  // Signatures
  y -= 40;
  page.drawText('Lab Technologist: _________________', {
    x: 40,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  page.drawText('Pathologist / Director: _________________', {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  // QR Code and page number
  y -= 40;
  const qrData = JSON.stringify({
    visitId: data.visitInfo.visitId,
    patientId: data.patientInfo.patientId,
    reportDate: data.visitInfo.reportDate,
  });
  
  page.drawText('QR Code: ' + qrData.substring(0, 30) + '...', {
    x: 40,
    y,
    size: SIZES.small,
    font: font,
    color: COLORS.textLight,
  });
  
  page.drawText('Page 1 of 1', {
    x: width - 100,
    y,
    size: SIZES.small,
    font: font,
    color: COLORS.textLight,
  });
  
  return page;
}

/**
 * Main PDF generation function
 */
export async function generatePdf(documentType, data) {
  const pdfDoc = await PDFDocument.create();
  
  try {
    switch (documentType) {
      case 'masterSlip':
        await createWorkSlipGrid(pdfDoc, data, 'master');
        break;
        
      case 'labSlip':
        // Generate slips for each department
        const departments = [...new Set(data.tests.map(test => test.department))];
        for (const department of departments) {
          await createWorkSlipGrid(pdfDoc, data, 'lab', department);
        }
        break;
        
      case 'resultsReport':
        await createResultsReport(pdfDoc, data);
        break;
        
      default:
        throw new Error(`Unknown document type: ${documentType}`);
    }
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Generate and download PDF
 */
export async function generateAndDownloadPdf(documentType, data, filename) {
  try {
    const pdfBytes = await generatePdf(documentType, data);
    
    // Create blob and download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${documentType}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
}

/**
 * Generate PDF as base64 string
 */
export async function generatePdfAsBase64(documentType, data) {
  try {
    const pdfBytes = await generatePdf(documentType, data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    return `data:application/pdf;base64,${base64}`;
  } catch (error) {
    console.error('PDF base64 generation error:', error);
    throw error;
  }
}

export default {
  generatePdf,
  generateAndDownloadPdf,
  generatePdfAsBase64,
}; 