import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
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
import { format, subDays, startOfDay, isToday } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import GlowButton from '../../components/common/GlowButton';
import EmptyState from '../../components/common/EmptyState';
import { trackEvent } from '../../utils/errorMonitoring';
import { usePerformanceMonitor } from '../../utils/performanceOptimizer';
import { 
  getCachedData, 
  setCachedData, 
  clearCache, 
  getCacheStats,
  hasTodayData 
} from '../../utils/dashboardCache';
import { 
  SkeletonCard, 
  SkeletonGrid, 
  PreventLayoutShiftContainer,
  FixedAspectRatioContainer,
  withLayoutShiftPrevention,
  SkeletonBox
} from '../../utils/layoutShiftPrevention';

// Lazy load heavy components with proper cleanup
const AdvancedAnalytics = lazy(() => import('../../components/Analytics/AdvancedAnalytics'));

// Simplified chart components with minimal cleanup
const MemoizedLineChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={data}
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
            r: 6
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
            r: 6
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
  );
});

const MemoizedPieChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data?.map((entry, index) => (
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
  );
});

// Simplified activity feed component
const MemoizedActivityFeed = React.memo(() => (
  <PreventLayoutShiftContainer>
    <RecentActivityCard>
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
        </ActivityItem>
        
        <ActivityItem>
          <ActivityDot color="#764ba2" />
          <ActivityContent>
            <ActivityText>Test results completed for <strong>patient #5678</strong></ActivityText>
            <ActivityTime>5 minutes ago</ActivityTime>
          </ActivityContent>
        </ActivityItem>
        
        <ActivityItem>
          <ActivityDot color="#10b981" />
          <ActivityContent>
            <ActivityText>Quality control passed for <strong>batch #9012</strong></ActivityText>
            <ActivityTime>8 minutes ago</ActivityTime>
          </ActivityContent>
        </ActivityItem>
      </ActivityList>
    </RecentActivityCard>
  </PreventLayoutShiftContainer>
));

// Skeleton activity feed for loading state
const SkeletonActivityFeed = React.memo(() => (
  <PreventLayoutShiftContainer>
    <RecentActivityCard>
      <ActivityHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SkeletonBox $width="40px" $height="40px" $borderRadius="12px" />
          <SkeletonBox $width="150px" $height="24px" $borderRadius="4px" />
        </div>
        <SkeletonBox $width="60px" $height="32px" $borderRadius="20px" />
      </ActivityHeader>
      
      <ActivityList>
        {[1, 2, 3].map((item) => (
          <ActivityItem key={item}>
            <SkeletonBox $width="8px" $height="8px" $borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <SkeletonBox $width="80%" $height="16px" $borderRadius="4px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox $width="40%" $height="14px" $borderRadius="4px" />
            </div>
          </ActivityItem>
        ))}
      </ActivityList>
    </RecentActivityCard>
  </PreventLayoutShiftContainer>
));

// Cache status indicator component
const CacheStatusIndicator = React.memo(({ timeRange, isCached, lastUpdateTime }) => {
  const getStatusColor = () => {
    if (!isCached) return '#ef4444'; // Red for no cache
    if (hasTodayData(timeRange)) return '#10b981'; // Green for today's data
    return '#f59e0b'; // Yellow for old data
  };

  const getStatusText = () => {
    if (!isCached) return 'No Cache';
    if (hasTodayData(timeRange)) return 'Today\'s Data';
    return 'Cached';
  };

  const getStatusIcon = () => {
    if (!isCached) return '❌';
    if (hasTodayData(timeRange)) return '✅';
    return '⏰';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: getStatusColor(),
      fontWeight: '600'
    }}>
      <span>{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      {lastUpdateTime && (
        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: '400' }}>
          ({format(new Date(lastUpdateTime), 'HH:mm')})
        </span>
      )}
    </div>
  );
});

// Simplified styled components with reduced complexity
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: 80px;
  
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

const StatCard = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  
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

const ChartCard = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
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

// Simplified activity components
const RecentActivityCard = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  margin-top: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }
`;

const ActivityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-top: 0.5rem;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  
  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

const ActivityTime = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.75rem;
  font-weight: 500;
`;

// Simplified tooltip components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
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

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
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
      </div>
    );
  }
  return null;
};

// Mock data functions with caching
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

// Enhanced data fetching function with caching
const fetchDashboardData = async (timeRange) => {
  // Check cache first
  const cached = getCachedData(timeRange);
  if (cached) {
    return cached.data;
  }

  // Simulate API call with delay
  console.log('🔄 Fetching fresh dashboard data for', timeRange);
  const data = await new Promise(resolve => {
    setTimeout(() => {
      resolve(generateMockData());
    }, 1000);
  });

  // Cache the data
  setCachedData(timeRange, data, '1.0');
  
  return data;
};

const ManagerDashboard = () => {
  // Performance monitoring with cleanup
  usePerformanceMonitor('ManagerDashboard');
  
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const hasTrackedView = useRef(false);
  const queryClient = useQueryClient();
  const [cacheStats, setCacheStats] = useState(null);

  // Enhanced data query with caching
  const { data: dashboardData, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: () => fetchDashboardData(timeRange),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data is fresh for a full day
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours - keep in memory for a full day
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // Update cache stats periodically
  useEffect(() => {
    const updateCacheStats = () => {
      const stats = getCacheStats();
      setCacheStats(stats);
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Force refresh function
  const handleForceRefresh = useCallback(() => {
    // Clear cache for current time range
    clearCache(timeRange);
    
    // Invalidate and refetch
    queryClient.invalidateQueries(['dashboard', timeRange]);
    console.log('🔄 Force refreshed dashboard data for', timeRange);
  }, [timeRange, queryClient]);

  // Clear all cache function
  const handleClearAllCache = useCallback(() => {
    // This would clear all dashboard cache
    // For now, just clear current time range
    clearCache(timeRange);
    queryClient.invalidateQueries(['dashboard']);
    console.log('🗑️ Cleared all dashboard cache');
  }, [timeRange, queryClient]);

  // Memoize expensive computations
  const stats = useMemo(() => [
    {
      title: t('dashboard.totalOrders'),
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: '📋',
      color: '#3b82f6'
    },
    {
      title: t('dashboard.testsCompleted'),
      value: '3,891',
      change: '+8%',
      changeType: 'positive',
      icon: '🧪',
      color: '#10b981'
    },
    {
      title: t('dashboard.revenue'),
      value: '$45,230',
      change: '+15%',
      changeType: 'positive',
      icon: '💰',
      color: '#f59e0b'
    },
    {
      title: t('dashboard.pendingResults'),
      value: '89',
      change: '-5%',
      changeType: 'negative',
      icon: '⏳',
      color: '#ef4444'
    }
  ], [t]);

  // Memoize event tracking callback
  const handleTimeRangeChange = useCallback((e) => {
    setTimeRange(e.target.value);
  }, []);

  useEffect(() => {
    if (!hasTrackedView.current) {
      trackEvent('dashboard_viewed', { 
        userId: user?.uid,
        timeRange 
      });
      hasTrackedView.current = true;
    }
  }, [user, timeRange]);

  if (error) {
    return (
      <DashboardContainer>
        <EmptyState
          icon="⚠️"
          title={t('dashboard.errorLoading')}
          description={t('dashboard.errorDescription')}
          action={
            <GlowButton onClick={() => window.location.reload()}>
              {t('dashboard.retry')}
            </GlowButton>
          }
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>{t('dashboard.title')}</h1>
        <div className="header-actions">
          <select 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--surface-color)',
              color: 'var(--text-color)'
            }}
          >
            <option value="7d">{t('dashboard.last7Days')}</option>
            <option value="30d">{t('dashboard.last30Days')}</option>
            <option value="90d">{t('dashboard.last90Days')}</option>
          </select>
          
          <CacheStatusIndicator 
            timeRange={timeRange}
            isCached={!!getCachedData(timeRange)}
            lastUpdateTime={dataUpdatedAt}
          />
          
          <GlowButton 
            $variant="primary" 
            onClick={handleForceRefresh}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            🔄 Refresh
          </GlowButton>
          
          <GlowButton $variant="primary">
            {t('dashboard.exportReport')}
          </GlowButton>
        </div>
      </DashboardHeader>

      <PreventLayoutShiftContainer>
        <StatsGrid>
          {stats.map((stat) => (
            <StatCard key={stat.title}>
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
      </PreventLayoutShiftContainer>

      {isLoading ? (
        <PreventLayoutShiftContainer>
          <ChartsGrid>
            <ChartCard>
              <h3>{t('dashboard.ordersTestsTrend')}</h3>
              <FixedAspectRatioContainer $ratio={16/9}>
                <SkeletonBox $width="100%" $height="100%" $borderRadius="8px" />
              </FixedAspectRatioContainer>
            </ChartCard>
            
            <ChartCard>
              <h3>{t('dashboard.testTypesDistribution')}</h3>
              <FixedAspectRatioContainer $ratio={1}>
                <SkeletonBox $width="100%" $height="100%" $borderRadius="8px" />
              </FixedAspectRatioContainer>
            </ChartCard>
          </ChartsGrid>
        </PreventLayoutShiftContainer>
      ) : (
        <PreventLayoutShiftContainer>
          <ChartsGrid>
            <ChartCard>
              <h3>{t('dashboard.ordersTestsTrend')}</h3>
              <FixedAspectRatioContainer $ratio={16/9}>
                <MemoizedLineChart data={dashboardData?.last7Days} />
              </FixedAspectRatioContainer>
            </ChartCard>

            <ChartCard>
              <h3>{t('dashboard.testTypesDistribution')}</h3>
              <FixedAspectRatioContainer $ratio={1}>
                <MemoizedPieChart data={dashboardData?.testTypes} />
              </FixedAspectRatioContainer>
            </ChartCard>
          </ChartsGrid>
        </PreventLayoutShiftContainer>
      )}

      {isLoading ? <SkeletonActivityFeed /> : <MemoizedActivityFeed />}
    </DashboardContainer>
  );
};

// Wrap the component with React.memo for performance
const MemoizedManagerDashboard = React.memo(ManagerDashboard);

export default MemoizedManagerDashboard;