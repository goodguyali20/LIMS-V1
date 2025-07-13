import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  FaSave, FaCheck, FaTimes, FaExclamationTriangle, 
  FaSpinner, FaArrowLeft, FaVial, FaUser, FaCalendar,
  FaFlask, FaThermometerHalf, FaInfoCircle, FaIdCard
} from 'react-icons/fa';
import { logAuditEvent } from '../../utils/auditLogger';
import { motion, AnimatePresence } from 'framer-motion';

const ResultEntryContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OrderInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  margin-bottom: 2rem;
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  span:first-child {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  span:last-child {
    font-weight: 600;
  }
`;

const TestsContainer = styled.div`
  display: grid;
  gap: 2rem;
`;

const TestCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  border-left: 4px solid ${({ status, theme }) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'critical': return theme.colors.error;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.border;
    }
  }};
`;

const SkeletonCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  min-height: 120px;
  margin-bottom: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  opacity: 0.7;
  animation: pulse 1.5s infinite alternate;
  @keyframes pulse {
    0% { background: ${({ theme }) => theme.colors.surface}; }
    100% { background: ${({ theme }) => theme.colors.surfaceSecondary}; }
  }
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
`;

const TestDepartment = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'completed': return `${theme.colors.success}20`;
      case 'critical': return `${theme.colors.error}20`;
      case 'pending': return `${theme.colors.warning}20`;
      default: return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'critical': return theme.colors.error;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const ResultForm = styled.form`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme, hasError }) => 
      hasError ? theme.colors.error + '20' : theme.colors.primary + '20'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ReferenceRange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const CriticalAlert = styled.div`
  background: ${({ theme }) => theme.colors.error}10;
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error};
`;

const ResultEntry = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({});
  const [testCatalog, setTestCatalog] = useState([]);

  useEffect(() => {
    const fetchOrderAndTests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order
        const orderDoc = await getDoc(doc(db, 'testOrders', orderId));
        if (!orderDoc.exists()) {
          setError('Order not found');
          return;
        }
        
        const orderData = { id: orderDoc.id, ...orderDoc.data() };
        setOrder(orderData);
        
        // Fetch test catalog for reference ranges
        const testsSnapshot = await getDocs(collection(db, 'labTests'));
        const testsData = testsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTestCatalog(testsData);
        
        // Initialize results state
        const initialResults = {};
        if (orderData.tests) {
          orderData.tests.forEach(test => {
            initialResults[test.id || test.name] = {
              value: '',
              unit: test.unit || '',
              status: 'pending',
              comments: '',
              critical: false
            };
          });
        }
        setResults(initialResults);
        
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderAndTests();
    }
  }, [orderId]);

  const getTestInfo = (testName) => {
    return testCatalog.find(test => test.name === testName || test.id === testName);
  };

  const validateResult = (testName, value) => {
    const testInfo = getTestInfo(testName);
    if (!testInfo || !testInfo.referenceRange) return { valid: true, critical: false };
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { valid: false, critical: false };
    
    const [min, max] = testInfo.referenceRange.split('-').map(v => parseFloat(v.trim()));
    const isInRange = numValue >= min && numValue <= max;
    const isCritical = numValue < min || numValue > max;
    
    return { valid: true, critical: isCritical };
  };

  const handleResultChange = (testName, field, value) => {
    setResults(prev => {
      const updated = { ...prev };
      if (!updated[testName]) {
        updated[testName] = { value: '', unit: '', status: 'pending', comments: '', critical: false };
      }
      
      updated[testName][field] = value;
      
      // Validate if it's a numerical result
      if (field === 'value' && value) {
        const validation = validateResult(testName, value);
        updated[testName].critical = validation.critical;
        updated[testName].status = validation.critical ? 'critical' : 'completed';
      }
      
      return updated;
    });
  };

  const handleSaveResults = async () => {
    try {
      setSaving(true);
      
      const resultsToSave = {};
      let hasCriticalValues = false;
      
      Object.entries(results).forEach(([testName, result]) => {
        if (result.value) {
          resultsToSave[testName] = {
            ...result,
            enteredAt: serverTimestamp(),
            enteredBy: 'current-user' // Replace with actual user
          };
          
          if (result.critical) {
            hasCriticalValues = true;
          }
        }
      });
      
      // Update order with results
      await updateDoc(doc(db, 'testOrders', orderId), {
        results: resultsToSave,
        status: hasCriticalValues ? 'Critical Values' : 'Completed',
        completedAt: serverTimestamp()
      });
      
      // Log audit event
      await logAuditEvent('Results Entered', {
        orderId,
        resultsCount: Object.keys(resultsToSave).length,
        hasCriticalValues
      });
      
      toast.success('Results saved successfully!');
      
      if (hasCriticalValues) {
        toast.warning('Critical values detected! Please review immediately.');
      }
      
      navigate(`/app/order/${orderId}`);
      
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const renderResultInput = (testName, test) => {
    const testInfo = getTestInfo(testName);
    const result = results[testName] || {};
    
    switch (testInfo?.resultType || 'numerical') {
      case 'numerical':
        return (
          <FormGroup>
            <Label>
              <FaThermometerHalf />
              {t('resultValueLabel')}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={result.value}
              onChange={(e) => handleResultChange(testName, 'value', e.target.value)}
              placeholder={t('enterResultValuePlaceholder')}
              hasError={result.value && !validateResult(testName, result.value).valid}
            />
            {testInfo?.unit && (
              <ReferenceRange>
                <FaInfoCircle />
                {t('unitLabel')}: {testInfo.unit}
              </ReferenceRange>
            )}
            {testInfo?.referenceRange && (
              <ReferenceRange>
                <FaInfoCircle />
                {t('referenceRangeLabel')}: {testInfo.referenceRange}
              </ReferenceRange>
            )}
          </FormGroup>
        );
        
      case 'text':
        return (
          <FormGroup>
            <Label>
              <FaFlask />
              {t('resultLabel')}
            </Label>
            <TextArea
              value={result.value}
              onChange={(e) => handleResultChange(testName, 'value', e.target.value)}
              placeholder={t('enterTextResultPlaceholder')}
            />
          </FormGroup>
        );
        
      case 'dropdown':
        return (
          <FormGroup>
            <Label>
              <FaFlask />
              {t('resultLabel')}
            </Label>
            <Select
              value={result.value}
              onChange={(e) => handleResultChange(testName, 'value', e.target.value)}
            >
              <option value="">{t('selectResultPlaceholder')}</option>
              {testInfo?.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </FormGroup>
        );
        
      default:
        return (
          <FormGroup>
            <Label>
              <FaFlask />
              {t('resultLabel')}
            </Label>
            <Input
              value={result.value}
              onChange={(e) => handleResultChange(testName, 'value', e.target.value)}
              placeholder={t('enterResultPlaceholder')}
            />
          </FormGroup>
        );
    }
  };

  if (loading) {
    return (
      <ResultEntryContainer>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        ))}
      </ResultEntryContainer>
    );
  }

  if (error) {
    return (
      <ResultEntryContainer>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>{t('error')}</h2>
          <p>{error}</p>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> {t('goBack')}
          </BackButton>
        </motion.div>
      </ResultEntryContainer>
    );
  }

  if (!order || !order.tests || order.tests.length === 0) {
    return (
      <ResultEntryContainer>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '4rem' }}>
          <FaVial size={48} style={{ color: '#e5e7eb', marginBottom: 16 }} />
          <h2>{t('noTestsFound')}</h2>
          <p>{t('noTestsForThisOrder')}</p>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> {t('goBack')}
          </BackButton>
        </motion.div>
      </ResultEntryContainer>
    );
  }

  const completedTests = Object.values(results).filter(r => r.value).length;
  const totalTests = order.tests?.length || 0;

  return (
    <ResultEntryContainer>
      <Header>
        <div>
          <h1>{t('enterResults')}</h1>
          <p>{t('orderIdLabel')} {orderId}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> {t('backButton')}
          </BackButton>
          <SaveButton 
            onClick={handleSaveResults}
            disabled={saving || completedTests === 0}
          >
            {saving ? <FaSpinner className="fa-spin" /> : <FaSave />}
            {saving ? t('saving') : `${t('saveResults')} (${completedTests}/${totalTests})`}
          </SaveButton>
        </div>
      </Header>

      <OrderInfo>
        <h3>{t('orderInformation')}</h3>
        <OrderDetails>
          <DetailItem>
            <FaUser />
            <span>{t('patientLabel')}</span>
            <span>{order.patientName}</span>
          </DetailItem>
          <DetailItem>
            <FaIdCard />
            <span>{t('patientIdLabel')}</span>
            <span>{order.patientId || 'N/A'}</span>
          </DetailItem>
          <DetailItem>
            <FaCalendar />
            <span>{t('orderDateLabel')}</span>
            <span>
              {order.createdAt?.toDate ? 
                order.createdAt.toDate().toLocaleDateString() : 
                new Date(order.createdAt).toLocaleDateString()
              }
            </span>
          </DetailItem>
          <DetailItem>
            <FaVial />
            <span>{t('testsLabel')}</span>
            <span>{totalTests}</span>
          </DetailItem>
        </OrderDetails>
      </OrderInfo>

      <TestsContainer>
        <AnimatePresence mode="wait">
          {order.tests?.map((test, index) => {
            const testInfo = getTestInfo(test.id || test.name);
            const result = results[test.id || test.name] || {};
            const status = result.value ? (result.critical ? 'critical' : 'completed') : 'pending';
            return (
              <TestCard
                as={motion.div}
                key={index}
                status={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.08 }}
                style={result.critical ? { boxShadow: '0 0 0 4px #ef4444aa' } : {}}
              >
                <TestHeader>
                  <TestInfo>
                    <TestName>{test.name}</TestName>
                    <TestDepartment>{testInfo?.department || 'General'}</TestDepartment>
                  </TestInfo>
                  <StatusBadge status={status} as={motion.span} animate={status === 'critical' ? { scale: [1, 1.15, 1] } : {}} transition={status === 'critical' ? { repeat: Infinity, duration: 1 } : {}}>
                    {status === 'completed' ? t('completed') : status === 'critical' ? t('critical') : t('pending')}
                  </StatusBadge>
                </TestHeader>
                <ResultForm>
                  {renderResultInput(test.id || test.name, test)}
                  <FormGroup>
                    <Label>
                      <FaInfoCircle />
                      {t('commentsLabel')}
                    </Label>
                    <TextArea
                      value={result.comments}
                      onChange={(e) => handleResultChange(test.id || test.name, 'comments', e.target.value)}
                      placeholder={t('addCommentsPlaceholder')}
                    />
                  </FormGroup>
                  {result.critical && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: 12 }}>
                      <CriticalAlert>
                        <FaExclamationTriangle />
                        {t('criticalValueAlert')}
                      </CriticalAlert>
                    </motion.div>
                  )}
                </ResultForm>
              </TestCard>
            );
          })}
        </AnimatePresence>
      </TestsContainer>
    </ResultEntryContainer>
  );
};

export default ResultEntry;