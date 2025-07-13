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
  Cell,
  Legend
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
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.15),
      0 12px 24px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
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
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
  }
  
  .stat-change {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    position: relative;
    z-index: 1;
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

const ChartCard = styled(motion.create('div'))`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
    
    &::before {
      content: '';
      width: 6px;
      height: 24px;
      background: linear-gradient(180deg, #667eea, #764ba2);
      border-radius: 3px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
  }
  
  .chart-container {
    position: relative;
    height: 320px;
    z-index: 1;
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

// Premium Recent Activity Components
const RecentActivityCard = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  margin-top: 2rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #667eea 0%, 
      #764ba2 25%, 
      #f093fb 50%, 
      #f5576c 75%, 
      #4facfe 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const ActivityTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const ActivityBadge = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 100%);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
  box-shadow: 0 0 0 4px ${({ color }) => color}20;
  flex-shrink: 0;
  margin-top: 0.25rem;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

const ActivityTime = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 500;
`;

const ActivityIconSmall = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// Custom tooltip component for premium look
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        fontSize: '13px',
        fontWeight: '600',
        minWidth: '200px'
      }}>
        <p style={{ 
          margin: '0 0 12px 0', 
          color: '#1f2937', 
          fontWeight: '700',
          fontSize: '14px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          paddingBottom: '8px'
        }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ 
            margin: '8px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: entry.color,
                boxShadow: `0 2px 8px ${entry.color}40`
              }}></div>
              <span style={{ color: '#374151', fontWeight: '600' }}>
                {entry.name}
              </span>
            </div>
            <span style={{ 
              color: entry.color, 
              fontWeight: '700',
              fontSize: '14px'
            }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie chart tooltip
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        fontSize: '13px',
        fontWeight: '600',
        minWidth: '180px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: data.payload.fill,
            boxShadow: `0 2px 8px ${data.payload.fill}40`
          }}></div>
          <span style={{ 
            color: '#1f2937', 
            fontWeight: '700',
            fontSize: '14px'
          }}>
            {data.name}
          </span>
        </div>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '600' }}>
            Count
          </span>
          <span style={{ 
            color: data.payload.fill, 
            fontWeight: '700',
            fontSize: '16px'
          }}>
            {data.value}
          </span>
        </div>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '600' }}>
            Percentage
          </span>
          <span style={{ 
            color: data.payload.fill, 
            fontWeight: '700',
            fontSize: '16px'
          }}>
            {((data.payload.percent || 0) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

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
    { name: 'Blood Tests', value: 35, color: '#667eea', percent: 0.35 },
    { name: 'Urine Tests', value: 25, color: '#764ba2', percent: 0.25 },
    { name: 'Microbiology', value: 20, color: '#f093fb', percent: 0.20 },
    { name: 'Chemistry', value: 15, color: '#f5576c', percent: 0.15 },
    { name: 'Other', value: 5, color: '#4facfe', percent: 0.05 }
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
          <ChartCard
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h3>Orders & Tests Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={dashboardData?.last7Days}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="testsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#764ba2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(255, 255, 255, 0.1)"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{
                      paddingBottom: '20px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: '600'
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="orders" 
                    stroke="#667eea"
                    strokeWidth={3}
                    fill="url(#ordersGradient)"
                    dot={{ 
                      fill: '#667eea', 
                      strokeWidth: 2, 
                      stroke: '#fff',
                      r: 6,
                      filter: 'url(#glow)'
                    }}
                    activeDot={{ 
                      r: 8, 
                      stroke: '#fff', 
                      strokeWidth: 3,
                      fill: '#667eea'
                    }}
                    name="Orders"
                  />
                  <Line 
                    type="monotone"
                    dataKey="tests" 
                    stroke="#764ba2"
                    strokeWidth={3}
                    fill="url(#testsGradient)"
                    dot={{ 
                      fill: '#764ba2', 
                      strokeWidth: 2, 
                      stroke: '#fff',
                      r: 6,
                      filter: 'url(#glow)'
                    }}
                    activeDot={{ 
                      r: 8, 
                      stroke: '#fff', 
                      strokeWidth: 3,
                      fill: '#764ba2'
                    }}
                    name="Tests"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h3>Test Types Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.testTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dashboardData?.testTypes.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </ChartsGrid>
      )}

      <RecentActivityCard
        variants={itemVariants}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)'
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <ActivityHeader>
          <ActivityTitle>
            <ActivityIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActivityIcon>
            Recent Activity
          </ActivityTitle>
          <ActivityBadge>Live</ActivityBadge>
        </ActivityHeader>
        
        <ActivityList>
          <ActivityItem>
            <ActivityDot color="#667eea" />
            <ActivityContent>
              <ActivityText>New order <strong>#1234</strong> received from <strong>Dr. Smith</strong></ActivityText>
              <ActivityTime>2 minutes ago</ActivityTime>
            </ActivityContent>
            <ActivityIconSmall>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </ActivityIconSmall>
          </ActivityItem>
          
          <ActivityItem>
            <ActivityDot color="#764ba2" />
            <ActivityContent>
              <ActivityText>Test results completed for <strong>patient #5678</strong></ActivityText>
              <ActivityTime>5 minutes ago</ActivityTime>
            </ActivityContent>
            <ActivityIconSmall>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </ActivityIconSmall>
          </ActivityItem>
          
          <ActivityItem>
            <ActivityDot color="#f093fb" />
            <ActivityContent>
              <ActivityText><strong>QC sample</strong> passed validation</ActivityText>
              <ActivityTime>8 minutes ago</ActivityTime>
            </ActivityContent>
            <ActivityIconSmall>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </ActivityIconSmall>
          </ActivityItem>
          
          <ActivityItem>
            <ActivityDot color="#f5576c" />
            <ActivityContent>
              <ActivityText><strong>Inventory alert:</strong> Low stock for Test Tube A</ActivityText>
              <ActivityTime>12 minutes ago</ActivityTime>
            </ActivityContent>
            <ActivityIconSmall>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActivityIconSmall>
          </ActivityItem>
          
          <ActivityItem>
            <ActivityDot color="#4facfe" />
            <ActivityContent>
              <ActivityText>New <strong>patient registration</strong> completed</ActivityText>
              <ActivityTime>15 minutes ago</ActivityTime>
            </ActivityContent>
            <ActivityIconSmall>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActivityIconSmall>
          </ActivityItem>
        </ActivityList>
      </RecentActivityCard>
    </DashboardContainer>
  );
};

export default ManagerDashboard;