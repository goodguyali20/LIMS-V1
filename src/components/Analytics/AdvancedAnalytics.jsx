import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Scatter, ScatterChart
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { 
  FaChartLine, FaChartBar, FaChartPie, FaCalendar, FaFilter,
  FaDownload, FaEye, FaEyeSlash, FaRedo, FaCog, FaThermometer,
  FaVial, FaClock, FaCheckCircle, FaExclamationTriangle, FaUsers,
  FaFlask, FaMicroscope, FaFileAlt, FaChartArea
} from 'react-icons/fa';
import GlowCard from '../common/GlowCard.jsx';
import GlowButton from '../common/GlowButton.jsx';

const AnalyticsContainer = styled(motion.div)`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const DateRangeSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.isDarkMode ? theme.shadows.glow.primary : '0 0 0 3px rgba(37, 99, 235, 0.1)'};
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ChartCard = styled(GlowCard)`
  padding: 1.5rem;
  min-height: 400px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChartTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  border-left: 4px solid ${({ color }) => color};
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const AdvancedAnalytics = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState('7d');
  const [showLegend, setShowLegend] = useState(true);

  // Generate sample data based on date range
  const generateData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      data.push({
        date: format(date, 'MMM dd'),
        orders: Math.floor(Math.random() * 50) + 20,
        completed: Math.floor(Math.random() * 40) + 15,
        pending: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 5000) + 2000,
        tests: Math.floor(Math.random() * 100) + 50,
        qualityScore: Math.floor(Math.random() * 20) + 80,
        turnaroundTime: Math.floor(Math.random() * 8) + 2,
      });
    }
    return data;
  };

  const chartData = useMemo(() => generateData(
    dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  ), [dateRange]);

  // Sample data for pie charts
  const testTypeData = [
    { name: 'Blood Tests', value: 45, color: '#3B82F6' },
    { name: 'Urine Tests', value: 25, color: '#10B981' },
    { name: 'Microbiology', value: 15, color: '#F59E0B' },
    { name: 'Chemistry', value: 10, color: '#EF4444' },
    { name: 'Immunology', value: 5, color: '#8B5CF6' },
  ];

  const statusData = [
    { name: 'Completed', value: 65, color: '#10B981' },
    { name: 'In Progress', value: 20, color: '#F59E0B' },
    { name: 'Pending', value: 10, color: '#3B82F6' },
    { name: 'Rejected', value: 5, color: '#EF4444' },
  ];

  const departmentData = [
    { name: 'Hematology', value: 30, color: '#3B82F6' },
    { name: 'Biochemistry', value: 25, color: '#10B981' },
    { name: 'Microbiology', value: 20, color: '#F59E0B' },
    { name: 'Immunology', value: 15, color: '#EF4444' },
    { name: 'Molecular', value: 10, color: '#8B5CF6' },
  ];

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
    const totalCompleted = chartData.reduce((sum, item) => sum + item.completed, 0);
    const avgRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length;
    const avgQuality = chartData.reduce((sum, item) => sum + item.qualityScore, 0) / chartData.length;
    
    return {
      totalOrders,
      totalCompleted,
      avgRevenue: Math.round(avgRevenue),
      avgQuality: Math.round(avgQuality),
      completionRate: Math.round((totalCompleted / totalOrders) * 100),
      avgTurnaround: Math.round(chartData.reduce((sum, item) => sum + item.turnaroundTime, 0) / chartData.length),
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: theme.shadows.medium,
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: theme.colors.text }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontSize: '0.9rem'
            }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    if (!showLegend) return null;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        {payload?.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: theme.colors.textSecondary
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: entry.color,
              borderRadius: '2px'
            }} />
            {entry.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnalyticsContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <FaChartLine /> {t('analytics.title')}
        </Title>
        <Controls>
          <DateRangeSelect
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </DateRangeSelect>
          <GlowButton
            onClick={() => setShowLegend(!showLegend)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showLegend ? <FaEyeSlash /> : <FaEye />}
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </GlowButton>
                     <GlowButton
             onClick={() => window.location.reload()}
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
             <FaRedo /> Refresh
           </GlowButton>
        </Controls>
      </Header>

      {/* Summary Stats */}
      <StatsGrid>
        <StatCard color="#3B82F6">
          <StatIcon color="#3B82F6">
            <FaVial />
          </StatIcon>
          <StatContent>
            <StatValue>{summaryStats.totalOrders}</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#10B981">
          <StatIcon color="#10B981">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{summaryStats.totalCompleted}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#F59E0B">
          <StatIcon color="#F59E0B">
            <FaChartLine />
          </StatIcon>
          <StatContent>
            <StatValue>${summaryStats.avgRevenue.toLocaleString()}</StatValue>
            <StatLabel>Avg Revenue</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#8B5CF6">
          <StatIcon color="#8B5CF6">
            <FaThermometer />
          </StatIcon>
          <StatContent>
            <StatValue>{summaryStats.avgQuality}%</StatValue>
            <StatLabel>Quality Score</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#06B6D4">
          <StatIcon color="#06B6D4">
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{summaryStats.avgTurnaround}h</StatValue>
            <StatLabel>Avg Turnaround</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard color="#EF4444">
          <StatIcon color="#EF4444">
            <FaExclamationTriangle />
          </StatIcon>
          <StatContent>
            <StatValue>{summaryStats.completionRate}%</StatValue>
            <StatLabel>Completion Rate</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Charts */}
      <ChartGrid>
        {/* Orders Trend */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <FaChartLine /> Orders Trend
            </ChartTitle>
            <ChartControls>
              <GlowButton size="small">
                <FaDownload /> Export
              </GlowButton>
            </ChartControls>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="date" 
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Analysis */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <FaChartBar /> Revenue Analysis
            </ChartTitle>
            <ChartControls>
              <GlowButton size="small">
                <FaDownload /> Export
              </GlowButton>
            </ChartControls>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="date" 
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Test Types Distribution */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <FaChartPie /> Test Types
            </ChartTitle>
            <ChartControls>
              <GlowButton size="small">
                <FaDownload /> Export
              </GlowButton>
            </ChartControls>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={testTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {testTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quality Score Trend */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <FaThermometer /> Quality Score
            </ChartTitle>
            <ChartControls>
              <GlowButton size="small">
                <FaDownload /> Export
              </GlowButton>
            </ChartControls>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="date" 
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Area 
                type="monotone" 
                dataKey="qualityScore" 
                stroke="#8B5CF6" 
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Order Status Distribution */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <FaChartPie /> Order Status
            </ChartTitle>
            <ChartControls>
              <GlowButton size="small">
                <FaDownload /> Export
              </GlowButton>
            </ChartControls>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Turnaround Time vs Quality */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <FaChartScatter /> Turnaround vs Quality
            </ChartTitle>
            <ChartControls>
              <GlowButton size="small">
                <FaDownload /> Export
              </GlowButton>
            </ChartControls>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                type="number" 
                dataKey="turnaroundTime" 
                name="Turnaround Time (hours)"
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <YAxis 
                type="number" 
                dataKey="qualityScore" 
                name="Quality Score (%)"
                stroke={theme.colors.textSecondary}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Scatter 
                dataKey="qualityScore" 
                fill="#06B6D4" 
                stroke="#06B6D4"
                strokeWidth={2}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </AnalyticsContainer>
  );
};

export default AdvancedAnalytics; 