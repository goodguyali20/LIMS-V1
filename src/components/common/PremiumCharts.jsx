import React from 'react';
import styled from 'styled-components';
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
  Area,
  AreaChart
} from 'recharts';

const PremiumChartCard = styled.div`
  background: linear-gradient(135deg, 
    var(--surface-color) 0%, 
    var(--surface-color)dd 100%);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444);
    border-radius: 20px 20px 0 0;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    &::before {
      content: '';
      width: 4px;
      height: 24px;
      background: linear-gradient(180deg, #3b82f6, #10b981);
      border-radius: 2px;
    }
  }
`;

const ChartContainer = styled.div`
  position: relative;
  height: 350px;
  
  .recharts-wrapper {
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
  
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: var(--border-color)40;
    stroke-width: 1;
  }
  
  .recharts-xAxis .recharts-cartesian-axis-tick-value,
  .recharts-yAxis .recharts-cartesian-axis-tick-value {
    font-size: 12px;
    font-weight: 500;
    fill: var(--text-secondary-color);
  }
  
  .recharts-tooltip-wrapper {
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .recharts-default-tooltip {
    background: var(--surface-color) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 1rem !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
  }
`;

const CustomTooltip = styled.div`
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  .tooltip-label {
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }
  
  .tooltip-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    
    .color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .value {
      font-weight: 500;
      color: var(--text-color);
    }
  }
`;

const PieChartContainer = styled.div`
  position: relative;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .pie-legend {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 14px;
      font-weight: 500;
      
      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .percentage {
        color: var(--text-secondary-color);
        font-weight: 400;
      }
    }
  }
`;

const AnimatedBar = styled(Bar)`
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AnimatedLine = styled(Line)`
  transition: all 0.3s ease;
  
  &:hover {
    stroke-width: 3;
  }
`;

const AnimatedArea = styled(Area)`
  transition: all 0.3s ease;
`;

export const PremiumTrendChart = ({ data, title, icon }) => {
  // Add error handling for missing data
  if (!data || data.length === 0) {
    return (
      <PremiumChartCard
        style={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
      >
        <h3>
          {icon} {title}
        </h3>
        <ChartContainer>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'var(--text-secondary-color)'
          }}>
            No data available
          </div>
        </ChartContainer>
      </PremiumChartCard>
    );
  }

  const CustomTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <div className="tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-item">
              <div 
                className="color-dot" 
                style={{ background: entry.color }}
              />
              <span className="name">{entry.name}:</span>
              <span className="value">{entry.value}</span>
            </div>
          ))}
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <PremiumChartCard
      style={{
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.3s ease'
      }}
    >
      <h3>
        {icon} {title}
      </h3>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="testsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#37415120" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltipContent />} />
            <AnimatedArea
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#ordersGradient)"
              name="Orders"
            />
            <AnimatedArea
              type="monotone"
              dataKey="tests"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#testsGradient)"
              name="Tests"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PremiumChartCard>
  );
};

export const PremiumDistributionChart = ({ data, title, icon }) => {
  // Add error handling for missing data
  if (!data || data.length === 0) {
    return (
      <PremiumChartCard
        style={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
      >
        <h3>
          {icon} {title}
        </h3>
        <PieChartContainer>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'var(--text-secondary-color)'
          }}>
            No data available
          </div>
        </PieChartContainer>
      </PremiumChartCard>
    );
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <CustomTooltip>
          <div className="tooltip-label">{data.name}</div>
          <div className="tooltip-item">
            <div 
              className="color-dot" 
              style={{ background: data.payload.color }}
            />
            <span className="name">Value:</span>
            <span className="value">{data.value}%</span>
          </div>
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <PremiumChartCard
      style={{
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.3s ease'
      }}
    >
      <h3>
        {icon} {title}
      </h3>
      <PieChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
              animationBegin={300}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="color-dot" 
                style={{ background: item.color }}
              />
              <span>{item.name}</span>
              <span className="percentage">({item.value}%)</span>
            </div>
          ))}
        </div>
      </PieChartContainer>
    </PremiumChartCard>
  );
};

export const PremiumBarChart = ({ data, title, icon }) => {
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <div className="tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-item">
              <div 
                className="color-dot" 
                style={{ background: entry.color }}
              />
              <span className="name">{entry.name}:</span>
              <span className="value">{entry.value}</span>
            </div>
          ))}
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <PremiumChartCard
      style={{
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.3s ease'
      }}
    >
      <h3>
        {icon} {title}
      </h3>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#37415120" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <AnimatedBar 
              dataKey="orders" 
              fill="url(#barGradient1)" 
              name="Orders"
              radius={[4, 4, 0, 0]}
            />
            <AnimatedBar 
              dataKey="tests" 
              fill="url(#barGradient2)" 
              name="Tests"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PremiumChartCard>
  );
}; 