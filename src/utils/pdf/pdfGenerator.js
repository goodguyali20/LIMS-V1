import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import QRCode from 'qrcode'; // Add this import for QR code generation
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { createCanvas } from 'canvas';
import Chart from 'chart.js/auto';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register Handlebars helpers
Handlebars.registerHelper('flagIcon', function(flag) {
  switch(flag) {
    case 'high':
      return '↑';
    case 'low':
      return '↓';
    case 'critical_high':
    case 'critical_low':
      return '⚠';
    default:
      return '';
  }
});

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
 * Generate a line graph for test history using Chart.js and canvas
 * Returns a PNG data URL
 */
async function generateHistoryGraph(history, units = '', color = '#007AFF') {
  if (!Array.isArray(history) || history.length < 2) return null;
  const width = 180, height = 60;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  // Prepare data
  const labels = history.map(h => h.date);
  const dataPoints = history.map(h => h.value);
  // Chart.js config
  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '',
        data: dataPoints,
        borderColor: color,
        backgroundColor: 'rgba(0,122,255,0.08)',
        pointRadius: 2,
        pointBackgroundColor: color,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      elements: {
        line: { borderJoinStyle: 'round' },
      },
    },
    plugins: [],
  };
  // Render chart
  // Chart.js 4.x requires global window, so patch if needed
  if (typeof global.window === 'undefined') global.window = {};
  new Chart(ctx, config);
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
  page.drawText(`Name: ${data.patientInfo?.name || 'N/A'}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`ID: ${data.patientInfo?.patientId || 'N/A'}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`Age/Gender: ${data.patientInfo?.age}Y / ${data.patientInfo?.gender}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`Visit ID: ${data.visitInfo?.visitId || 'N/A'}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 12;
  page.drawText(`Date: ${new Date(data.visitInfo?.registrationDate).toLocaleDateString()}`, {
    x: 10,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 25;
  
  // Barcode
  const barcodeText = generateBarcode(data.visitInfo?.visitId || 'N/A');
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
    patientId: data.patientInfo?.patientId || 'N/A',
    visitId: data.visitInfo?.visitId || 'N/A',
    name: data.patientInfo?.name || 'N/A',
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
  page.drawText(`Patient: ${data.patientInfo?.name || 'N/A'}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: boldFont,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`ID: ${data.patientInfo?.patientId || 'N/A'}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Age/Gender: ${data.patientInfo?.age}Y / ${data.patientInfo?.gender}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Doctor: ${data.patientInfo?.referringDoctor || 'N/A'}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Collection: ${new Date(data.visitInfo?.collectionDate).toLocaleDateString()}`, {
    x: width - 250,
    y,
    size: SIZES.body,
    font: font,
    color: COLORS.text,
  });
  
  y -= 15;
  page.drawText(`Report: ${new Date(data.visitInfo?.reportDate).toLocaleDateString()}`, {
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
    visitId: (data.visitInfo?.visitId || 'N/A'),
    patientId: (data.patientInfo?.patientId || 'N/A'),
    reportDate: data.visitInfo?.reportDate,
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
 * New: Generate PDF using Puppeteer and HTML/CSS templates
 */
export async function generatePdfWithPuppeteer(documentType, data, lang = {}) {
  let templateFile;
  if (documentType === 'resultsReport') {
    templateFile = path.join(__dirname, '../pdf/templates/report-template.html');
  } else if (documentType === 'auditSheet') {
    templateFile = path.join(__dirname, '../pdf/templates/audit-sheet.html');
  } else {
    throw new Error('Unsupported document type for Puppeteer PDF generation');
  }

  // Read HTML template
  let templateHtml = await fs.readFile(templateFile, 'utf8');
  // Read CSS
  const cssFile = path.join(__dirname, '../pdf/templates/style.css');
  const styleCss = await fs.readFile(cssFile, 'utf8');

  // Prepare data for template
  const templateData = { ...data, lang };

  // If enabled, inject historyGraph for each test
  if (data.documentOptions?.includeHistoryGraph && Array.isArray(data.tests)) {
    // Group tests by department for template
    const departments = {};
    for (const test of data.tests) {
      if (!departments[test.department]) departments[test.department] = [];
      // Only generate graph if history exists
      let historyGraph = null;
      if (Array.isArray(test.history) && test.history.length > 1) {
        historyGraph = await generateHistoryGraph(test.history, test.units);
      }
      departments[test.department].push({ ...test, historyGraph });
    }
    templateData.departments = Object.entries(departments).map(([departmentName, tests]) => ({ departmentName, tests }));
  } else if (Array.isArray(data.tests)) {
    // Fallback: group tests by department without graphs
    const departments = {};
    for (const test of data.tests) {
      if (!departments[test.department]) departments[test.department] = [];
      departments[test.department].push({ ...test });
    }
    templateData.departments = Object.entries(departments).map(([departmentName, tests]) => ({ departmentName, tests }));
  }

  // Compile with Handlebars
  const template = Handlebars.compile(templateHtml);
  let html = template(templateData);
  // Inject CSS into <head>
  html = html.replace('</head>', `<style>${styleCss}</style></head>`);

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}

/**
 * (Scaffold) Generate lab slip PDF using Puppeteer and HTML/CSS template
 * TODO: Implement slip-template.html and CSS for slips (70x99mm)
 */
export async function generateSlipWithPuppeteer(data, lang = {}, documentType = 'masterSlip') {
  // Default language translations
  const defaultLang = {
    hospitalName: 'SmartLab',
    patientNameLabel: 'Patient Name',
    patientIdLabel: 'Patient ID',
    ageGenderLabel: 'Age/Gender',
    visitIdLabel: 'Visit ID',
    dateLabel: 'Date',
    barcodeLabel: 'Barcode',
    qrcodeLabel: 'QR Code',
    sampleReceived: 'Sample Received',
    sampleProcessed: 'Sample Processed',
    analysisComplete: 'Analysis Complete'
  };
  
  // Merge with provided language data
  const mergedLang = { ...defaultLang, ...lang };
  const fs = await import('fs/promises');
  const path = await import('path');
  const puppeteer = await import('puppeteer');
  const Handlebars = (await import('handlebars')).default;
  
  // Handle different data structures - support both visitInfo/patientInfo and direct order data
  const visitId = data.visitInfo?.visitId || data.id || 'N/A';
  const patientId = data.patientInfo?.patientId || data.patientId || 'N/A';
  const name = data.patientInfo?.name || data.patientName || 'N/A';
  
  // Extract department from document type if it's a department slip
  const department = documentType.startsWith('departmentSlip-') 
    ? documentType.replace('departmentSlip-', '') 
    : data.department || null;
  // Prepare barcode (as text)
  const barcode = `*${visitId}*`;
  // Prepare QR code as data URL
  const qrData = JSON.stringify({
    patientId: patientId,
    visitId: visitId,
    name: name,
  });
  const qrcode = await new Promise((resolve, reject) => {
    QRCode.toDataURL(qrData, { width: 48, margin: 0 }, (err, url) => {
      if (err) reject(err); else resolve(url);
    });
  });
  // Read HTML template
  const templateFile = path.join(__dirname, '../pdf/templates/slip-template.html');
  let templateHtml;
  try {
    templateHtml = await fs.readFile(templateFile, 'utf8');
  } catch (error) {
    console.error('Error reading slip template:', error);
    throw new Error('Slip template not found');
  }
  
  // Read CSS
  const cssFile = path.join(__dirname, '../pdf/templates/style.css');
  let styleCss;
  try {
    styleCss = await fs.readFile(cssFile, 'utf8');
  } catch (error) {
    console.error('Error reading CSS file:', error);
    styleCss = ''; // Use empty CSS if file not found
  }
  // Prepare data for template - format to match template expectations
  const templateData = { 
    lang: mergedLang, 
    barcode, 
    qrcode,
    department,
    isDepartmentSlip: !!department,
    slipTitle: department ? `${department} Work Slip` : 'Master Work Slip',
    patientInfo: {
      name: name,
      patientId: patientId,
      age: data.age || data.patientInfo?.age || 'N/A',
      gender: data.gender || data.patientInfo?.gender || 'N/A'
    },
    visitInfo: {
      visitId: visitId,
      date: data.createdAt || data.visitInfo?.date || new Date().toISOString().split('T')[0]
    },
    // Include original data for backward compatibility
    ...data
  };
  // Compile with Handlebars
  const template = Handlebars.compile(templateHtml);
  let html = template(templateData);
  // Inject CSS into <head>
  html = html.replace('</head>', `<style>${styleCss}</style></head>`);
  // Launch Puppeteer
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Set custom size for slip (70x99mm)
    const pdfBuffer = await page.pdf({
      width: '70mm',
      height: '99mm',
      printBackground: true,
      pageRanges: '1',
    });
    return pdfBuffer;
  } catch (error) {
    console.error('Puppeteer error:', error);
    throw new Error('Failed to generate PDF with Puppeteer');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Main PDF generation function (ESM compatible)
 */
export async function generatePdf(documentType, data, lang = {}) {
  if (documentType === 'resultsReport' || documentType === 'auditSheet') {
    return await generatePdfWithPuppeteer(documentType, data, lang);
  }
  if (documentType === 'labSlip' || documentType === 'masterSlip' || documentType.startsWith('departmentSlip-')) {
    return await generateSlipWithPuppeteer(data, lang, documentType);
  }
  throw new Error(`Unknown or unsupported document type: ${documentType}`);
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
  generatePdfWithPuppeteer,
  generateSlipWithPuppeteer,
}; 