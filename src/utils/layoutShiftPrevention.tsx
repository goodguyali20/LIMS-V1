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
export const SkeletonBox = styled.div<{ $width?: string; $height?: string; $borderRadius?: string }>`
  width: ${(props: any) => props.$width || '100%'};
  height: ${(props: any) => props.$height || '20px'};
  border-radius: ${(props: any) => props.$borderRadius || '4px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  
  @keyframes skeleton-loading {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const FixedAspectRatioContainer = styled.div<{ $ratio: number }>`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: ${(props: any) => (1 / props.$ratio) * 100}%;
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

export const FixedHeightContainer = styled.div<{ $height: string }>`
  height: ${(props: any) => props.$height};
  min-height: ${(props: any) => props.$height};
  contain: layout style paint;
  overflow: hidden;
`;

export const FixedWidthContainer = styled.div<{ $width: string }>`
  width: ${(props: any) => props.$width};
  min-width: ${(props: any) => props.$width};
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
    $width={width}
    $height={height}
    $borderRadius={borderRadius}
    className={className}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`card-container ${className || ''}`}>
    <SkeletonBox $height="200px" $borderRadius="8px" />
    <div style={{ padding: '1rem' }}>
      <SkeletonBox $height="20px" $width="60%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBox $height="16px" $width="40%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBox $height="16px" $width="80%" />
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
        $height="16px"
        $width={index === lines - 1 ? '60%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? '0.5rem' : 0 }}
      />
    ))}
  </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`button-container ${className || ''}`}>
    <SkeletonBox $width="80px" $height="36px" $borderRadius="6px" />
  </div>
);

// Enhanced layout shift monitoring and prevention
export const monitorLayoutShifts = () => {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as any;
      if (layoutShift.value > 0.1) {
        console.warn(`🚨 Layout shift detected: ${layoutShift.value.toFixed(3)}`, {
          value: layoutShift.value,
          sources: layoutShift.sources,
          startTime: layoutShift.startTime,
          hadRecentInput: layoutShift.hadRecentInput
        });
        
        // Log detailed information about the sources
        if (layoutShift.sources && layoutShift.sources.length > 0) {
          console.warn('📍 Layout shift sources:');
          layoutShift.sources.forEach((source: any, index: number) => {
            console.warn(`  Source ${index + 1}:`, {
              node: source.node,
              currentRect: source.currentRect,
              previousRect: source.previousRect,
              nodeType: source.node?.nodeType,
              tagName: source.node?.tagName,
              className: source.node?.className,
              id: source.node?.id,
              computedStyle: source.node ? window.getComputedStyle(source.node) : null
            });
          });
        }
        
        // Suggest fixes based on the shift value
        if (layoutShift.value > 0.5) {
          console.warn('⚠️ Significant layout shift detected. Consider:');
          console.warn('  - Setting explicit width/height on images');
          console.warn('  - Using CSS containment');
          console.warn('  - Avoiding dynamic content insertion');
          console.warn('  - Using skeleton loaders');
          console.warn('  - Adding aspect-ratio CSS property');
          console.warn('  - Using CSS Grid/Flexbox with fixed dimensions');
        }
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });
  return observer;
};

// Utility to add layout shift prevention to components
export const withLayoutShiftPrevention = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    minHeight?: string;
    minWidth?: string;
    contain?: string;
    aspectRatio?: string;
    skeleton?: boolean;
  } = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
      if (containerRef.current) {
        const style = containerRef.current.style;
        if (options.minHeight) style.minHeight = options.minHeight;
        if (options.minWidth) style.minWidth = options.minWidth;
        if (options.contain) style.contain = options.contain;
        if (options.aspectRatio) style.aspectRatio = options.aspectRatio;
        
        // Set a timeout to remove loading state
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
      }
    }, []);
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          contain: options.contain || 'layout style paint',
          position: 'relative'
        }}
      >
        {isLoading && options.skeleton ? (
          <SkeletonLoader 
            width="100%" 
            height={options.minHeight || "200px"}
          />
        ) : (
          <Component {...props} />
        )}
      </div>
    );
  };
  
  WrappedComponent.displayName = `withLayoutShiftPrevention(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook to prevent layout shifts during data loading
export const useLayoutShiftPrevention = (
  isLoading: boolean, 
  fallbackHeight: string = '200px',
  fallbackWidth?: string
) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (containerRef.current) {
      const style = containerRef.current.style;
      if (isLoading) {
        style.minHeight = fallbackHeight;
        if (fallbackWidth) style.minWidth = fallbackWidth;
        style.contain = 'layout style paint';
      } else {
        // Remove min-height after content loads to allow natural sizing
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.minHeight = '';
            if (fallbackWidth) containerRef.current.style.minWidth = '';
          }
        }, 100);
      }
    }
  }, [isLoading, fallbackHeight, fallbackWidth]);
  
  return containerRef;
};

// CSS-in-JS styles for common layout shift prevention
export const layoutShiftStyles = {
  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    aspectRatio: 'attr(width) / attr(height)',
    contain: 'layout style paint'
  },
  
  container: {
    contain: 'layout style paint',
    minHeight: '0',
    minWidth: '0'
  },
  
  card: {
    minHeight: '200px',
    contain: 'layout style paint',
    display: 'flex',
    flexDirection: 'column' as const
  },
  
  button: {
    minWidth: '80px',
    minHeight: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    contain: 'layout style paint'
  },
  
  text: {
    minHeight: '1.2em',
    lineHeight: '1.2',
    contain: 'layout style paint'
  },
  
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    contain: 'layout style paint'
  },
  
  sidebar: {
    width: '280px',
    minWidth: '280px',
    contain: 'layout style paint'
  },
  
  header: {
    height: '80px',
    minHeight: '80px',
    contain: 'layout style paint'
  },
  
  content: {
    minHeight: 'calc(100vh - 80px)',
    contain: 'layout style paint'
  }
};

// Utility function to apply layout shift prevention styles
export const applyLayoutShiftPrevention = (
  element: HTMLElement,
  styleType: keyof typeof layoutShiftStyles
) => {
  const styles = layoutShiftStyles[styleType];
  Object.assign(element.style, styles);
};

// React component for layout shift prevention wrapper
export const LayoutShiftPreventionWrapper: React.FC<{
  children: React.ReactNode;
  styleType?: keyof typeof layoutShiftStyles;
  minHeight?: string;
  minWidth?: string;
  className?: string;
}> = ({ 
  children, 
  styleType = 'container', 
  minHeight, 
  minWidth, 
  className 
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      applyLayoutShiftPrevention(element, styleType);
      
      if (minHeight) element.style.minHeight = minHeight;
      if (minWidth) element.style.minWidth = minWidth;
    }
  }, [styleType, minHeight, minWidth]);
  
  return (
    <div 
      ref={containerRef}
      className={className}
    >
      {children}
    </div>
  );
};

// Enhanced skeleton components with better layout shift prevention
export const SkeletonGrid: React.FC<{ 
  columns?: number; 
  rows?: number; 
  gap?: string;
  className?: string;
}> = ({ 
  columns = 3, 
  rows = 2, 
  gap = '1rem',
  className 
}) => (
  <div 
    className={className}
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      contain: 'layout style paint'
    }}
  >
    {Array.from({ length: columns * rows }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  height?: string;
  className?: string;
}> = ({ 
  items = 5, 
  height = '60px',
  className 
}) => (
  <div 
    className={className}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      contain: 'layout style paint'
    }}
  >
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonBox 
        key={index}
        height={height}
        borderRadius="8px"
      />
    ))}
  </div>
);

// Utility to detect and log layout shifts in development
export const debugLayoutShifts = () => {
  console.log('🔍 Layout Shift Debug Mode Enabled');
  
  const addVisualIndicators = () => {
    // Add visual indicators to elements that might cause layout shifts
    const style = document.createElement('style');
    style.textContent = `
      .layout-shift-debug {
        outline: 2px solid red !important;
        outline-offset: 2px !important;
        position: relative !important;
      }
      
      .layout-shift-debug::before {
        content: 'LAYOUT SHIFT RISK' !important;
        position: absolute !important;
        top: -20px !important;
        left: 0 !important;
        background: red !important;
        color: white !important;
        padding: 2px 6px !important;
        font-size: 10px !important;
        font-weight: bold !important;
        z-index: 9999 !important;
        border-radius: 2px !important;
      }
      
      .layout-shift-fixed {
        outline: 2px solid green !important;
        outline-offset: 2px !important;
      }
      
      .layout-shift-fixed::before {
        content: 'FIXED' !important;
        position: absolute !important;
        top: -20px !important;
        left: 0 !important;
        background: green !important;
        color: white !important;
        padding: 2px 6px !important;
        font-size: 10px !important;
        font-weight: bold !important;
        z-index: 9999 !important;
        border-radius: 2px !important;
      }
    `;
    document.head.appendChild(style);
  };

  const identifyLayoutShiftRisks = () => {
    const risks = [];
    
    // Check for images without explicit dimensions
    document.querySelectorAll('img').forEach((img, index) => {
      if (!img.width || !img.height) {
        img.classList.add('layout-shift-debug');
        risks.push({
          type: 'Image without dimensions',
          element: img,
          selector: `img:nth-child(${index + 1})`,
          fix: 'Add width and height attributes or use aspect-ratio CSS'
        });
      }
    });
    
    // Check for containers without minimum dimensions
    document.querySelectorAll('.card, .container, .grid, .flex').forEach((container, index) => {
      const computedStyle = window.getComputedStyle(container);
      if (!computedStyle.minHeight || computedStyle.minHeight === '0px') {
        container.classList.add('layout-shift-debug');
        risks.push({
          type: 'Container without min-height',
          element: container,
          selector: `.${container.className.split(' ')[0]}:nth-child(${index + 1})`,
          fix: 'Add min-height CSS property'
        });
      }
    });
    
    // Check for dynamic content containers
    document.querySelectorAll('[data-loading], .loading, .skeleton').forEach((element, index) => {
      element.classList.add('layout-shift-debug');
      risks.push({
        type: 'Dynamic content container',
        element: element,
        selector: `[data-loading]:nth-child(${index + 1})`,
        fix: 'Use skeleton loaders with fixed dimensions'
      });
    });
    
    return risks;
  };

  const applyQuickFixes = () => {
    console.log('🔧 Applying quick layout shift fixes...');
    
    // Fix images
    document.querySelectorAll('img').forEach(img => {
      if (!img.width || !img.height) {
        img.style.aspectRatio = '16/9';
        img.style.objectFit = 'cover';
        img.classList.add('layout-shift-fixed');
        img.classList.remove('layout-shift-debug');
      }
    });
    
    // Fix containers
    document.querySelectorAll('.card, .container, .grid, .flex').forEach(container => {
      const computedStyle = window.getComputedStyle(container);
      if (!computedStyle.minHeight || computedStyle.minHeight === '0px') {
        container.style.minHeight = '200px';
        container.style.contain = 'layout style paint';
        container.classList.add('layout-shift-fixed');
        container.classList.remove('layout-shift-debug');
      }
    });
    
    // Fix dynamic content
    document.querySelectorAll('[data-loading], .loading, .skeleton').forEach(element => {
      element.style.minHeight = '100px';
      element.style.contain = 'layout style paint';
      element.classList.add('layout-shift-fixed');
      element.classList.remove('layout-shift-debug');
    });
  };

  const generateReport = () => {
    const risks = identifyLayoutShiftRisks();
    const report = {
      totalRisks: risks.length,
      risks: risks,
      recommendations: [
        'Add explicit width/height to all images',
        'Use min-height on containers',
        'Implement skeleton loaders',
        'Use CSS containment',
        'Add aspect-ratio CSS property',
        'Use fixed dimensions for dynamic content'
      ]
    };
    
    console.log('📊 Layout Shift Analysis Report:', report);
    return report;
  };

  // Initialize debug mode
  addVisualIndicators();
  
  // Return debug functions
  return {
    identifyRisks: identifyLayoutShiftRisks,
    applyFixes: applyQuickFixes,
    generateReport: generateReport,
    risks: identifyLayoutShiftRisks()
  };
};

// Enhanced layout shift monitoring with specific element tracking
export const monitorSpecificLayoutShifts = (selectors = []) => {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as any;
      
      if (layoutShift.value > 0.1) {
        console.warn(`🚨 Layout shift detected: ${layoutShift.value.toFixed(3)}`);
        
        if (layoutShift.sources && layoutShift.sources.length > 0) {
          console.warn('📍 Shift sources:');
          layoutShift.sources.forEach((source: any, index: number) => {
            const element = source.node;
            const rect = source.currentRect;
            
            console.warn(`  Source ${index + 1}:`, {
              element: element,
              tagName: element?.tagName,
              className: element?.className,
              id: element?.id,
              currentRect: rect,
              previousRect: source.previousRect,
              widthChange: rect.width - source.previousRect.width,
              heightChange: rect.height - source.previousRect.height
            });
            
            // Add visual indicator to the problematic element
            if (element) {
              element.style.outline = '3px solid red';
              element.style.outlineOffset = '2px';
              
              // Remove indicator after 3 seconds
              setTimeout(() => {
                element.style.outline = '';
                element.style.outlineOffset = '';
              }, 3000);
            }
          });
        }
        
        // Provide specific recommendations based on the shift
        if (layoutShift.value > 0.5) {
          console.warn('⚠️ Significant layout shift detected. Immediate fixes needed:');
          console.warn('  1. Check for images without dimensions');
          console.warn('  2. Verify container minimum heights');
          console.warn('  3. Review dynamic content loading');
          console.warn('  4. Ensure proper skeleton loaders');
        }
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });
  
  return observer;
};

// Export all utilities
export default {
  monitorLayoutShifts,
  withLayoutShiftPrevention,
  useLayoutShiftPrevention,
  layoutShiftStyles,
  applyLayoutShiftPrevention,
  LayoutShiftPreventionWrapper,
  SkeletonGrid,
  SkeletonList,
  debugLayoutShifts,
  // Existing components
  SkeletonBox,
  FixedAspectRatioContainer,
  PreventLayoutShiftContainer,
  FixedHeightContainer,
  FixedWidthContainer,
  SkeletonLoader,
  SkeletonCard,
  SkeletonText,
  SkeletonButton
}; 