import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PremiumBarcodeScanner from '../../components/common/PremiumBarcodeScanner';
import { logAuditEvent } from '../../utils/monitoring/auditLogger';

const ScannerPageContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled(motion.button)`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  
  &:hover {
    border-color: #667eea;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const Scanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBarcodeScan = async (scannedCode) => {
    try {
      // Navigate to the order page with the scanned code
      navigate(`/app/order/${scannedCode}`);
      logAuditEvent('barcode_scanned', { code: scannedCode });
      
      return {
        success: true,
        data: { code: scannedCode },
        message: 'Barcode scanned successfully!'
      };
    } catch (error) {
      logAuditEvent('barcode_scan_error', { error: error.message });
      return {
        success: false,
        message: 'Failed to process barcode scan'
      };
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <ScannerPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BackButton
            onClick={handleBack}
            title={t('common.back')}
            aria-label={t('common.back')}
          >
            <ArrowLeft size={20} />
          </BackButton>
        </motion.div>
        <div>
          <PageTitle>{t('scanner.title')}</PageTitle>
          <PageDescription>{t('scanner.description')}</PageDescription>
        </div>
      </PageHeader>

      <PremiumBarcodeScanner
        onScan={handleBarcodeScan}
        title={t('scanner.scannerTitle')}
        placeholder={t('scanner.placeholder')}
        showHistory={true}
      />
    </ScannerPageContainer>
  );
};

export default Scanner; 