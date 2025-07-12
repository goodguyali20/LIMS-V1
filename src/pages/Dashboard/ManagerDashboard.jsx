import React, { useState, useEffect, useMemo, useContext } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '/src/firebase-config.js'; // Corrected with absolute path
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { OrderContext } from '../contexts/OrderContext.jsx';
import styled from 'styled-components';
import { FaBox, FaFlask, FaClock } from 'react-icons/fa';

// --- Styled Components ---

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 5px solid ${({ color }) => color};
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ color }) => color};
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 1rem;
    color: #666;
  }
  p {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }
`;

const FormContainer = styled.div`
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  box-sizing: border-box;
`;

const SelectWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const GenderSelector = styled.div`
  display: flex;
  gap: 1rem;
`;

const GenderButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background-color: ${({ active, theme }) => (active ? theme.colors.primary : 'white')};
  color: ${({ active, theme }) => (active ? 'white' : theme.colors.text)};
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: ${({ active, theme }) => (active ? theme.colors.primary : '#f0f0f0')};
  }
`;

const Summary = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #eef2f7;
  border-radius: 4px;
  border-left: 5px solid ${({ theme }) => theme.colors.primary};
`;

const SummaryText = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// --- Initial State ---

const initialPatientState = {
  patientName: '',
  patientAge: '',
  patientGender: 'Male',
};

// --- Component ---

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setLastOrderId } = useContext(OrderContext);

  // State for dashboard statistics
  const [stats, setStats] = useState({ ordersCount: 0, testsCount: 0, pendingOrders: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // State for the "Add Order" form
  const [patientInfo, setPatientInfo] = useState(initialPatientState);
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [isTestsLoading, setIsTestsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect for fetching dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const ordersQuery = query(collection(db, 'orders'));
        const testsQuery = query(collection(db, 'tests'));
        const pendingOrdersQuery = query(collection(db, 'orders'), where('status', '==', 'Pending'));
        
        const [ordersSnapshot, testsSnapshot, pendingOrdersSnapshot] = await Promise.all([
          getDocs(ordersQuery),
          getDocs(testsQuery),
          getDocs(pendingOrdersQuery)
        ]);
        
        setStats({
          ordersCount: ordersSnapshot.size,
          testsCount: testsSnapshot.size,
          pendingOrders: pendingOrdersSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error(t('errors.fetchStats'));
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, [t]);

  // Effect for fetching tests for the form
  useEffect(() => {
    const fetchTests = async () => {
      setIsTestsLoading(true);
      try {
        const testsCollectionRef = collection(db, 'tests');
        const data = await getDocs(testsCollectionRef);
        const fetchedTests = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTests(fetchedTests);
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error(t('errors.fetchTests'));
      } finally {
        setIsTestsLoading(false);
      }
    };
    fetchTests();
  }, [t]);
  
  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleTestsChange = (selectedOptions) => {
    setSelectedTests(selectedOptions || []);
  };

  const totalPrice = useMemo(() => {
    return selectedTests.reduce((total, test) => total + Number(test.price), 0);
  }, [selectedTests]);

  const resetForm = () => {
    setPatientInfo(initialPatientState);
    setSelectedTests([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientInfo.patientName || !patientInfo.patientAge || selectedTests.length === 0) {
      toast.warn(t('warnings.fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        ...patientInfo,
        tests: selectedTests.map(t => ({ id: t.id, name: t.name, price: t.price })),
        totalPrice,
        createdAt: serverTimestamp(),
        status: 'Pending',
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setLastOrderId(docRef.id);
      
      toast.success(t('success.orderAdded'));
      resetForm();
      navigate(`/app/print-order/${docRef.id}`);

    } catch (error) {
      console.error("Error adding order: ", error);
      toast.error(t('errors.addOrder'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const testOptions = tests.map(test => ({
    value: test.id,
    label: `${test.name} - ${test.price} IQD`,
    price: test.price,
    name: a.name,
    id: test.id,
  }));

  return (
    <DashboardContainer>
      {/* --- Dashboard Stats Section --- */}
      <StatsGrid>
        <StatCard color="#3498db">
          <StatIcon color="#3498db"><FaBox /></StatIcon>
          <StatInfo>
            <h3>{t('dashboard.totalOrders')}</h3>
            <p>{isStatsLoading ? '...' : stats.ordersCount}</p>
          </StatInfo>
        </StatCard>
        <StatCard color="#2ecc71">
          <StatIcon color="#2ecc71"><FaFlask /></StatIcon>
          <StatInfo>
            <h3>{t('dashboard.totalTests')}</h3>
            <p>{isStatsLoading ? '...' : stats.testsCount}</p>
          </StatInfo>
        </StatCard>
        <StatCard color="#f39c12">
          <StatIcon color="#f39c12"><FaClock /></StatIcon>
          <StatInfo>
            <h3>{t('dashboard.pendingOrders')}</h3>
            <p>{isStatsLoading ? '...' : stats.pendingOrders}</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>
      
      {/* --- Add Order Form Section --- */}
      <FormContainer>
        <h2>{t('addOrder.title')}</h2>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="patientName">{t('addOrder.patientName')}</Label>
            <Input
              type="text"
              id="patientName"
              name="patientName"
              value={patientInfo.patientName}
              onChange={handlePatientInfoChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="patientAge">{t('addOrder.patientAge')}</Label>
            <Input
              type="number"
              id="patientAge"
              name="patientAge"
              value={patientInfo.patientAge}
              onChange={handlePatientInfoChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>{t('addOrder.gender')}</Label>
            <GenderSelector>
              <GenderButton
                type="button"
                active={patientInfo.patientGender === 'Male'}
                onClick={() => setPatientInfo(prev => ({ ...prev, patientGender: 'Male' }))}
              >
                {t('addOrder.male')}
              </GenderButton>
              <GenderButton
                type="button"
                active={patientInfo.patientGender === 'Female'}
                onClick={() => setPatientInfo(prev => ({ ...prev, patientGender: 'Female' }))}
              >
                {t('addOrder.female')}
              </GenderButton>
            </GenderSelector>
          </FormGroup>

          <SelectWrapper>
            <Label>{t('addOrder.selectTests')}</Label>
            <Select
                options={testOptions}
                isMulti
                onChange={handleTestsChange}
                value={selectedTests}
                isLoading={isTestsLoading}
                placeholder={t('addOrder.selectPlaceholder')}
                noOptionsMessage={() => t('addOrder.noOptions')}
              />
          </SelectWrapper>

          {selectedTests.length > 0 && (
            <Summary>
              <SummaryText>
                {t('addOrder.totalPrice')}: {totalPrice.toLocaleString()} IQD
              </SummaryText>
            </Summary>
          )}

          <SubmitButton type="submit" disabled={isSubmitting || isTestsLoading}>
            {isSubmitting ? t('addOrder.submitting') : t('addOrder.submit')}
          </SubmitButton>
        </form>
      </FormContainer>
    </DashboardContainer>
  );
};

export default Dashboard;