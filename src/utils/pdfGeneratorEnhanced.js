import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

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
 * Generate Code 128 barcode pattern
 * This is a simplified implementation - for production use a proper barcode library
 */
function generateCode128Pattern(text) {
  // Code 128 character set A (simplified)
  const code128A = {
    '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000',
    '4': '10010001100', '5': '10001001100', '6': '10011001000', '7': '10011000100',
    '8': '10001100100', '9': '11001001000', 'A': '11001000100', 'B': '11000100100',
    'C': '10110011100', 'D': '10011011100', 'E': '10011001110', 'F': '10111001100',
    'G': '10011101100', 'H': '10011100110', 'I': '11001110010', 'J': '11001011100',
    'K': '11001001110', 'L': '11011100100', 'M': '11001110100', 'N': '10011110100',
    'O': '10011110010', 'P': '11100101100', 'Q': '11100100110', 'R': '11100110010',
    'S': '11011011000', 'T': '11011000110', 'U': '11000110110', 'V': '10100011000',
    'W': '10001011000', 'X': '10001000110', 'Y': '10110001000', 'Z': '10001101000',
    '-': '10001100010', '.': '11010001000', ' ': '11010000100', '$': '10010001000',
    '/': '10010000100', '+': '10001010000', '%': '10001000100', '*': '10110111000'
  };

  let pattern = '11010000100'; // Start code A
  for (let char of text.toUpperCase()) {
    if (code128A[char]) {
      pattern += code128A[char];
    } else {
      pattern += code128A[' ']; // Default to space for unknown characters
    }
  }
  
  // Calculate checksum (simplified)
  let checksum = 103; // Start code A value
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    const charCode = char.charCodeAt(0);
    checksum += (charCode - 32) * (i + 1);
  }
  checksum = checksum % 103;
  
  // Add checksum and stop code
  const checksumChar = Object.keys(code128A)[checksum] || '0';
  pattern += code128A[checksumChar] + '1100011101011'; // Stop code
  
  return pattern;
}

/**
 * Draw barcode on PDF page
 */
function drawBarcode(page, text, x, y, width = 100, height = 20) {
  const pattern = generateCode128Pattern(text);
  const barWidth = width / pattern.length;
  
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      page.drawRectangle({
        x: x + (i * barWidth),
        y,
        width: barWidth,
        height,
        color: COLORS.text,
      });
    }
  }
  
  // Draw text below barcode
  page.drawText(text, {
    x: x,
    y: y - 10,
    size: SIZES.tiny,
    color: COLORS.text,
  });
}

/**
 * Generate QR code data URL
 */
function generateQRCodeDataURL(text, size = 50) {
  // Create a simple QR-like pattern for demo purposes
  // In production, use a proper QR code library
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Fill with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  
  // Create a simple pattern based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const cellSize = size / 8;
  ctx.fillStyle = '#000000';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((hash + row * 8 + col) % 3 === 0) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
  
  return canvas.toDataURL('image/png');
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
  
  // Header with background
  page.drawRectangle({
    x: 0,
    y: height - 40,
    width: SLIP_WIDTH,
    height: 40,
    color: COLORS.background,
  });
  
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
  
  // Patient Information section
  page.drawRectangle({
    x: 5,
    y: y + 5,
    width: SLIP_WIDTH - 10,
    height: 80,
    color: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
  });
  
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
  
  // Barcode section
  page.drawText('Barcode:', {
    x: 10,
    y,
    size: SIZES.small,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 15;
  drawBarcode(page, data.visitInfo.visitId, 10, y, 80, 15);
  
  y -= 30;
  
  // QR Code section
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
  
  y -= 15;
  page.drawText(qrData.substring(0, 25) + '...', {
    x: 10,
    y,
    size: SIZES.tiny,
    font: font,
    color: COLORS.textLight,
  });
  
  y -= 25;
  
  // Tests section
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
  
  // Footer with signature lines
  y = 30;
  page.drawLine({
    start: { x: 10, y },
    end: { x: SLIP_WIDTH - 10, y },
    thickness: 1,
    color: COLORS.border,
  });
  
  y -= 15;
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
  let page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const { width, height } = page.getSize();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = height - 40;
  
  // Header with background
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width: A4_WIDTH,
    height: 60,
    color: COLORS.background,
  });
  
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
  
  for (const dept of departments) {
    const deptTests = data.tests.filter(test => test.department === dept);
    
    // Check if we need a new page
    if (y < 200) {
      page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      y = height - 40;
    }
    
    // Department header with background
    page.drawRectangle({
      x: 35,
      y: y + 5,
      width: A4_WIDTH - 70,
      height: 25,
      color: COLORS.primary,
    });
    
    page.drawText(dept, {
      x: 40,
      y,
      size: SIZES.heading,
      font: boldFont,
      color: rgb(1, 1, 1), // White text on blue background
    });
    
    y -= 35;
    
    // Table header
    const tableY = y;
    const colWidths = [200, 80, 60, 120, 60];
    const startX = 40;
    
    // Draw table header background
    page.drawRectangle({
      x: startX - 5,
      y: tableY - 5,
      width: colWidths.reduce((a, b) => a + b, 0) + 10,
      height: 20,
      color: COLORS.background,
    });
    
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
    
    y -= 25;
    
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
      
      // Highlight abnormal results with background
      if (isAbnormal) {
        page.drawRectangle({
          x: startX - 5,
          y: y - 2,
          width: colWidths.reduce((a, b) => a + b, 0) + 10,
          height: 15,
          color: rgb(1, 0.95, 0.95), // Light red background
        });
      }
      
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
  }
  
  // Comments section
  if (y < 150) {
    page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    y = height - 40;
  }
  
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