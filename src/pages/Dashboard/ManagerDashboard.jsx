import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import GlowButton from '../../components/common/GlowButton';
import EmptyState from '../../components/common/EmptyState';
import { trackEvent } from '../../utils/errorMonitoring';

const DashboardContainer = styled(motion.create('div'))`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const DashboardHeader = styled(motion.create('div'))`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.create('div'))`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stat-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }
  
  .stat-change {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .stat-change.positive {
    color: #10b981;
  }
  
  .stat-change.negative {
    color: #ef4444;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 1rem;
  }
`;

const LoadingSpinner = styled(motion.create('div'))`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SkeletonCard = styled(motion.create('div'))`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Mock data functions
const generateMockData = () => {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, i);
    return {
      date: format(date, 'MMM dd'),
      orders: Math.floor(Math.random() * 50) + 20,
      tests: Math.floor(Math.random() * 100) + 50,
      revenue: Math.floor(Math.random() * 5000) + 2000
    };
  }).reverse();

  const testTypes = [
    { name: 'Blood Tests', value: 35, color: '#3b82f6' },
    { name: 'Urine Tests', value: 25, color: '#10b981' },
    { name: 'Microbiology', value: 20, color: '#f59e0b' },
    { name: 'Chemistry', value: 15, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#8b5cf6' }
  ];

  return { last7Days, testTypes };
};

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data query
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: () => {
      // Simulate API delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(generateMockData());
        }, 1000);
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    trackEvent('dashboard_viewed', { 
      userId: user?.uid,
      timeRange 
    });
  }, [user, timeRange]);

  const stats = [
    {
      title: 'Total Orders',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: '📋',
      color: '#3b82f6'
    },
    {
      title: 'Tests Completed',
      value: '3,891',
      change: '+8%',
      changeType: 'positive',
      icon: '🧪',
      color: '#10b981'
    },
    {
      title: 'Revenue',
      value: '$45,230',
      change: '+15%',
      changeType: 'positive',
      icon: '💰',
      color: '#f59e0b'
    },
    {
      title: 'Pending Results',
      value: '89',
      change: '-5%',
      changeType: 'negative',
      icon: '⏳',
      color: '#ef4444'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (error) {
    return (
      <DashboardContainer>
        <EmptyState
          icon="⚠️"
          title="Error Loading Dashboard"
          description="There was an error loading the dashboard data. Please try again."
          action={
            <GlowButton onClick={() => window.location.reload()}>
              Retry
            </GlowButton>
          }
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader variants={itemVariants}>
        <h1>{t('dashboard.title')}</h1>
        <div className="header-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--surface-color)',
              color: 'var(--text-color)'
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <GlowButton variant="primary">
            Export Report
          </GlowButton>
        </div>
      </DashboardHeader>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <div 
                className="stat-icon"
                style={{ background: stat.color + '20', color: stat.color }}
              >
                {stat.icon}
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.changeType}`}>
              {stat.change}
              <span>
                {stat.changeType === 'positive' ? '↗' : '↘'}
              </span>
            </div>
          </StatCard>
        ))}
      </StatsGrid>

      {isLoading ? (
        <ChartsGrid>
          {[...Array(2)].map((_, i) => (
            <SkeletonCard key={i}>
              <LoadingSpinner />
            </SkeletonCard>
          ))}
        </ChartsGrid>
      ) : (
        <ChartsGrid>
          <ChartCard>
            <h3>Orders & Tests Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                <Bar dataKey="tests" fill="#10b981" name="Tests" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <h3>Test Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.testTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData?.testTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartsGrid>
      )}

      <motion.div
        variants={itemVariants}
        style={{
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem'
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
          Recent Activity
        </h3>
        <div style={{ color: 'var(--text-secondary-color)' }}>
          <p>• New order #1234 received from Dr. Smith</p>
          <p>• Test results completed for patient #5678</p>
          <p>• QC sample passed validation</p>
          <p>• Inventory alert: Low stock for Test Tube A</p>
        </div>
      </motion.div>
    </DashboardContainer>
  );
};

export default ManagerDashboard;