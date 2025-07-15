# PDF Generation System for LIMS

## Overview

This comprehensive PDF generation system is designed specifically for Laboratory Information Management Systems (LIMS) to create professional medical documents. The system generates three types of documents:

1. **Master Work Slips** - Single slip summarizing all patient tests
2. **Lab-Specific Work Slips** - Individual slips for each lab department
3. **Unified Patient Results Report** - Comprehensive final report for patients

## Features

### 🎨 Professional Design
- Clean, medical-grade typography using Helvetica fonts
- Professional color scheme with clinical blue (#005A9C) and red (#D32F2F)
- Proper visual hierarchy with consistent spacing and layout
- Medical document standards compliance

### 📏 Precise Dimensions
- Work slips: 70mm × 99mm (198.43 × 280.63 points)
- A4 page layout: 595.28 × 841.89 points
- 3×3 grid arrangement for efficient printing
- Optimized for standard A4 paper

### 🏥 Medical Standards
- Abnormal result highlighting with color coding
- Proper flagging system (⬆ high, ⬇ low)
- Clinical reference ranges
- Professional medical terminology

### 📱 QR & Barcode Support
- QR codes encoding patient and visit information
- Code 128 barcode generation for visit IDs
- JSON data structure for easy scanning and processing

### 🔧 Flexible Output
- Download as PDF files
- Generate base64 strings for web embedding
- Preview in new browser tabs
- Custom filename support

## Installation

The system uses the following dependencies:

```bash
npm install pdf-lib qrcode-generator
```

## Usage

### Basic Usage

```javascript
import { generateAndDownloadPdf, generatePdfAsBase64 } from './utils/pdfGenerator.js';

// Sample data structure
const data = {
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
    }
    // ... more tests
  ],
  hospitalInfo: {
    name: "Aziziyah General Hospital",
    address: "123 Health St, Wasit, Iraq",
    contact: "contact@agh.iq"
  }
};

// Generate and download PDF
await generateAndDownloadPdf('masterSlip', data, 'master_slip.pdf');

// Generate base64 for preview
const base64Data = await generatePdfAsBase64('resultsReport', data);
```

### Document Types

#### 1. Master Work Slip (`masterSlip`)
- Single slip with all patient tests
- 3×3 grid on A4 page (9 identical slips)
- Includes patient info, barcode, QR code, and test list
- Designed for phlebotomist use

#### 2. Lab-Specific Slips (`labSlip`)
- Separate slips for each department
- Filters tests by department
- One A4 page per department (3×3 grid)
- Optimized for lab workflow

#### 3. Results Report (`resultsReport`)
- Comprehensive patient report
- Tests grouped by department
- Abnormal result highlighting
- Professional medical layout
- Signature areas for lab staff

## Data Structure

### Required Fields

```javascript
{
  patientInfo: {
    patientId: string,      // Patient identifier
    name: string,           // Full patient name
    age: number,            // Patient age
    gender: string,         // Patient gender
    referringDoctor: string // Referring physician
  },
  visitInfo: {
    visitId: string,        // Visit identifier
    registrationDate: string, // ISO date string
    collectionDate: string,   // ISO date string
    reportDate: string        // ISO date string
  },
  tests: [
    {
      testId: string,       // Test identifier
      testName: string,     // Test name
      department: string,   // Lab department
      result: number,       // Test result value
      units: string,        // Result units
      referenceRange: string, // Normal range
      flag: "normal" | "high" | "low" // Result status
    }
  ],
  hospitalInfo: {
    name: string,           // Hospital name
    address: string,        // Hospital address
    contact: string         // Contact information
  }
}
```

## API Reference

### `generatePdf(documentType, data)`
Generates PDF bytes for the specified document type.

**Parameters:**
- `documentType`: `'masterSlip' | 'labSlip' | 'resultsReport'`
- `data`: Object matching the required data structure

**Returns:** `Promise<Uint8Array>` - PDF file bytes

### `generateAndDownloadPdf(documentType, data, filename?)`
Generates and automatically downloads the PDF.

**Parameters:**
- `documentType`: Document type to generate
- `data`: Patient and test data
- `filename`: Optional custom filename

**Returns:** `Promise<boolean>` - Success status

### `generatePdfAsBase64(documentType, data)`
Generates PDF as base64 data URL.

**Parameters:**
- `documentType`: Document type to generate
- `data`: Patient and test data

**Returns:** `Promise<string>` - Base64 data URL

## React Component Integration

### Demo Component

```jsx
import PdfGeneratorDemo from './components/Print/PdfGeneratorDemo.jsx';

// Use in your app
<PdfGeneratorDemo />
```

### Custom Integration

```jsx
import React, { useState } from 'react';
import { generateAndDownloadPdf } from './utils/pdfGenerator.js';

const MyComponent = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (patientData) => {
    setIsGenerating(true);
    try {
      await generateAndDownloadPdf('resultsReport', patientData);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={() => handleGenerateReport(data)}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate Report'}
    </button>
  );
};
```

## Customization

### Colors
Modify the `COLORS` constant in `pdfGenerator.js`:

```javascript
const COLORS = {
  primary: rgb(0, 0.35, 0.61),    // Main brand color
  secondary: rgb(0.83, 0.18, 0.18), // Accent color
  abnormal: rgb(0.83, 0.18, 0.18),  // Abnormal result color
  normal: rgb(0.06, 0.73, 0.51),     // Normal result color
  // ... other colors
};
```

### Font Sizes
Adjust the `SIZES` constant:

```javascript
const SIZES = {
  title: 18,    // Main titles
  subtitle: 14, // Section headers
  heading: 12,  // Subsection headers
  body: 10,     // Body text
  small: 8,     // Small text
  tiny: 6,      // Very small text
};
```

### Hospital Information
Update hospital details in the generation functions:

```javascript
// In createWorkSlip and createResultsReport functions
page.drawText('Your Hospital Name', {
  x: 10,
  y,
  size: SIZES.heading,
  font: boldFont,
  color: COLORS.primary,
});
```

## Error Handling

The system includes comprehensive error handling:

```javascript
try {
  await generateAndDownloadPdf('resultsReport', data);
} catch (error) {
  if (error.message.includes('Unknown document type')) {
    console.error('Invalid document type specified');
  } else if (error.message.includes('PDF generation error')) {
    console.error('PDF generation failed:', error);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance Considerations

### Large Datasets
- For reports with many tests, consider pagination
- Use `generatePdfAsBase64` for preview to avoid file downloads
- Implement loading states for better UX

### Memory Usage
- PDF generation is memory-intensive for large documents
- Consider generating documents in background workers
- Implement proper cleanup of blob URLs

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **PDF.js**: Required for PDF preview functionality
- **Canvas API**: Required for QR code generation
- **Blob API**: Required for file downloads

## Production Considerations

### Barcode Libraries
For production use, consider replacing the simplified barcode implementation with:
- `jsbarcode` for Code 128 barcodes
- `qrcode` for proper QR code generation

### Font Embedding
Consider embedding custom fonts for branding:
```javascript
const customFont = await pdfDoc.embedFont(await fetch('/fonts/custom-font.ttf'));
```

### Image Support
Add hospital logo support:
```javascript
const logoImage = await pdfDoc.embedPng(await fetch('/logo.png'));
page.drawImage(logoImage, { x: 10, y: height - 40, width: 50, height: 30 });
```

## Troubleshooting

### Common Issues

1. **PDF not downloading**
   - Check browser popup blockers
   - Ensure proper blob URL cleanup
   - Verify file permissions

2. **QR codes not displaying**
   - Check canvas API support
   - Verify QR code library installation
   - Ensure proper data encoding

3. **Font rendering issues**
   - Verify font embedding
   - Check font file paths
   - Ensure proper font licensing

4. **Memory errors with large documents**
   - Implement pagination
   - Use background workers
   - Optimize data structure

### Debug Mode

Enable debug logging:

```javascript
// Add to pdfGenerator.js
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Generating PDF:', documentType, data);
}
```

## Future Enhancements

### Planned Features
- Digital signature support
- Watermark customization
- Multi-language support
- Template system
- Batch processing
- Email integration

### Advanced Customization
- Custom CSS-like styling
- Dynamic layouts
- Interactive elements
- Audio/video embedding
- 3D model support

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify data structure compliance
4. Test with sample data first

## License

This PDF generation system is part of the SmartLab LIMS project and follows the same licensing terms. 