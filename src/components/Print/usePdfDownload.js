import { useCallback } from 'react';

// Helper function to clean Firestore data for JSON serialization
const cleanFirestoreData = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object') {
    // Handle Firestore Timestamp objects
    if (obj.toDate && typeof obj.toDate === 'function') {
      return obj.toDate().toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(cleanFirestoreData);
    }
    
    // Handle regular objects
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanFirestoreData(value);
    }
    return cleaned;
  }
  
  return obj;
};

export default function usePdfDownload() {
  const downloadPdf = useCallback(async (documentType, data, lang) => {
    // Clean the data before sending to avoid JSON serialization issues
    const cleanedData = cleanFirestoreData(data);
    
    const response = await fetch('http://localhost:4000/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType, data: cleanedData, lang }),
    });
    if (!response.ok) {
      console.error('PDF generation failed:', response.status, response.statusText);
      throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, []);
  return downloadPdf;
} 