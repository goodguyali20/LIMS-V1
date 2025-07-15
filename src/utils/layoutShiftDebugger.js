/**
 * Layout Shift Debugger
 * Utility to identify and fix layout shifts in the LIMS application
 */

// Enhanced layout shift monitoring with detailed analysis
export const debugLayoutShifts = () => {
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  let totalLayoutShift = 0;
  let shiftCount = 0;
  const shiftSources = new Map();

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry;
      
      if (layoutShift.value > 0.1) {
        totalLayoutShift += layoutShift.value;
        shiftCount++;
        
        console.group(`🚨 Layout Shift #${shiftCount} (${layoutShift.value.toFixed(3)})`);
        console.log('Total CLS so far:', totalLayoutShift.toFixed(3));
        console.log('Timestamp:', new Date(layoutShift.startTime).toISOString());
        console.log('Had recent input:', layoutShift.hadRecentInput);
        
        if (layoutShift.sources && layoutShift.sources.length > 0) {
          console.log('Sources:', layoutShift.sources.length);
          
          layoutShift.sources.forEach((source, index) => {
            const element = source.node;
            if (element) {
              const elementInfo = {
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                currentRect: source.currentRect,
                previousRect: source.previousRect,
                widthChange: source.currentRect.width - source.previousRect.width,
                heightChange: source.currentRect.height - source.previousRect.height,
                computedStyle: window.getComputedStyle(element)
              };
              
              // Track sources for analysis
              const key = `${element.tagName}.${element.className || 'no-class'}`;
              if (!shiftSources.has(key)) {
                shiftSources.set(key, []);
              }
              shiftSources.get(key).push(elementInfo);
              
              console.group(`Source ${index + 1}: ${element.tagName}${element.className ? '.' + element.className : ''}`);
              console.log('Element:', element);
              console.log('Width change:', elementInfo.widthChange.toFixed(2) + 'px');
              console.log('Height change:', elementInfo.heightChange.toFixed(2) + 'px');
              console.log('Current rect:', elementInfo.currentRect);
              console.log('Previous rect:', elementInfo.previousRect);
              console.log('Computed styles:', {
                width: elementInfo.computedStyle.width,
                height: elementInfo.computedStyle.height,
                minWidth: elementInfo.computedStyle.minWidth,
                minHeight: elementInfo.computedStyle.minHeight,
                contain: elementInfo.computedStyle.contain,
                display: elementInfo.computedStyle.display,
                position: elementInfo.computedStyle.position
              });
              console.groupEnd();
            }
          });
        }
        
        // Suggest fixes based on the shift
        suggestFixes(layoutShift);
        console.groupEnd();
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });

  // Return cleanup function
  return () => {
    observer.disconnect();
    console.log('📊 Layout Shift Analysis Summary:');
    console.log('Total shifts:', shiftCount);
    console.log('Total CLS:', totalLayoutShift.toFixed(3));
    console.log('Average shift:', (totalLayoutShift / shiftCount).toFixed(3));
    
    // Show most common sources
    const sortedSources = Array.from(shiftSources.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    
    if (sortedSources.length > 0) {
      console.log('Most common sources:');
      sortedSources.forEach(([key, shifts]) => {
        console.log(`  ${key}: ${shifts.length} shifts`);
      });
    }
  };
};

// Suggest specific fixes based on layout shift analysis
const suggestFixes = (layoutShift) => {
  const suggestions = [];
  
  if (layoutShift.value > 0.5) {
    suggestions.push('⚠️ Significant layout shift detected!');
  }
  
  if (layoutShift.sources) {
    layoutShift.sources.forEach(source => {
      const element = source.node;
      if (element) {
        const widthChange = source.currentRect.width - source.previousRect.width;
        const heightChange = source.currentRect.height - source.previousRect.height;
        
        // Image-related fixes
        if (element.tagName === 'IMG') {
          suggestions.push('🖼️ Add explicit width and height attributes to images');
          suggestions.push('🖼️ Use aspect-ratio CSS property');
          suggestions.push('🖼️ Consider using next/image or similar optimized image component');
        }
        
        // Container-related fixes
        if (Math.abs(heightChange) > 50) {
          suggestions.push('📦 Add min-height to containers');
          suggestions.push('📦 Use skeleton loaders for dynamic content');
        }
        
        if (Math.abs(widthChange) > 50) {
          suggestions.push('📦 Add min-width to containers');
          suggestions.push('📦 Use CSS Grid with fixed column widths');
        }
        
        // Text-related fixes
        if (element.tagName === 'DIV' && element.textContent) {
          suggestions.push('📝 Add min-height to text containers');
          suggestions.push('📝 Use CSS containment for text areas');
        }
        
        // Button-related fixes
        if (element.tagName === 'BUTTON') {
          suggestions.push('🔘 Add min-width and min-height to buttons');
        }
      }
    });
  }
  
  if (suggestions.length > 0) {
    console.log('💡 Suggested fixes:');
    suggestions.forEach(suggestion => console.log('  ' + suggestion));
  }
};

// Utility to apply quick fixes to common layout shift sources
export const applyQuickFixes = () => {
  console.log('🔧 Applying quick layout shift fixes...');
  
  // Fix images without dimensions
  const images = document.querySelectorAll('img:not([width]):not([height])');
  images.forEach(img => {
    if (!img.style.aspectRatio) {
      img.style.aspectRatio = '16/9';
      img.style.contain = 'layout style paint';
      console.log('✅ Fixed image:', img.src);
    }
  });
  
  // Fix containers without minimum dimensions
  const containers = document.querySelectorAll('.container, .card, .panel, .section');
  containers.forEach(container => {
    if (!container.style.minHeight) {
      container.style.minHeight = '200px';
      container.style.contain = 'layout style paint';
      console.log('✅ Fixed container:', container.className);
    }
  });
  
  // Fix buttons without minimum dimensions
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.style.minWidth) {
      button.style.minWidth = '80px';
      button.style.minHeight = '36px';
      button.style.contain = 'layout style paint';
      console.log('✅ Fixed button:', button.textContent);
    }
  });
  
  // Fix text containers
  const textContainers = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
  textContainers.forEach(text => {
    if (!text.style.minHeight) {
      text.style.minHeight = '1.2em';
      text.style.contain = 'layout style paint';
    }
  });
  
  console.log('✅ Quick fixes applied!');
};

// Monitor specific elements for layout shifts
export const monitorElement = (selector, options = {}) => {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
    return;
  }
  
  const { minHeight, minWidth, contain = 'layout style paint' } = options;
  
  // Apply prevention styles
  if (minHeight) element.style.minHeight = minHeight;
  if (minWidth) element.style.minWidth = minWidth;
  element.style.contain = contain;
  
  // Monitor for changes
  const observer = new ResizeObserver((entries) => {
    entries.forEach(entry => {
      console.log(`📏 Element ${selector} resized:`, {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
        timestamp: Date.now()
      });
    });
  });
  
  observer.observe(element);
  
  console.log(`👀 Monitoring element: ${selector}`);
  return observer;
};

// Create a visual overlay to highlight layout shifts
export const createVisualOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'layout-shift-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
    background: rgba(255, 0, 0, 0.1);
    border: 2px solid red;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(overlay);
  
  // Show overlay on layout shifts
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.value > 0.1) {
        overlay.style.opacity = '1';
        setTimeout(() => {
          overlay.style.opacity = '0';
        }, 1000);
      }
    }
  });
  
  observer.observe({ entryTypes: ['layout-shift'] });
  
  console.log('🎨 Visual overlay created - red flash indicates layout shifts');
  return overlay;
};

// Export utilities
export default {
  debugLayoutShifts,
  applyQuickFixes,
  monitorElement,
  createVisualOverlay
}; 