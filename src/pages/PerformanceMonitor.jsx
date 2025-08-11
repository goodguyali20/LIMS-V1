import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Activity, 
  HardDrive, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Database,
  Network,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { PerformanceOptimizer } from '../utils/performance/performanceOptimizer';

const MonitorContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  text-align: center;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${({ $status }) => {
    switch ($status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ $status }) => {
    switch ($status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#374151';
    }
  }};
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #374151;
`;

const ControlPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LogPanel = styled.div`
  background: #1f2937;
  color: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
`;

const LogEntry = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  
  &.warning {
    background: rgba(245, 158, 11, 0.1);
    border-left: 3px solid #f59e0b;
  }
  
  &.error {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid #ef4444;
  }
  
  &.info {
    background: rgba(59, 130, 246, 0.1);
    border-left: 3px solid #3b82f6;
  }
`;

const RecommendationsPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const RecommendationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
`;

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    memoryUsed: 0,
    memoryTotal: 0,
    memoryLimit: 0,
    layoutShifts: 0,
    firstInputDelay: 0,
    longTasks: 0,
    slowOperations: 0
  });
  
  const [logs, setLogs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const performanceOptimizer = useRef(PerformanceOptimizer.getInstance());
  const refreshInterval = useRef(null);

  useEffect(() => {
    // Start monitoring on mount
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, []);

  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      refreshInterval.current = setInterval(updateMetrics, 5000);
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, isMonitoring]);

  const startMonitoring = () => {
    const optimizer = performanceOptimizer.current;
    
    // Start all monitoring
    optimizer.startMemoryMonitoring();
    // optimizer.startLayoutShiftMonitoring(); // Disabled to reduce console clutter
    optimizer.startFirstInputDelayMonitoring();
    optimizer.startLongTaskMonitoring();
    optimizer.startSlowOperationMonitoring();
    optimizer.startComponentPerformanceMonitoring();
    optimizer.startNetworkMonitoring();
    
    setIsMonitoring(true);
    updateMetrics();
    
    // Capture console warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      originalWarn.apply(console, args);
      const message = args.join(' ');
      if (message.includes('🐌') || message.includes('⚠️') || message.includes('🚨')) {
        addLog('warning', message);
      }
    };
  };

  const stopMonitoring = () => {
    const optimizer = performanceOptimizer.current;
    optimizer.cleanup();
    setIsMonitoring(false);
    
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
  };

  const updateMetrics = () => {
    const optimizer = performanceOptimizer.current;
    const report = optimizer.getDetailedPerformanceReport();
    
    setMetrics({
      memoryUsed: report.memory_used_mb?.average || 0,
      memoryTotal: report.memory_total_mb?.average || 0,
      memoryLimit: (performance.memory && performance.memory.jsHeapSizeLimit) ? performance.memory.jsHeapSizeLimit / 1024 / 1024 : 0,
      layoutShifts: report.layout_shift?.count || 0,
      firstInputDelay: report.first_input_delay?.average || 0,
      longTasks: report.long_task?.count || 0,
      slowOperations: report.slow_operation?.count || 0
    });
    
    // Update recommendations
    const newRecommendations = optimizer.getPerformanceRecommendations();
    setRecommendations(newRecommendations);
  };

  const addLog = (type, message) => {
    setLogs(prev => [...prev.slice(-50), {
      type,
      message,
      timestamp: new Date().toISOString()
    }]);
  };

  const generateReport = () => {
    const optimizer = performanceOptimizer.current;
    const report = optimizer.generatePerformanceReport();
    addLog('info', 'Performance report generated - check console for details');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatus = (value, thresholds) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const memoryUsage = (metrics.memoryUsed / metrics.memoryLimit) * 100;
  const memoryStatus = getStatus(memoryUsage, { good: 50, warning: 80 });
  const layoutShiftStatus = getStatus(metrics.layoutShifts, { good: 0, warning: 5 });
  const inputDelayStatus = getStatus(metrics.firstInputDelay, { good: 50, warning: 100 });

  return (
    <MonitorContainer>
      <Header>
        <h1>Performance Monitor</h1>
        <p>Real-time monitoring of LIMS application performance</p>
      </Header>

      <ControlPanel>
        <h2>Controls</h2>
        <div>
          <Button 
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={isMonitoring}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button onClick={updateMetrics}>
            <RefreshCw size={16} />
            Refresh Metrics
          </Button>
          <Button onClick={generateReport}>
            <Database size={16} />
            Generate Report
          </Button>
          <Button onClick={clearLogs}>
            Clear Logs
          </Button>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Auto Refresh (5s)
          </label>
        </div>
      </ControlPanel>

      <MetricsGrid>
        <MetricCard
          $status={memoryStatus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MetricIcon>
            <HardDrive size={20} />
            Memory Usage
          </MetricIcon>
          <MetricValue $status={memoryStatus}>
            {memoryUsage.toFixed(1)}%
          </MetricValue>
          <MetricLabel>
            {formatBytes(metrics.memoryUsed * 1024 * 1024)} / {formatBytes(metrics.memoryLimit * 1024 * 1024)}
          </MetricLabel>
        </MetricCard>

        <MetricCard
          $status={layoutShiftStatus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <MetricIcon>
            <Activity size={20} />
            Layout Shifts
          </MetricIcon>
          <MetricValue $status={layoutShiftStatus}>
            {metrics.layoutShifts}
          </MetricValue>
          <MetricLabel>
            Cumulative Layout Shift Events
          </MetricLabel>
        </MetricCard>

        <MetricCard
          $status={inputDelayStatus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MetricIcon>
            <Clock size={20} />
            First Input Delay
          </MetricIcon>
          <MetricValue $status={inputDelayStatus}>
            {metrics.firstInputDelay.toFixed(1)}ms
          </MetricValue>
          <MetricLabel>
            Response Time to User Input
          </MetricLabel>
        </MetricCard>

        <MetricCard
          $status={metrics.longTasks > 0 ? 'warning' : 'good'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <MetricIcon>
            <Cpu size={20} />
            Long Tasks
          </MetricIcon>
          <MetricValue $status={metrics.longTasks > 0 ? 'warning' : 'good'}>
            {metrics.longTasks}
          </MetricValue>
          <MetricLabel>
            Tasks &gt; 50ms Duration
          </MetricLabel>
        </MetricCard>

        <MetricCard
          $status={metrics.slowOperations > 0 ? 'warning' : 'good'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <MetricIcon>
            <Zap size={20} />
            Slow Operations
          </MetricIcon>
          <MetricValue $status={metrics.slowOperations > 0 ? 'warning' : 'good'}>
            {metrics.slowOperations}
          </MetricValue>
          <MetricLabel>
            Operations &gt; 100ms
          </MetricLabel>
        </MetricCard>

        <MetricCard
          $status="info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <MetricIcon>
            <Network size={20} />
            Network Requests
          </MetricIcon>
          <MetricValue $status="info">
            {logs.filter(log => log.message.includes('🌐')).length}
          </MetricValue>
          <MetricLabel>
            Slow Network Requests
          </MetricLabel>
        </MetricCard>
      </MetricsGrid>

      {recommendations.length > 0 && (
        <RecommendationsPanel>
          <h2>Performance Recommendations</h2>
          {recommendations.map((rec, index) => (
            <RecommendationItem key={index}>
              <AlertTriangle size={20} color="#3b82f6" />
              <div>{rec}</div>
            </RecommendationItem>
          ))}
        </RecommendationsPanel>
      )}

      <LogPanel>
        <h2>Performance Logs</h2>
        {logs.length === 0 ? (
          <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            No performance issues detected yet...
          </div>
        ) : (
          logs.map((log, index) => (
            <LogEntry key={index} className={log.type}>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div>{log.message}</div>
            </LogEntry>
          ))
        )}
      </LogPanel>
    </MonitorContainer>
  );
};

export default PerformanceMonitor; 