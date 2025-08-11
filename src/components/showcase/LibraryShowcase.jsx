import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { IconMicroscope, IconFlask, IconTestPipe, IconChartLine, IconCode, IconPalette, IconUpload, IconFileText } from '@tabler/icons-react';
import { usePerformanceMonitor } from '../../utils/performance/performanceOptimizer';


// Styled Components
const ShowcaseContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  contain: layout style paint;
  min-height: 100vh;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  contain: layout style;
  min-height: 200px;
  display: flex;
  flex-direction: column;
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const MotionSpan = styled(motion.span)`
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const DropzoneContainer = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
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

const SimpleChart = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const ChartBar = styled.div`
  width: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scaleY(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const LibraryShowcase = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Performance monitoring
  usePerformanceMonitor('LibraryShowcase');

  // Memoized data
  const chartData = useMemo(() => [
    { label: 'Jan', value: 85, height: 85 },
    { label: 'Feb', value: 92, height: 92 },
    { label: 'Mar', value: 88, height: 88 },
    { label: 'Apr', value: 95, height: 95 },
    { label: 'May', value: 91, height: 91 },
    { label: 'Jun', value: 97, height: 97 }
  ], []);

  const pieData = useMemo(() => [
    { label: 'Hematology', value: 35, color: '#3b82f6' },
    { label: 'Biochemistry', value: 25, color: '#10b981' },
    { label: 'Microbiology', value: 20, color: '#f59e0b' },
    { label: 'Immunology', value: 15, color: '#ef4444' },
    { label: 'Molecular', value: 5, color: '#8b5cf6' }
  ], []);

  const workflowSteps = useMemo(() => [
    { step: 'Sample Collection', status: 'completed', icon: '🩸' },
    { step: 'Sample Processing', status: 'completed', icon: '🧪' },
    { step: 'Testing', status: 'in-progress', icon: '🔬' },
    { step: 'Results', status: 'pending', icon: '📊' }
  ], []);

  // Optimized handlers
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    })));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    })));
  }, []);

  // Simple animation effect
  useEffect(() => {
    const cards = document.querySelectorAll('.showcase-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);





  return (
    <ShowcaseContainer>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}
      >
        🚀 Advanced LIMS Library Showcase
      </motion.h1>

      {/* Data Visualization Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle>
          <IconChartLine size={24} />
          Data Visualization & Analytics
        </SectionTitle>
        <Grid>
          <Card className="showcase-card">
            <h3>Test Results Trend</h3>
            <ChartContainer>
              <SimpleChart>
                <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', height: '200px' }}>
                  {chartData.map((item, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <ChartBar 
                        style={{ height: `${item.height * 2}px` }}
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
                    Monthly test result quality scores
                  </p>
                </div>
              </SimpleChart>
            </ChartContainer>
          </Card>

          <Card className="showcase-card">
            <h3>Test Distribution</h3>
            <ChartContainer>
              <SimpleChart>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {pieData.map((item, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: `conic-gradient(${item.color} 0deg, ${item.color} ${item.value * 3.6}deg, #e5e7eb ${item.value * 3.6}deg, #e5e7eb 360deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.5rem auto',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {item.value}%
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Test Type Distribution</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    Percentage breakdown by test category
                  </p>
                </div>
              </SimpleChart>
            </ChartContainer>
          </Card>

          <Card className="showcase-card">
            <h3>Quality Control Dashboard</h3>
            <ChartContainer>
              <SimpleChart>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                    <div key={day} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      padding: '0.5rem',
                      background: 'rgba(59, 130, 246, 0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                      <div style={{ 
                        minWidth: '80px', 
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '0.875rem'
                      }}>
                        {day}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.25rem',
                        flex: 1
                      }}>
                        {[85, 92, 88, 95, 91].map((score, scoreIndex) => (
                          <div key={scoreIndex} style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '0.25rem',
                            background: `hsl(${200 + (score - 80) * 2}, 70%, ${50 + (score - 80) * 0.5}%)`,
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {score}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Daily QC Scores</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    Quality control scores by day
                  </p>
                </div>
              </SimpleChart>
            </ChartContainer>
          </Card>

          <Card className="showcase-card">
            <h3>Monthly Test Volume</h3>
            <ChartContainer>
              <SimpleChart>
                <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', height: '200px' }}>
                  {[
                    { label: 'Jan', tests: 120, quality: 95 },
                    { label: 'Feb', tests: 135, quality: 92 },
                    { label: 'Mar', tests: 110, quality: 88 },
                    { label: 'Apr', tests: 150, quality: 96 },
                    { label: 'May', tests: 140, quality: 94 },
                    { label: 'Jun', tests: 160, quality: 98 }
                  ].map((item, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <ChartBar 
                          style={{ 
                            height: `${item.tests / 2}px`,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}
                          title={`${item.label}: ${item.tests} tests`}
                        />
                        <ChartBar 
                          style={{ 
                            height: `${item.quality}px`,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                          }}
                          title={`${item.label}: ${item.quality}% quality`}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                      <span style={{ fontSize: '0.75rem' }}>Tests</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                      <span style={{ fontSize: '0.75rem' }}>Quality</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    Monthly test volume and quality metrics
                  </p>
                </div>
              </SimpleChart>
            </ChartContainer>
          </Card>
        </Grid>
      </Section>

      {/* Interactive Features Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SectionTitle>
          <IconTestPipe size={24} />
          Interactive Features & Tools
        </SectionTitle>
        <Grid>
          <Card className="showcase-card">
            <h3>QR Code Generation</h3>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <QRCodeSVG
                value="https://smartlab-lims.com/sample/12345"
                size={200}
                level="H"
                includeMargin={true}
              />
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Sample tracking QR codes for lab specimens
              </p>
            </div>
          </Card>

          <Card className="showcase-card">
            <h3>File Upload System</h3>
            <DropzoneContainer
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                borderColor: isDragging ? '#3b82f6' : undefined,
                background: isDragging ? 'rgba(59, 130, 246, 0.05)' : undefined
              }}
            >
              <IconUpload size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
              <p style={{ marginBottom: '1rem' }}>
                {isDragging ? 'Drop files here...' : 'Drag & drop lab files here, or click to select'}
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <MotionSpan
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select Files
                </MotionSpan>
              </label>
            </DropzoneContainer>
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Uploaded Files:</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {uploadedFiles.map((file, index) => (
                    <li key={index} style={{ 
                      padding: '0.5rem', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      borderRadius: '4px', 
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <IconFileText size={16} color="#10b981" />
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="showcase-card">
            <h3>Interactive Buttons</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Primary Action
              </Button>
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                Success Action
              </Button>
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                Warning Action
              </Button>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
              Smooth animations and hover effects for better user experience
            </p>
          </Card>

          <Card className="showcase-card">
            <h3>Workflow Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {workflowSteps.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                             item.status === 'in-progress' ? 'rgba(59, 130, 246, 0.1)' :
                             'rgba(156, 163, 175, 0.1)',
                  border: item.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.2)' :
                         item.status === 'in-progress' ? '1px solid rgba(59, 130, 246, 0.2)' :
                         '1px solid rgba(156, 163, 175, 0.2)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#374151' }}>{item.step}</div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: item.status === 'completed' ? '#10b981' :
                             item.status === 'in-progress' ? '#3b82f6' :
                             '#6b7280'
                    }}>
                      {item.status === 'completed' ? '✓ Completed' :
                       item.status === 'in-progress' ? '⟳ In Progress' :
                       '⏳ Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Grid>
      </Section>

      {/* Feature Highlights Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SectionTitle>
          <IconPalette size={24} />
          Advanced Features & Capabilities
        </SectionTitle>
        <Grid>
          <FeatureCard className="showcase-card" color="#3b82f6">
            <IconMicroscope size={48} />
            <h3>Advanced Analytics</h3>
            <p>Real-time data visualization and trend analysis for lab performance monitoring</p>
          </FeatureCard>

          <FeatureCard className="showcase-card" color="#10b981">
            <IconFlask size={48} />
            <h3>Quality Control</h3>
            <p>Comprehensive QC monitoring and statistical process control for accurate results</p>
          </FeatureCard>

          <FeatureCard className="showcase-card" color="#f59e0b">
            <IconTestPipe size={48} />
            <h3>Workflow Management</h3>
            <p>Streamlined lab processes with automated workflow tracking and status updates</p>
          </FeatureCard>

          <FeatureCard className="showcase-card" color="#8b5cf6">
            <IconCode size={48} />
            <h3>Modern Technology</h3>
            <p>Built with cutting-edge libraries for smooth animations and responsive design</p>
          </FeatureCard>
        </Grid>
      </Section>



      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem' }}
      >
        <h2>🎉 Advanced LIMS Features Successfully Integrated!</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '1rem' }}>
          Your LIMS system now has access to cutting-edge visualization, 
          interactive tools, and modern user experience features.
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
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Interactive Charts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
            <div style={{ fontWeight: '600' }}>Modern UI</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Smooth Animations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔧</div>
            <div style={{ fontWeight: '600' }}>Interactive Tools</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>File Upload & QR Codes</div>
          </div>
        </div>
      </motion.div>
    </ShowcaseContainer>
  );
};

export default LibraryShowcase; 