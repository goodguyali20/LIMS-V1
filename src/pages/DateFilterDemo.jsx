import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AdvancedDateFilter from '../components/common/AdvancedDateFilter';
import AdvancedDateRangeFilter from '../components/common/AdvancedDateRangeFilter';

const DemoContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const DemoHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const DemoSection = styled.div`
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 1rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1.5rem;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterCard = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1rem;
  }
`;

const ValueDisplay = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  
  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 0.5rem;
  }
  
  pre {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text};
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

const DateFilterDemo = () => {
  const [singleDate, setSingleDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ startDate: new Date(), endDate: new Date() });
  const [dateRangeWithFunnel, setDateRangeWithFunnel] = useState({ startDate: new Date(), endDate: new Date() });
  const [dateRangeNoRefresh, setDateRangeNoRefresh] = useState({ startDate: new Date(), endDate: new Date() });

  const handleRefresh = () => {
    console.log('Refresh triggered!');
    // You can add actual refresh logic here
  };

  return (
    <DemoContainer>
      <DemoHeader>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Advanced Date Filter Demo
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Explore the advanced date filtering components with different configurations and features.
          These components provide a rich, interactive experience for date selection with calendar view,
          preset ranges, and customizable options.
        </motion.p>
      </DemoHeader>

      <DemoSection>
        <h2>Single Date Filter</h2>
        <p>
          A simple date picker that allows selecting a single date. Perfect for filtering data
          for a specific day.
        </p>
        
        <FilterCard>
          <h3>Basic Single Date Filter</h3>
          <p>Select a single date with calendar view and preset options.</p>
          <AdvancedDateFilter
            value={singleDate}
            onChange={setSingleDate}
            onRefresh={handleRefresh}
            placeholder="Select date"
            showRefresh={true}
            showFunnelSelect={false}
          />
          <ValueDisplay>
            <h4>Selected Value:</h4>
            <pre>{JSON.stringify(singleDate, null, 2)}</pre>
          </ValueDisplay>
        </FilterCard>
      </DemoSection>

      <DemoSection>
        <h2>Date Range Filter</h2>
        <p>
          Advanced date range picker that allows selecting start and end dates. Features
          visual range selection, preset ranges, and comprehensive filtering options.
        </p>
        
        <FilterGrid>
          <FilterCard>
            <h3>Basic Date Range</h3>
            <p>Select a date range with start and end dates.</p>
            <AdvancedDateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              onRefresh={handleRefresh}
              placeholder="Select date range"
              showRefresh={true}
              showFunnelSelect={false}
            />
            <ValueDisplay>
              <h4>Selected Range:</h4>
              <pre>{JSON.stringify(dateRange, null, 2)}</pre>
            </ValueDisplay>
          </FilterCard>

          <FilterCard>
            <h3>With Funnel Selection</h3>
            <p>Date range filter with additional funnel/store selection dropdown.</p>
            <AdvancedDateRangeFilter
              value={dateRangeWithFunnel}
              onChange={setDateRangeWithFunnel}
              onRefresh={handleRefresh}
              placeholder="Select date range"
              showRefresh={true}
              showFunnelSelect={true}
            />
            <ValueDisplay>
              <h4>Selected Range:</h4>
              <pre>{JSON.stringify(dateRangeWithFunnel, null, 2)}</pre>
            </ValueDisplay>
          </FilterCard>

          <FilterCard>
            <h3>Without Refresh Button</h3>
            <p>Date range filter without the refresh button for simpler interfaces.</p>
            <AdvancedDateRangeFilter
              value={dateRangeNoRefresh}
              onChange={setDateRangeNoRefresh}
              placeholder="Select date range"
              showRefresh={false}
              showFunnelSelect={false}
            />
            <ValueDisplay>
              <h4>Selected Range:</h4>
              <pre>{JSON.stringify(dateRangeNoRefresh, null, 2)}</pre>
            </ValueDisplay>
          </FilterCard>
        </FilterGrid>
      </DemoSection>

      <DemoSection>
        <h2>Features Overview</h2>
        <p>
          These date filter components include the following features:
        </p>
        
        <FilterGrid>
          <FilterCard>
            <h3>🎯 Interactive Calendar</h3>
            <p>
              Full calendar view with month navigation, today highlighting, and visual
              range selection for date ranges.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>⚡ Quick Presets</h3>
            <p>
              Predefined date ranges like Today, Yesterday, Last 7 days, Last 30 days,
              and more for quick selection.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>🔄 Refresh Integration</h3>
            <p>
              Built-in refresh functionality that can trigger data reloads and cache
              invalidation when needed.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>🎨 Modern Design</h3>
            <p>
              Beautiful glassmorphism design with smooth animations, hover effects,
              and responsive layout.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>🌐 Internationalization</h3>
            <p>
              Full i18n support with translation keys for all text elements,
              making it ready for multi-language applications.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>📱 Responsive</h3>
            <p>
              Mobile-friendly design that adapts to different screen sizes
              and maintains usability on all devices.
            </p>
          </FilterCard>
        </FilterGrid>
      </DemoSection>

      <DemoSection>
        <h2>Usage Examples</h2>
        <p>
          Here are some common use cases for these date filter components:
        </p>
        
        <FilterGrid>
          <FilterCard>
            <h3>Dashboard Analytics</h3>
            <p>
              Filter dashboard data by specific dates or date ranges to view
              performance metrics, trends, and insights.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>Report Generation</h3>
            <p>
              Generate reports for specific time periods with easy date selection
              and range picking capabilities.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>Data Export</h3>
            <p>
              Export data for specific date ranges with precise control over
              start and end dates.
            </p>
          </FilterCard>

          <FilterCard>
            <h3>Audit Logs</h3>
            <p>
              Review audit logs and activity history for specific time periods
              with intuitive date filtering.
            </p>
          </FilterCard>
        </FilterGrid>
      </DemoSection>
    </DemoContainer>
  );
};

export default DateFilterDemo; 