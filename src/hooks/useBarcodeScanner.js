import { useState, useEffect, useCallback, useRef } from 'react';

const useBarcodeScanner = (options = {}) => {
  const {
    onScan,
    onError,
    enabled = true,
    debounceMs = 100,
    minLength = 3,
    maxLength = 50,
  } = options;

  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [error, setError] = useState(null);
  
  const buffer = useRef('');
  const timeoutRef = useRef(null);
  const lastScanTime = useRef(0);

  // Debounced scan handler
  const handleScan = useCallback((data) => {
    if (!enabled) return;

    const now = Date.now();
    const timeSinceLastScan = now - lastScanTime.current;
    
    // Reset buffer if too much time has passed
    if (timeSinceLastScan > 1000) {
      buffer.current = '';
    }
    
    lastScanTime.current = now;
    buffer.current += data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced processing
    timeoutRef.current = setTimeout(() => {
      const scannedData = buffer.current.trim();
      
      // Validate scan data
      if (scannedData.length < minLength) {
        setError('Scanned data too short');
        onError?.(new Error('Scanned data too short'));
        return;
      }

      if (scannedData.length > maxLength) {
        setError('Scanned data too long');
        onError?.(new Error('Scanned data too long'));
        return;
      }

      // Check for duplicate scans
      if (scannedData === lastScanned && timeSinceLastScan < 2000) {
        setError('Duplicate scan detected');
        onError?.(new Error('Duplicate scan detected'));
        return;
      }

      // Process valid scan
      try {
        setError(null);
        setLastScanned(scannedData);
        setIsScanning(false);
        
        if (onScan) {
          onScan(scannedData);
        }
      } catch (err) {
        setError(err.message);
        onError?.(err);
      }

      // Reset buffer
      buffer.current = '';
    }, debounceMs);
  }, [enabled, onScan, onError, debounceMs, minLength, maxLength, lastScanned]);

  // Keyboard event handler for manual input
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Start scanning on first character
    if (!isScanning && event.key.length === 1) {
      setIsScanning(true);
      setError(null);
    }

    // Handle Enter key to complete scan
    if (event.key === 'Enter' && buffer.current.trim()) {
      event.preventDefault();
      handleScan(buffer.current.trim());
      buffer.current = '';
      setIsScanning(false);
    }
  }, [enabled, isScanning, handleScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset state when disabled
  useEffect(() => {
    if (!enabled) {
      setIsScanning(false);
      setError(null);
      buffer.current = '';
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [enabled]);

  // Manual scan method
  const scan = useCallback((data) => {
    handleScan(data);
  }, [handleScan]);

  // Reset method
  const reset = useCallback(() => {
    setIsScanning(false);
    setError(null);
    setLastScanned('');
    buffer.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isScanning,
    lastScanned,
    error,
    scan,
    reset,
    handleKeyDown,
  };
};

export { useBarcodeScanner };
export default useBarcodeScanner;