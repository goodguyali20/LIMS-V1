import { useCallback } from 'react';

export default function usePdfDownload() {
  const downloadPdf = useCallback(async (documentType, data, lang) => {
    const response = await fetch('http://localhost:4000/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType, data, lang }),
    });
    if (!response.ok) return;
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