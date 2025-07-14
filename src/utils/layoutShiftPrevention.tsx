import React from 'react';
import styled from 'styled-components';

// CSS utilities to prevent layout shifts
export const layoutShiftPreventionCSS = `
  /* Prevent layout shifts for images */
  img {
    max-width: 100%;
    height: auto;
    aspect-ratio: attr(width) / attr(height);
  }
  
  /* Prevent layout shifts for containers */
  .prevent-layout-shift {
    contain: layout style paint;
    min-height: 0;
    min-width: 0;
  }
  
  /* Skeleton loading placeholders */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  /* Fixed aspect ratio containers */
  .aspect-ratio-container {
    position: relative;
    width: 100%;
    height: 0;
    overflow: hidden;
  }
  
  .aspect-ratio-container > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  /* Prevent text layout shifts */
  .text-container {
    min-height: 1.2em;
    line-height: 1.2;
  }
  
  /* Prevent button layout shifts */
  .button-container {
    min-width: 80px;
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Prevent card layout shifts */
  .card-container {
    min-height: 200px;
    contain: layout style paint;
  }
  
  /* Prevent grid layout shifts */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    contain: layout style paint;
  }
  
  /* Prevent sidebar layout shifts */
  .sidebar-container {
    width: 280px;
    min-width: 280px;
    contain: layout style paint;
  }
  
  /* Prevent header layout shifts */
  .header-container {
    height: 80px;
    min-height: 80px;
    contain: layout style paint;
  }
  
  /* Prevent content area layout shifts */
  .content-container {
    min-height: calc(100vh - 80px);
    contain: layout style paint;
  }
`;

// Styled components for layout shift prevention
export const SkeletonBox = styled.div<{ width?: string; height?: string; borderRadius?: string }>`
  width: ${(props: any) => props.width || '100%'};
  height: ${(props: any) => props.height || '20px'};
  border-radius: ${(props: any) => props.borderRadius || '4px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  
  @keyframes skeleton-loading {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const FixedAspectRatioContainer = styled.div<{ ratio: number }>`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: ${(props: any) => (1 / props.ratio) * 100}%;
  overflow: hidden;
  contain: layout style paint;
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const PreventLayoutShiftContainer = styled.div`
  contain: layout style paint;
  min-height: 0;
  min-width: 0;
`;

export const FixedHeightContainer = styled.div<{ height: string }>`
  height: ${(props: any) => props.height};
  min-height: ${(props: any) => props.height};
  contain: layout style paint;
  overflow: hidden;
`;

export const FixedWidthContainer = styled.div<{ width: string }>`
  width: ${(props: any) => props.width};
  min-width: ${(props: any) => props.width};
  contain: layout style paint;
  overflow: hidden;
`;

// React components for layout shift prevention
export const SkeletonLoader: React.FC<{
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}> = ({ width, height, borderRadius, className }) => (
  <SkeletonBox
    width={width}
    height={height}
    borderRadius={borderRadius}
    className={className}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`card-container ${className || ''}`}>
    <SkeletonBox height="200px" borderRadius="8px" />
    <div style={{ padding: '1rem' }}>
      <SkeletonBox height="20px" width="60%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBox height="16px" width="40%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBox height="16px" width="80%" />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBox
        key={index}
        height="16px"
        width={index === lines - 1 ? '60%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? '0.5rem' : 0 }}
      />
    ))}
  </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`button-container ${className || ''}`}>
    <SkeletonBox width="80px" height="36px" borderRadius="6px" />
  </div>
);

// Hook to prevent layout shifts during loading states
export const useLayoutShiftPrevention = (isLoading: boolean, fallbackHeight: string = '200px') => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (containerRef.current && isLoading) {
      // Set a minimum height to prevent layout shift
      containerRef.current.style.minHeight = fallbackHeight;
    }
  }, [isLoading, fallbackHeight]);
  
  return containerRef;
};

// Utility function to add layout shift prevention to existing components
export const withLayoutShiftPrevention = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    minHeight?: string;
    minWidth?: string;
    contain?: string;
  } = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      if (containerRef.current) {
        const style = containerRef.current.style;
        if (options.minHeight) style.minHeight = options.minHeight;
        if (options.minWidth) style.minWidth = options.minWidth;
        if (options.contain) style.contain = options.contain;
      }
    }, []);
    
    return (
      <div ref={containerRef} style={{ contain: 'layout style paint' }}>
        <Component {...props} />
      </div>
    );
  };
  
  WrappedComponent.displayName = `withLayoutShiftPrevention(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// CSS-in-JS styles for common layout shift prevention
export const layoutShiftStyles = {
  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  },
  container: {
    contain: 'layout style paint' as const,
    minHeight: 0,
    minWidth: 0,
  },
  card: {
    minHeight: '200px',
    contain: 'layout style paint' as const,
  },
  button: {
    minWidth: '80px',
    minHeight: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    minHeight: '1.2em',
    lineHeight: 1.2,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    contain: 'layout style paint' as const,
  },
};

// Performance monitoring for layout shifts
export const monitorLayoutShifts = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as any;
      if (layoutShift.value > 0.1) {
        console.warn('Layout shift detected:', {
          value: layoutShift.value,
          sources: layoutShift.sources?.length || 0,
          timestamp: layoutShift.startTime,
        });
        
        // Log specific elements causing shifts
        if (layoutShift.sources) {
          layoutShift.sources.forEach((source: any, index: number) => {
            const element = source.node;
            if (element) {
              console.warn(`Shift source ${index + 1}:`, {
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                currentRect: source.currentRect,
                previousRect: source.previousRect,
              });
            }
          });
        }
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });
  
  return () => observer.disconnect();
};

export default {
  layoutShiftPreventionCSS,
  SkeletonBox,
  FixedAspectRatioContainer,
  PreventLayoutShiftContainer,
  FixedHeightContainer,
  FixedWidthContainer,
  SkeletonLoader,
  SkeletonCard,
  SkeletonText,
  SkeletonButton,
  useLayoutShiftPrevention,
  withLayoutShiftPrevention,
  layoutShiftStyles,
  monitorLayoutShifts,
}; 