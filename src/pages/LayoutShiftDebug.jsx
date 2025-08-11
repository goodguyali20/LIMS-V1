import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  debugLayoutShifts, 
  applyQuickFixes, 
  monitorElement, 
  createVisualOverlay 
} from '../utils/performance/layoutShiftDebugger';
import { 
  LayoutShiftPreventionWrapper, 
  SkeletonLoader,
  SkeletonGrid,
  SkeletonList 
} from '../utils/performance/layoutShiftPrevention';

const DebugContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
`;

const DebugHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  text-align: center;
`;

const DebugSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0.25rem;
  
  &.active {
    background: #10b981;
    color: white;
  }
  
  &.inactive {
    background: #6b7280;
    color: white;
  }
`;

const TestArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
`;

const LayoutShiftDebug = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [debugStats, setDebugStats] = useState({
    totalShifts: 0,
    totalCLS: 0,
    averageShift: 0
  });
  const [cleanupFunctions, setCleanupFunctions] = useState([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [cleanupFunctions]);

  const startMonitoring = () => {
    const cleanup = debugLayoutShifts();
    if (cleanup) {
      setCleanupFunctions(prev => [...prev, cleanup]);
    }
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    cleanupFunctions.forEach(cleanup => cleanup());
    setCleanupFunctions([]);
    setIsMonitoring(false);
  };

  const applyFixes = () => {
    applyQuickFixes();
  };

  const toggleOverlay = () => {
    if (isOverlayActive) {
      const overlay = document.getElementById('layout-shift-overlay');
      if (overlay) {
        overlay.remove();
      }
      setIsOverlayActive(false);
    } else {
      createVisualOverlay();
      setIsOverlayActive(true);
    }
  };

  const testLayoutShift = () => {
    // Simulate a layout shift for testing
    const testElement = document.getElementById('test-element');
    if (testElement) {
      testElement.style.height = '300px';
      setTimeout(() => {
        testElement.style.height = '100px';
      }, 1000);
    }
  };

  return (
    <DebugContainer>
      <DebugHeader>
        <h1>Layout Shift Debugger</h1>
        <p>Identify and fix layout shifts in the LIMS application</p>
      </DebugHeader>

      <DebugSection>
        <h2>Monitoring Controls</h2>
        <div>
          <Button 
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={isMonitoring}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <StatusBadge className={isMonitoring ? 'active' : 'inactive'}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </StatusBadge>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={applyFixes}>
            Apply Quick Fixes
          </Button>
          <Button onClick={toggleOverlay}>
            {isOverlayActive ? 'Remove Visual Overlay' : 'Show Visual Overlay'}
          </Button>
        </div>
      </DebugSection>

      <DebugSection>
        <h2>Test Layout Shifts</h2>
        <p>Click the button below to simulate a layout shift for testing:</p>
        <Button onClick={testLayoutShift}>
          Simulate Layout Shift
        </Button>
        
        <TestArea id="test-element">
          <p>This element will change height to simulate a layout shift</p>
          <p>Current height: <span id="height-display">100px</span></p>
        </TestArea>
      </DebugSection>

      <DebugSection>
        <h2>Layout Shift Prevention Examples</h2>
        
        <h3>With Skeleton Loader</h3>
        <LayoutShiftPreventionWrapper styleType="card" minHeight="200px">
          <div style={{ padding: '1rem' }}>
            <h4>Stable Card Content</h4>
            <p>This card has a minimum height to prevent layout shifts.</p>
          </div>
        </LayoutShiftPreventionWrapper>

        <h3>Skeleton Grid</h3>
        <SkeletonGrid columns={3} rows={2} />

        <h3>Skeleton List</h3>
        <SkeletonList items={5} height="60px" />
      </DebugSection>

      <DebugSection>
        <h2>Common Layout Shift Sources</h2>
        <ul>
          <li><strong>Images without dimensions:</strong> Add width, height, and aspect-ratio</li>
          <li><strong>Dynamic content:</strong> Use skeleton loaders and min-height</li>
          <li><strong>Font loading:</strong> Use font-display: swap</li>
          <li><strong>Buttons:</strong> Add min-width and min-height</li>
          <li><strong>Containers:</strong> Use CSS containment and fixed dimensions</li>
        </ul>
      </DebugSection>

      <DebugSection>
        <h2>Quick Fixes Applied</h2>
        <p>When you click "Apply Quick Fixes", the following changes are made:</p>
        <ul>
          <li>Add aspect-ratio to images without dimensions</li>
          <li>Add min-height to containers</li>
          <li>Add min-width and min-height to buttons</li>
          <li>Add min-height to text elements</li>
          <li>Apply CSS containment to all elements</li>
        </ul>
      </DebugSection>

      <DebugSection>
        <h2>Monitoring Information</h2>
        <p>When monitoring is active, you'll see detailed information in the browser console:</p>
        <ul>
          <li>Layout shift values and timestamps</li>
          <li>Element-specific information (tag, class, dimensions)</li>
          <li>Suggested fixes for each shift</li>
          <li>Summary statistics when monitoring stops</li>
        </ul>
      </DebugSection>
    </DebugContainer>
  );
};

export default LayoutShiftDebug; 