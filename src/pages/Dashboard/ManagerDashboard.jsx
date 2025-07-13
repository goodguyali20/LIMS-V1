import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  DollarSign,
  Target,
  Award,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity as ActivityIcon,
  Clock as ClockIcon,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Settings,
  Bell,
  Star,
  Trophy,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Styled Components
const DashboardContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DashboardHeader = styled(motion.div)`
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const DashboardDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: ${({ color }) => color};
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const StatChange = styled.div`
  font-size: 0.8rem;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
  font-weight: 600;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ChartCard = styled(GlowCard)`
  padding: 1.5rem;
  height: 400px;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const LoadingSpinner = styled(motion.div)`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
`;

const SkeletonCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SkeletonLine = styled.div`
  height: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#764ba2'];

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [notification, setNotification] = useState(null);
  const [testsPerDay, setTestsPerDay] = useState([]);
  const [topTests, setTopTests] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setChartsLoading(true);
      // Fetch test orders
      const ordersSnapshot = await getDocs(collection(db, 'testOrders'));
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      // --- Tests Per Day ---
      const dayMap = {};
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = 0;
      }
      orders.forEach(order => {
        const date = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt ? new Date(order.createdAt) : null);
        if (date) {
          const key = date.toISOString().slice(0, 10);
          if (dayMap[key] !== undefined) dayMap[key] += (order.tests?.length || 1);
        }
      });
      setTestsPerDay(Object.entries(dayMap).map(([date, count]) => ({ date, count })));
      // --- Top 5 Most Ordered Tests ---
      const testCount = {};
      orders.forEach(order => {
        (order.tests || []).forEach(test => {
          const name = test.name || test;
          testCount[name] = (testCount[name] || 0) + 1;
        });
      });
      const top = Object.entries(testCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
      setTopTests(top);
      setChartsLoading(false);
      setLoading(false);
    };
    fetchChartData();
  }, []);

  const kpiData = {
    totalTests: 1247,
    completedTests: 1189,
    pendingTests: 58,
    criticalValues: 12,
    totalRevenue: 45680,
    avgTurnaroundTime: 2.4,
    patientSatisfaction: 4.8,
    efficiency: 94.2
  };

  const departmentStats = [
    { name: 'Chemistry', tests: 456, completed: 432, pending: 24, efficiency: 94.7 },
    { name: 'Hematology', tests: 234, completed: 228, pending: 6, efficiency: 97.4 },
    { name: 'Microbiology', tests: 189, completed: 175, pending: 14, efficiency: 92.6 },
    { name: 'Immunology', tests: 156, completed: 148, pending: 8, efficiency: 94.9 },
    { name: 'Molecular', tests: 212, completed: 204, pending: 8, efficiency: 96.2 }
  ];

  const recentAlerts = [
    { id: 1, type: 'critical', message: 'Critical value detected in Chemistry', time: '2 min ago', department: 'Chemistry' },
    { id: 2, type: 'warning', message: 'Low stock alert: Reagent Kit A', time: '15 min ago', department: 'Inventory' },
    { id: 3, type: 'info', message: 'New patient registration: Ahmed Hassan', time: '1 hour ago', department: 'Registration' },
    { id: 4, type: 'success', message: 'Quality control passed for Lot #2024-001', time: '2 hours ago', department: 'QC' }
  ];

  const testTrends = [
    { date: 'Jan 1', chemistry: 45, hematology: 32, microbiology: 28, immunology: 25, molecular: 35 },
    { date: 'Jan 2', chemistry: 52, hematology: 38, microbiology: 31, immunology: 29, molecular: 42 },
    { date: 'Jan 3', chemistry: 48, hematology: 35, microbiology: 33, immunology: 27, molecular: 38 },
    { date: 'Jan 4', chemistry: 55, hematology: 41, microbiology: 36, immunology: 32, molecular: 45 },
    { date: 'Jan 5', chemistry: 51, hematology: 39, microbiology: 34, immunology: 30, molecular: 41 },
    { date: 'Jan 6', chemistry: 47, hematology: 37, microbiology: 32, immunology: 28, molecular: 39 },
    { date: 'Jan 7', chemistry: 53, hematology: 40, microbiology: 35, immunology: 31, molecular: 43 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45680, target: 45000, growth: 2.1 },
    { month: 'Feb', revenue: 48920, target: 47000, growth: 4.1 },
    { month: 'Mar', revenue: 52340, target: 49000, growth: 6.8 },
    { month: 'Apr', revenue: 49860, target: 51000, growth: -2.2 },
    { month: 'May', revenue: 54120, target: 53000, growth: 2.1 },
    { month: 'Jun', revenue: 57890, target: 55000, growth: 5.3 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <DashboardHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DashboardTitle>{t('dashboard.title')}</DashboardTitle>
          <DashboardDescription>{t('dashboard.description')}</DashboardDescription>
        </DashboardHeader>
        
        <StatsGrid>
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard
              key={i}
              variants={statCardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.1 }}
            >
              <SkeletonLine style={{ width: '60%' }} />
              <SkeletonLine style={{ width: '40%' }} />
            </SkeletonCard>
          ))}
        </StatsGrid>
        
        <ContentGrid>
          {[1, 2].map(i => (
            <SkeletonCard
              key={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.1 }}
            >
              <SkeletonLine style={{ width: '80%' }} />
              <SkeletonLine style={{ width: '60%' }} />
              <SkeletonLine style={{ width: '40%' }} />
            </SkeletonCard>
          ))}
        </ContentGrid>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader>
        <DashboardTitle>{t('dashboard.title')}</DashboardTitle>
        <DashboardDescription>{t('dashboard.description')}</DashboardDescription>
      </DashboardHeader>

      <StatsGrid>
        <StatCard
          variants={statCardVariants}
          color="#3B82F6"
          whileHover="hover"
        >
          <StatIcon color="#3B82F6">
            <BarChart3 />
          </StatIcon>
          <StatValue>{kpiData.totalTests.toLocaleString()}</StatValue>
          <StatLabel>{t('dashboard.stats.totalTests')}</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            +{((kpiData.completedTests / kpiData.totalTests) * 100).toFixed(1)}% completion
          </StatChange>
        </StatCard>

        <StatCard
          variants={statCardVariants}
          color="#10B981"
          whileHover="hover"
        >
          <StatIcon color="#10B981">
            <CheckCircle />
          </StatIcon>
          <StatValue>{kpiData.completedTests.toLocaleString()}</StatValue>
          <StatLabel>{t('dashboard.stats.completedTests')}</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            {kpiData.efficiency}% efficiency
          </StatChange>
        </StatCard>

        <StatCard
          variants={statCardVariants}
          color="#F59E0B"
          whileHover="hover"
        >
          <StatIcon color="#F59E0B">
            <Clock />
          </StatIcon>
          <StatValue>{kpiData.pendingTests}</StatValue>
          <StatLabel>{t('dashboard.stats.pendingTests')}</StatLabel>
          <StatChange $positive={false}>
            <AlertTriangle size={16} />
            {kpiData.criticalValues} critical values
          </StatChange>
        </StatCard>

        <StatCard
          variants={statCardVariants}
          color="#EF4444"
          whileHover="hover"
        >
          <StatIcon color="#EF4444">
            <DollarSign />
          </StatIcon>
          <StatValue>${kpiData.totalRevenue.toLocaleString()}</StatValue>
          <StatLabel>{t('dashboard.stats.totalRevenue')}</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={16} />
            {kpiData.avgTurnaroundTime}h avg TAT
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} /> Tests Per Day (Last 14 Days)
          </ChartTitle>
          {chartsLoading ? (
            <LoadingContainer>
              <LoadingSpinner animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} />
              <LoadingText>Loading chart...</LoadingText>
            </LoadingContainer>
          ) : testsPerDay.length === 0 ? (
            <LoadingContainer>
              <LoadingText>No data available for the last 14 days.</LoadingText>
            </LoadingContainer>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={testsPerDay} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={12} angle={-35} textAnchor="end" height={60} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} /> Top 5 Most Ordered Tests
          </ChartTitle>
          {chartsLoading ? (
            <LoadingContainer>
              <LoadingSpinner animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} />
              <LoadingText>Loading chart...</LoadingText>
            </LoadingContainer>
          ) : topTests.length === 0 ? (
            <LoadingContainer>
              <LoadingText>No test order data available.</LoadingText>
            </LoadingContainer>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topTests} layout="vertical" margin={{ top: 16, right: 16, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={120} />
                <Tooltip />
                <Bar dataKey="value">
                  {topTests.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ContentGrid>

      <AnimatePresence>
        {notification && (
          <AnimatedNotification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </DashboardContainer>
  );
};

export default ManagerDashboard;