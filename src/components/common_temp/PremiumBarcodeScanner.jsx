import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { microInteractions, advancedVariants } from '../../styles/animations';
import { 
  FaBarcode, FaQrcode, FaCheckCircle, FaExclamationTriangle,
  FaTimes, FaSearch, FaCamera, FaSpinner, FaHistory
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ScannerContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  border: 2px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;
  
  ${({ $scanning, theme }) => $scanning && `
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.glow.primary};
  `}
  
  ${({ $success, theme }) => $success && `
    border-color: ${theme.colors.success};
    box-shadow: ${theme.shadows.glow.success};
  `}
  
  ${({ $error, theme }) => $error && `
    border-color: ${theme.colors.error};
    box-shadow: ${theme.shadows.glow.danger};
  `}
`;

const ScannerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ScannerArea = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${({ theme }) => theme.colors.background};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary + '05'};
  }
  
  ${({ $scanning, theme }) => $scanning && `
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary + '10'};
    animation: scanningPulse 1.5s ease-in-out infinite;
    
    @keyframes scanningPulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
      }
    }
  `}
`;

const ScannerContent = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
  }
`;

const ScanningLine = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
`;

const InputContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const BarcodeInput = styled(motion.input)`
  flex: 1;
  padding: 1rem 1.25rem;
  border: 2px solid ${({ theme, $error }) => $error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) => $error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, $error }) => $error ? theme.colors.error + '20' : theme.colors.primary + '20'};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ScanButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  max-width: 140px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 0.95rem;
    max-width: 100px;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + 'dd'};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FeedbackContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

const SuccessFeedback = styled(motion.div)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.large};
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.9;
  }
`;

const ErrorFeedback = styled(motion.div)`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.large};
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.9;
  }
`;

const RecentScans = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const RecentScansHeader = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScanHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
`;

const ScanItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  
  .scan-code {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .scan-time {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.75rem;
  }
  
  .scan-status {
    padding: 0.25rem 0.5rem;
    border-radius: ${({ theme }) => theme.shapes.pill};
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    
    &.success {
      background: ${({ theme }) => theme.colors.success + '20'};
      color: ${({ theme }) => theme.colors.success};
    }
    
    &.error {
      background: ${({ theme }) => theme.colors.error + '20'};
      color: ${({ theme }) => theme.colors.error};
    }
  }
`;

const PremiumBarcodeScanner = ({ 
  onScan, 
  placeholder = "Enter barcode manually...",
  title = "Barcode Scanner",
  showHistory = true
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);
  const { i18n } = useTranslation();

  const handleScan = async (code) => {
    setIsScanning(true);
    setScanInput(code);
    
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await onScan?.(code);
      
      if (result?.success) {
        setFeedback({ type: 'success', message: 'Barcode scanned successfully!', data: result.data });
        addToHistory(code, 'success');
      } else {
        setFeedback({ type: 'error', message: result?.message || 'Invalid barcode', data: result?.data });
        addToHistory(code, 'error');
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Scanning failed', data: error });
      addToHistory(code, 'error');
    } finally {
      setIsScanning(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleManualInput = async () => {
    if (!scanInput.trim()) return;
    
    await handleScan(scanInput.trim());
  };

  const addToHistory = (code, status) => {
    const newScan = {
      id: Date.now(),
      code,
      status,
      timestamp: new Date()
    };
    
    setScanHistory(prev => [newScan, ...prev.slice(0, 9)]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualInput();
    }
  };

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
  }, []);

  return (
    <ScannerContainer
      $scanning={isScanning}
      $success={feedback?.type === 'success'}
      $error={feedback?.type === 'error'}
      variants={advancedVariants.card}
      initial="hidden"
      animate="visible"
    >
      <ScannerHeader>
        <h3>
          <FaBarcode />
          {title}
        </h3>
      </ScannerHeader>

      <ScannerArea
        $scanning={isScanning}
        onClick={() => inputRef.current?.focus()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isScanning && (
          <ScanningLine
            animate={{ y: [0, 200, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        <ScannerContent>
          {isScanning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FaSpinner />
              </motion.div>
              <p>Scanning barcode...</p>
            </>
          ) : (
            <>
              <FaBarcode />
              <p>Click to focus or scan barcode</p>
            </>
          )}
        </ScannerContent>
      </ScannerArea>

      <InputContainer>
        <BarcodeInput
          ref={inputRef}
          type="text"
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          $error={feedback?.type === 'error'}
          variants={microInteractions.inputFocus}
          whileFocus="focus"
        />
        
        <ScanButton
          onClick={handleManualInput}
          disabled={isScanning || !scanInput.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={i18n.language === 'ar' ? { fontSize: '0.9rem', maxWidth: 100 } : undefined}
        >
          {isScanning ? <FaSpinner /> : <FaSearch />}
          {isScanning ? (i18n.language === 'ar' ? 'جارٍ المسح...' : 'Scanning...') : (i18n.language === 'ar' ? 'مسح' : 'Scan')}
        </ScanButton>
      </InputContainer>

      <AnimatePresence mode="wait">
        {feedback && (
          <FeedbackContainer>
            {feedback.type === 'success' ? (
              <SuccessFeedback
                variants={microInteractions.barcodeSuccess}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <FaCheckCircle />
                <h4>Success!</h4>
                <p>{feedback.message}</p>
              </SuccessFeedback>
            ) : (
              <ErrorFeedback
                variants={microInteractions.error}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <FaExclamationTriangle />
                <h4>Error</h4>
                <p>{feedback.message}</p>
              </ErrorFeedback>
            )}
          </FeedbackContainer>
        )}
      </AnimatePresence>

      {showHistory && scanHistory.length > 0 && (
        <RecentScans>
          <RecentScansHeader>
            <FaHistory />
            Recent Scans
          </RecentScansHeader>
          
          <ScanHistory>
            <AnimatePresence>
              {scanHistory.map((scan) => (
                <ScanItem
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="scan-code">{scan.code}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="scan-time">
                      {scan.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`scan-status ${scan.status}`}>
                      {scan.status}
                    </span>
                  </div>
                </ScanItem>
              ))}
            </AnimatePresence>
          </ScanHistory>
        </RecentScans>
      )}
    </ScannerContainer>
  );
};

export default PremiumBarcodeScanner; 