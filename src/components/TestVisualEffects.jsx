import React, { useState } from 'react';
import styled from 'styled-components';
import ManagerDashboard from '../pages/Dashboard/ManagerDashboard';

const TestContainer = styled.div`
  padding: 2rem;
  background: #1a1a1a;
  color: white;
  min-height: 100vh;
`;

const TestButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 1rem;
  
  &:hover {
    background: #2563eb;
  }
`;

const PerformanceInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-family: monospace;
`;

const TestVisualEffects = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [mountTime, setMountTime] = useState(0);
  const [unmountTime, setUnmountTime] = useState(0);

  const handleMount = () => {
    const start = performance.now();
    setShowDashboard(true);
    // Measure mount time on next tick
    setTimeout(() => {
      const end = performance.now();
      setMountTime(end - start);
    }, 0);
  };

  const handleUnmount = () => {
    const start = performance.now();
    setShowDashboard(false);
    // Measure unmount time on next tick
    setTimeout(() => {
      const end = performance.now();
      setUnmountTime(end - start);
    }, 0);
  };

  return (
    <TestContainer>
      <h1>ManagerDashboard Performance Test</h1>
      
      <div>
        <TestButton onClick={handleMount}>
          Mount ManagerDashboard
        </TestButton>
        <TestButton onClick={handleUnmount}>
          Unmount ManagerDashboard
        </TestButton>
      </div>

      <PerformanceInfo>
        <h3>Performance Metrics:</h3>
        <p>Mount Time: {mountTime.toFixed(2)}ms</p>
        <p>Unmount Time: {unmountTime.toFixed(2)}ms</p>
        <p>Status: {showDashboard ? 'Mounted' : 'Unmounted'}</p>
      </PerformanceInfo>

      {showDashboard && <ManagerDashboard />}
    </TestContainer>
  );
};

export default TestVisualEffects; 