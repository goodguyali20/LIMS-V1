import express from 'express';
import bodyParser from 'body-parser';
import generatePdfRouter from './generate-pdf.js';

const app = express();

// CORS middleware must be first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json({ limit: '10mb' }));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/', generatePdfRouter);

// Add a test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'PDF API server is running!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PDF API server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`PDF endpoint: http://localhost:${PORT}/generate-pdf`);
}); 