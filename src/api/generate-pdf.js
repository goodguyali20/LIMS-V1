import express from 'express';
import { generatePdf } from '../utils/pdfGenerator.js';

const router = express.Router();

router.post('/generate-pdf', async (req, res) => {
  try {
    const { documentType, data, lang } = req.body;
    if (!documentType || !data) {
      return res.status(400).json({ error: 'Missing documentType or data' });
    }
    const pdfBuffer = await generatePdf(documentType, data, lang);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${documentType}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

export default router; 