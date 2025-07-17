import express from 'express';
import bodyParser from 'body-parser';
import generatePdfRouter from './generate-pdf.js';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/', generatePdfRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PDF API server running on port ${PORT}`);
}); 