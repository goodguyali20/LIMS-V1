import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { performanceOptimizer } from '../utils/performance/performanceOptimizer';

const MonitorContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  z-index: 9999;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
`;

const MonitorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.1);
`;

const MonitorTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }
`;

const MonitorContent = styled.div`
  padding: 1rem 1.5rem;
  max-height: 400px;
  overflow-y: auto;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const MetricName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const MetricValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $isSlow }) => $isSlow ? '#ef4444' : '#10b981'};
`;

const MetricBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const MetricProgress = styled.div`
  height: 100%;
  background: ${({ $isSlow }) => $isSlow ? '#ef4444' : '#10b981'};
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  transition: width 0.3s ease;
`;

const PerformanceMonitor = ({ isVisible = false, onClose }) => {
  const [metrics, setMetrics] = useState({});
  // const [isExpanded, setIsExpanded] = useState(false); // Unused state, comment out or remove

  // Update metrics every second
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const report = performanceOptimizer.getPerformanceReport();
      setMetrics(report);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Memoized slow operations
  const slowOperations = useMemo(() => {
    return Object.entries(metrics)
      .filter(([, value]) => value > 100) // Operations taking more than 100ms
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [metrics]);

  // Memoized performance score
  const performanceScore = useMemo(() => {
    const values = Object.values(metrics);
    if (values.length === 0) return 100;
    
    const avgTime = values.reduce((sum, val) => sum + val, 0) / values.length;
    const slowCount = values.filter(val => val > 100).length;
    
    let score = 100;
    if (avgTime > 50) score -= 20;
    if (avgTime > 100) score -= 30;
    if (slowCount > 0) score -= slowCount * 10;
    
    return Math.max(0, score);
  }, [metrics]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <MonitorContainer
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <MonitorHeader>
          <MonitorTitle>
            <FaChartLine />
            Performance Monitor
          </MonitorTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </MonitorHeader>
        
        <MonitorContent>
          {/* Performance Score */}
          <MetricCard>
            <MetricHeader>
              <MetricName>Overall Score</MetricName>
              <MetricValue $isSlow={performanceScore < 70}>
                {performanceScore.toFixed(0)}%
              </MetricValue>
            </MetricHeader>
            <MetricBar>
              <MetricProgress 
                $percentage={performanceScore} 
                $isSlow={performanceScore < 70}
              />
            </MetricBar>
          </MetricCard>

          {/* Slow Operations */}
          {slowOperations.length > 0 && (
            <MetricCard>
              <MetricHeader>
                <MetricName>
                  <FaExclamationTriangle style={{ color: '#ef4444', marginRight: '0.25rem' }} />
                  Slow Operations
                </MetricName>
              </MetricHeader>
              {slowOperations.map(([name, value]) => (
                <div key={name} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#666' }}>{name}</span>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>
                      {value.toFixed(1)}ms
                    </span>
                  </div>
                  <MetricBar>
                    <MetricProgress 
                      $percentage={(value / 200) * 100} 
                      $isSlow={true}
                    />
                  </MetricBar>
                </div>
              ))}
            </MetricCard>
          )}

          {/* Recent Metrics */}
          <MetricCard>
            <MetricHeader>
              <MetricName>
                <FaClock style={{ marginRight: '0.25rem' }} />
                Recent Metrics
              </MetricName>
            </MetricHeader>
            {Object.entries(metrics)
              .filter(([, value]) => value <= 100)
              .slice(0, 3)
              .map(([name, value]) => (
                <div key={name} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ color: '#666' }}>{name}</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    {value.toFixed(1)}ms
                  </span>
                </div>
              ))}
          </MetricCard>

          {/* Memory Usage */}
          <MetricCard>
            <MetricHeader>
              <MetricName>Memory Usage</MetricName>
              <MetricValue>
                {performance.memory ? 
                  `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 
                  'N/A'
                }
              </MetricValue>
            </MetricHeader>
            {performance.memory && (
              <MetricBar>
                <MetricProgress 
                  $percentage={(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100}
                  $isSlow={performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit > 0.8}
                />
              </MetricBar>
            )}
          </MetricCard>
        </MonitorContent>
      </MonitorContainer>
    </AnimatePresence>
  );
};

export default PerformanceMonitor; 