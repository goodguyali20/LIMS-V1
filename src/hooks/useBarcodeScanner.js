import { useState, useEffect, useCallback } from 'react';

// The maximum time (in ms) between keystrokes to be considered part of the same scan.
const SCAN_TIMEOUT = 100; 
// The minimum length of a barcode to be considered valid.
const MIN_BARCODE_LENGTH = 6;

export const useBarcodeScanner = (onScan) => {
  const [barcode, setBarcode] = useState('');
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);

  const handleKeyDown = useCallback((e) => {
    const currentTime = new Date().getTime();

    // If the time difference is too large, it's not a scan, so we reset.
    if (currentTime - lastKeystrokeTime > SCAN_TIMEOUT) {
      setBarcode('');
    }

    if (e.key === 'Enter') {
      // Prevent form submission if the scanner is attached to an input
      e.preventDefault(); 
      if (barcode.length >= MIN_BARCODE_LENGTH) {
        onScan(barcode); // Execute the callback with the scanned code
      }
      setBarcode(''); // Reset for the next scan
    } else if (e.key.length === 1) { // Ignore keys like 'Shift', 'Ctrl', etc.
      setBarcode(prevBarcode => prevBarcode + e.key);
    }

    setLastKeystrokeTime(currentTime);
  }, [barcode, lastKeystrokeTime, onScan]);

  useEffect(() => {
    // Attach the event listener to the whole window
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};