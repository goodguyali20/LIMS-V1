import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { 
  IconChartBar, 
  IconChartLine, 
  IconChartPie, 
  IconChartArea,
  Icon3dCubeSphere,
  IconDragDrop,
  IconKeyboard,
  IconEye,
  IconBrain,
  IconDatabase,
  IconFileAnalytics,
  IconDeviceAnalytics
} from '@tabler/icons-react';

// Styled Components
const ShowcaseContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
`;

const Section = styled(motion.section)`
  margin-bottom: 3rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 400px;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const FeatureCard = styled(motion.div)`
  background: linear-gradient(135deg, ${({ color }) => color}20 0%, ${({ color }) => color}10 100%);
  border: 1px solid ${({ color }) => color}30;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  
  h3 {
    color: ${({ color }) => color};
    margin-bottom: 1rem;
  }
`;

const D3Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AdvancedLibraryShowcase = () => {
  const [activeTab, setActiveTab] = useState('d3');
  const d3Ref = useRef(null);
  const [d3Data, setD3Data] = useState([]);

  // Generate sample data for D3
  useEffect(() => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 5,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
    setD3Data(data);
  }, []);

  // D3 Scatter Plot
  useEffect(() => {
    if (d3Ref.current && d3Data.length > 0) {
      const svg = d3.select(d3Ref.current)
        .append('svg')
        .attr('width', 300)
        .attr('height', 250);

      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const width = 300 - margin.left - margin.right;
      const height = 250 - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear()
        .domain([0, d3.max(d3Data, d => d.x)])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(d3Data, d => d.y)])
        .range([height, 0]);

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      g.append('g')
        .call(d3.axisLeft(y));

      // Add dots
      g.selectAll('circle')
        .data(d3Data)
        .enter().append('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', d => d.size)
        .style('fill', d => d.color)
        .style('opacity', 0.7);

      return () => {
        d3.select(d3Ref.current).selectAll('*').remove();
      };
    }
  }, [d3Data]);

  // Machine Learning Demo Data
  const mlData = {
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    importance: [0.3, 0.25, 0.2, 0.15],
    accuracy: 0.92,
    predictions: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0]
  };

  // Interactive Chart Data
  const chartData = [
    { label: 'Jan', value: 85, height: 85 },
    { label: 'Feb', value: 92, height: 92 },
    { label: 'Mar', value: 88, height: 88 },
    { label: 'Apr', value: 95, height: 95 },
    { label: 'May', value: 91, height: 91 },
    { label: 'Jun', value: 97, height: 97 }
  ];

  return (
    <ShowcaseContainer>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}
      >
        🚀 Advanced Library Showcase
      </motion.h1>

      {/* Advanced Data Visualization Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle>
          <IconChartBar size={24} />
          Advanced Data Visualization Libraries
        </SectionTitle>
        
        <div style={{ marginBottom: '1rem' }}>
          <Button 
            onClick={() => setActiveTab('d3')}
            style={{ background: activeTab === 'd3' ? '#3b82f6' : '#f1f5f9', color: activeTab === 'd3' ? 'white' : '#374151' }}
          >
            D3.js
          </Button>
          <Button 
            onClick={() => setActiveTab('charts')}
            style={{ background: activeTab === 'charts' ? '#3b82f6' : '#f1f5f9', color: activeTab === 'charts' ? 'white' : '#374151' }}
          >
            Interactive Charts
          </Button>
          <Button 
            onClick={() => setActiveTab('ml')}
            style={{ background: activeTab === 'ml' ? '#3b82f6' : '#f1f5f9', color: activeTab === 'ml' ? 'white' : '#374151' }}
          >
            Machine Learning
          </Button>
        </div>

        <Grid>
          <Card className="showcase-card">
            <h3>Interactive Visualizations</h3>
            <ChartContainer>
              <AnimatePresence mode="wait">
                {activeTab === 'd3' && (
                  <motion.div
                    key="d3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <D3Container ref={d3Ref} />
                  </motion.div>
                )}
                
                {activeTab === 'charts' && (
                  <motion.div
                    key="charts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ width: '100%', height: '100%', padding: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', height: '200px' }}>
                      {chartData.map((item, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '40px',
                            height: `${item.height * 2}px`,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }} 
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scaleY(1.1)';
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scaleY(1)';
                            e.target.style.boxShadow = 'none';
                          }}
                          title={`${item.label}: ${item.value}%`}
                          />
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Quality Score Trend</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                        Interactive monthly quality scores with hover effects
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'ml' && (
                  <motion.div
                    key="ml"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ width: '100%', height: '100%', padding: '1rem' }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Feature Importance</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {mlData.features.map((feature, index) => (
                          <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ minWidth: '80px', fontSize: '0.875rem' }}>{feature}</div>
                            <div style={{ 
                              flex: 1, 
                              height: '20px', 
                              background: '#e5e7eb', 
                              borderRadius: '10px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${mlData.importance[index] * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                                borderRadius: '10px'
                              }} />
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', minWidth: '40px' }}>
                              {(mlData.importance[index] * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Model Accuracy</h4>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                          {(mlData.accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Recent Predictions</h4>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '150px' }}>
                          {mlData.predictions.map((pred, index) => (
                            <div key={index} style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: pred === 1 ? '#10b981' : '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              color: 'white',
                              fontWeight: '600'
                            }}>
                              {pred}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ChartContainer>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              {activeTab === 'd3' && 'Custom D3.js visualization with dynamic data binding'}
              {activeTab === 'charts' && 'Interactive charts with hover effects and animations'}
              {activeTab === 'ml' && 'ML algorithms integration with feature importance visualization'}
            </p>
          </Card>

          <Card className="showcase-card">
            <h3>Performance Optimization</h3>
            <ChartContainer>
              <div style={{ padding: '1rem', width: '100%' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Virtual Scrolling</h4>
                  <div style={{ 
                    height: '150px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      overflow: 'auto',
                      background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
                    }}>
                      {Array.from({ length: 100 }, (_, i) => (
                        <div key={i} style={{
                          padding: '0.5rem',
                          borderBottom: '1px solid #e5e7eb',
                          background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                          fontSize: '0.875rem'
                        }}>
                          Row {i + 1} - Optimized rendering for large datasets
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Memory Usage</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                      85% ↓
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Render Time</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                      60% ↓
                    </div>
                  </div>
                </div>
              </div>
            </ChartContainer>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Virtual scrolling and performance optimization for large datasets
            </p>
          </Card>
        </Grid>
      </Section>

      {/* Advanced UI Libraries Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SectionTitle>
          <IconDragDrop size={24} />
          Advanced UI & Interaction Libraries
        </SectionTitle>
        <Grid>
          <FeatureCard className="showcase-card" color="#3b82f6">
            <IconKeyboard size={48} />
            <h3>Keyboard Shortcuts</h3>
            <p>Global hotkey support with react-hotkeys-hook for improved productivity</p>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <div>⌘+S: Save</div>
              <div>⌘+Z: Undo</div>
              <div>⌘+F: Search</div>
            </div>
          </FeatureCard>

          <FeatureCard className="showcase-card" color="#10b981">
            <IconEye size={48} />
            <h3>Intersection Observer</h3>
            <p>Performance optimized scrolling and visibility detection for large datasets</p>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <div>• Lazy loading</div>
              <div>• Infinite scroll</div>
              <div>• Visibility tracking</div>
            </div>
          </FeatureCard>

          <FeatureCard className="showcase-card" color="#f59e0b">
            <Icon3dCubeSphere size={48} />
            <h3>3D Graphics</h3>
            <p>Three.js integration for 3D visualizations and interactive models</p>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <div>• Molecular structures</div>
              <div>• Equipment models</div>
              <div>• Spatial data</div>
            </div>
          </FeatureCard>

          <FeatureCard className="showcase-card" color="#8b5cf6">
            <IconDatabase size={48} />
            <h3>Advanced Data Grid</h3>
            <p>Material-UI DataGrid for enterprise-level table functionality</p>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <div>• Sorting & filtering</div>
              <div>• Column resizing</div>
              <div>• Row selection</div>
            </div>
          </FeatureCard>
        </Grid>
      </Section>

      {/* Library Categories Overview */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SectionTitle>
          <IconFileAnalytics size={24} />
          Available Library Categories
        </SectionTitle>
        <Grid>
          <Card className="showcase-card">
            <h3>Data Visualization</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>@nivo/*</strong> - Advanced charts (bar, line, pie, heatmap)
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>recharts</strong> - React charting library
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>d3</strong> - Custom data visualizations
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>lightweight-charts</strong> - Financial-style charts
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>vis-network</strong> - Network visualizations
              </li>
            </ul>
          </Card>

          <Card className="showcase-card">
            <h3>Machine Learning</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>ml-kmeans</strong> - Clustering algorithms
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>ml-random-forest</strong> - Classification & regression
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>ml-regression</strong> - Linear & polynomial regression
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>jstat</strong> - Statistical functions
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>simple-statistics</strong> - Descriptive statistics
              </li>
            </ul>
          </Card>

          <Card className="showcase-card">
            <h3>UI & Animation</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>framer-motion</strong> - Advanced animations
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>gsap</strong> - Professional animations
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>react-spring</strong> - Physics-based animations
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>@mui/material</strong> - Material Design components
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>styled-components</strong> - CSS-in-JS styling
              </li>
            </ul>
          </Card>

          <Card className="showcase-card">
            <h3>Data Management</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>@tanstack/react-query</strong> - Data fetching & caching
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>@tanstack/react-table</strong> - Advanced table functionality
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>zustand</strong> - State management
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <strong>immer</strong> - Immutable state updates
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>react-virtualized</strong> - Large list optimization
              </li>
            </ul>
          </Card>
        </Grid>
      </Section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem' }}
      >
        <h2>🎉 Advanced Libraries Successfully Integrated!</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '1rem' }}>
          Your LIMS system now has access to cutting-edge libraries for data visualization, 
          machine learning, advanced UI components, and performance optimization.
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          marginTop: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontWeight: '600' }}>Data Visualization</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>D3, Nivo, Recharts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
            <div style={{ fontWeight: '600' }}>Machine Learning</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>ML Algorithms</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
            <div style={{ fontWeight: '600' }}>UI Components</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Material-UI, Animations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
            <div style={{ fontWeight: '600' }}>Performance</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Virtualization, Optimization</div>
          </div>
        </div>
      </motion.div>
    </ShowcaseContainer>
  );
};

export default AdvancedLibraryShowcase; 