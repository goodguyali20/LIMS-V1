import React, { useEffect, useMemo, useCallback } from 'react';

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private lastWarningTime: number = 0;
  private warningThrottleMs: number = 5000; // Only show warnings every 5 seconds

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Measure function execution time
  static measure<T extends any[], R>(
    fn: (...args: T) => R,
    operationName: string
  ): (...args: T) => R {
    return (...args: T): R => {
      const start = performance.now();
      try {
        const result = fn(...args);
        const end = performance.now();
        PerformanceOptimizer.getInstance().recordMetric(operationName, end - start);
        return result;
      } catch (error) {
        const end = performance.now();
        PerformanceOptimizer.getInstance().recordMetric(`${operationName}_error`, end - start);
        throw error;
      }
    };
  }

  // Measure async function execution time
  static async measureAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operationName: string
  ): Promise<(...args: T) => Promise<R>> {
    return async (...args: T): Promise<R> => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const end = performance.now();
        PerformanceOptimizer.getInstance().recordMetric(operationName, end - start);
        return result;
      } catch (error) {
        const end = performance.now();
        PerformanceOptimizer.getInstance().recordMetric(`${operationName}_error`, end - start);
        throw error;
      }
    };
  }

  // Record performance metric
  recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    // Keep only last 50 measurements to reduce memory usage
    if (this.metrics.get(name)!.length > 50) {
      this.metrics.get(name)!.shift();
    }

    // Log slow operations (throttled to avoid console spam)
    if (duration > 100) {
      const now = Date.now();
      if (now - this.lastWarningTime > this.warningThrottleMs) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        this.lastWarningTime = now;
      }
    }
  }

  // Get average performance for an operation
  getAveragePerformance(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  // Get performance report
  getPerformanceReport(): Record<string, number> {
    const report: Record<string, number> = {};
    for (const [name, _measurements] of this.metrics.entries()) {
      report[name] = this.getAveragePerformance(name);
    }
    return report;
  }

  // Get detailed performance statistics
  getDetailedPerformanceReport(): Record<string, {
    average: number;
    min: number;
    max: number;
    count: number;
    recent: number[];
  }> {
    const report: Record<string, any> = {};
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        report[name] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
          recent: values.slice(-10) // Last 10 measurements
        };
      }
    }
    return report;
  }

  // Check if performance is degrading
  isPerformanceDegrading(metricName: string, threshold: number = 1.5): boolean {
    const values = this.metrics.get(metricName);
    if (!values || values.length < 10) return false;
    
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    
    if (older.length === 0) return false;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return recentAvg > olderAvg * threshold;
  }

  // Monitor long tasks
  startLongTaskMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 300) { // Further increased threshold to reduce noise
          const now = Date.now();
          
          // Throttle warnings to avoid console spam
          if (now - this.lastWarningTime > this.warningThrottleMs) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
            this.lastWarningTime = now;
          }
          
          // Record metrics for analysis
          this.recordMetric('long_task', entry.duration);
          
          // Analyze the long task
          this.analyzeLongTask(entry);
          
          // If task is very long, suggest optimizations
          if (entry.duration > 400) {
            console.warn('⚠️ Very long task detected. Consider:');
            console.warn('  - Breaking up large computations');
            console.warn('  - Using Web Workers for heavy tasks');
            console.warn('  - Implementing virtualization for large lists');
            console.warn('  - Reducing animation complexity');
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', observer);
  }

  // Analyze long tasks to provide specific recommendations
  private analyzeLongTask(entry: PerformanceEntry): void {
    const duration = entry.duration;
    
    // Check if it's a rendering task
    if (entry.name === 'self' && duration > 300) {
      console.warn('🎨 Rendering optimization needed:');
      console.warn('  - Consider using React.memo for expensive components');
      console.warn('  - Implement useMemo for heavy computations');
      console.warn('  - Use React.lazy for code splitting');
      console.warn('  - Reduce the number of re-renders');
    }
    
    // Check if it's a JavaScript execution task
    if (duration > 350) {
      console.warn('⚡ JavaScript optimization needed:');
      console.warn('  - Break up large loops or computations');
      console.warn('  - Use Web Workers for CPU-intensive tasks');
      console.warn('  - Implement requestIdleCallback for non-critical work');
      console.warn('  - Consider using WebAssembly for heavy computations');
    }
  }

  // Monitor layout shifts
  startLayoutShiftMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (layoutShift.value > 0.1) { // Lowered threshold to catch more issues
          console.warn(`Layout shift detected: ${layoutShift.value.toFixed(3)}`, {
            value: layoutShift.value,
            sources: layoutShift.sources,
            startTime: layoutShift.startTime,
            hadRecentInput: layoutShift.hadRecentInput,
            lastInputTime: layoutShift.lastInputTime
          });
          
          // Record metrics for analysis
          this.recordMetric('layout_shift', layoutShift.value);
          
          // Log detailed information about the sources
          if (layoutShift.sources && layoutShift.sources.length > 0) {
            console.warn('Layout shift sources:');
            layoutShift.sources.forEach((source: any, index: number) => {
              console.warn(`  Source ${index + 1}:`, {
                node: source.node,
                currentRect: source.currentRect,
                previousRect: source.previousRect,
                nodeType: source.node?.nodeType,
                tagName: source.node?.tagName,
                className: source.node?.className,
                id: source.node?.id
              });
            });
          }
          
          // If shift is significant, suggest fixes
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
    this.observers.set('layout-shift', observer);
  }

  // Monitor first input delay
  startFirstInputMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).processingStart - (entry as any).startTime > 100) {
          console.warn(`Slow first input: ${((entry as any).processingStart - (entry as any).startTime).toFixed(2)}ms`, entry);
        }
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('first-input', observer);
  }

  // Cleanup observers
  cleanup(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }

  // Clear old metrics to prevent memory bloat
  clearOldMetrics(): void {
    const now = Date.now();
    for (const [name, values] of this.metrics.entries()) {
      // Keep only metrics from the last 5 minutes
      if (values.length > 0) {
        const recentValues = values.slice(-20); // Keep last 20 measurements
        this.metrics.set(name, recentValues);
      }
    }
  }

  // Start periodic cleanup
  startPeriodicCleanup(): void {
    setInterval(() => {
      this.clearOldMetrics();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  // Debounce function for performance
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for performance
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// React performance hooks
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  useEffect(() => {
    const endTime = performance.now();
    PerformanceOptimizer.getInstance().recordMetric(`${componentName}_render`, endTime - startTime);
  });

  useEffect(() => {
    return () => {
      PerformanceOptimizer.getInstance().recordMetric(`${componentName}_unmount`, 0);
    };
  }, []);
};

// Memoization helper with performance tracking
export const useMemoWithPerformance = <T>(
  factory: () => T,
  deps: React.DependencyList,
  operationName: string
): T => {
  return useMemo(() => {
    const start = performance.now();
    const result = factory();
    const end = performance.now();
    PerformanceOptimizer.getInstance().recordMetric(`${operationName}_memo`, end - start);
    return result;
  }, deps);
};

// Callback helper with performance tracking
export const useCallbackWithPerformance = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  operationName: string
): T => {
  return useCallback((...args: Parameters<T>) => {
    const start = performance.now();
    const result = callback(...args);
    const end = performance.now();
    PerformanceOptimizer.getInstance().recordMetric(`${operationName}_callback`, end - start);
    return result;
  }, deps) as T;
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  const optimizer = PerformanceOptimizer.getInstance();
  
  // Start monitoring
  optimizer.startLongTaskMonitoring();
  optimizer.startLayoutShiftMonitoring();
  optimizer.startFirstInputMonitoring();
  optimizer.startPeriodicCleanup();

  // Monitor React rendering performance
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('render') || args[0]?.includes?.('re-render')) {
        optimizer.recordMetric('react_render_warning', 0);
      }
      originalConsoleLog.apply(console, args);
    };
  }

  // Performance optimizations
  if (typeof window !== 'undefined') {
    // Adaptive frame rate based on device performance
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    let lastFrameTime = 0;
    const isLowEndDevice = navigator.hardwareConcurrency <= 4 || (navigator.deviceMemory || 8) <= 4;
    const targetFrameRate = isLowEndDevice ? 30 : 60; // Reduce frame rate on low-end devices
    const frameInterval = 1000 / targetFrameRate;

    window.requestAnimationFrame = (callback) => {
      const currentTime = performance.now();
      if (currentTime - lastFrameTime >= frameInterval) {
        lastFrameTime = currentTime;
        return originalRequestAnimationFrame(callback);
      } else {
        return originalRequestAnimationFrame(() => {
          setTimeout(callback, frameInterval - (currentTime - lastFrameTime));
        });
      }
    };

    // Optimize scroll events
    let scrollTimeout: NodeJS.Timeout;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      if (type === 'scroll') {
        const throttledListener = (...args: any[]) => {
          if (scrollTimeout) return;
          scrollTimeout = setTimeout(() => {
            listener.apply(this, args);
            scrollTimeout = null;
          }, isLowEndDevice ? 32 : 16); // Adaptive throttling
        };
        return originalAddEventListener.call(this, type, throttledListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Optimize resize events
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener = function(type, listener, options) {
      if (type === 'resize') {
        const debouncedListener = (...args: any[]) => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            listener.apply(this, args);
          }, 100); // Debounce resize events
        };
        return originalAddEventListener.call(this, type, debouncedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Optimize DOM queries
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;
    
    // Cache DOM queries for better performance
    const domCache = new Map();
    
    document.querySelector = function(selector) {
      if (domCache.has(selector)) {
        return domCache.get(selector);
      }
      const result = originalQuerySelector.call(this, selector);
      if (result) {
        domCache.set(selector, result);
      }
      return result;
    };
    
    document.querySelectorAll = function(selector) {
      if (domCache.has(selector)) {
        return domCache.get(selector);
      }
      const result = originalQuerySelectorAll.call(this, selector);
      if (result.length > 0) {
        domCache.set(selector, result);
      }
      return result;
    };
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    optimizer.cleanup();
  });

  return optimizer;
};

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Performance optimization utilities
export const performanceUtils = {
  // Break up long tasks using requestIdleCallback
  async breakUpTask<T>(
    task: () => T,
    chunkSize: number = 1000,
    delay: number = 1
  ): Promise<T> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const processChunk = () => {
        const currentTime = performance.now();
        
        // If we've been running too long, yield to the browser
        if (currentTime - startTime > 16) { // 16ms = 60fps
          requestIdleCallback(() => processChunk());
          return;
        }
        
        // Process the task
        const result = task();
        resolve(result);
      };
      
      requestIdleCallback(processChunk);
    });
  },

  // Break up large arrays into chunks for processing
  async processArrayInChunks<T, R>(
    array: T[],
    processor: (item: T, index: number) => R,
    chunkSize: number = 100
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      
      // Process chunk
      const chunkResults = chunk.map((item, index) => 
        processor(item, i + index)
      );
      results.push(...chunkResults);
      
      // Yield to browser if chunk is large
      if (chunk.length > 50) {
        await new Promise(resolve => requestIdleCallback(resolve));
      }
    }
    
    return results;
  },

  // Optimize heavy computations
  optimizeComputation<T>(
    computation: () => T,
    options: {
      maxDuration?: number;
      useWorker?: boolean;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<T> {
    const { maxDuration = 16, priority = 'normal' } = options;
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const execute = () => {
        const currentTime = performance.now();
        
        if (currentTime - startTime > maxDuration) {
          // Yield to browser
          const callback = priority === 'high' ? 
            requestAnimationFrame : 
            requestIdleCallback;
          callback(execute);
          return;
        }
        
        const result = computation();
        resolve(result);
      };
      
      execute();
    });
  },

  // Optimize list rendering with virtualization hints
  optimizeListRendering<T>(
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode,
    options: {
      itemHeight?: number;
      containerHeight?: number;
      overscan?: number;
    } = {}
  ) {
    const { itemHeight = 50, containerHeight = 400, overscan = 5 } = options;
    
    // If list is small, render normally
    if (items.length < 100) {
      return items.map(renderItem);
    }
    
    // For large lists, suggest virtualization
    console.warn('⚠️ Large list detected. Consider using react-window or react-virtualized for better performance.');
    
    return items.map(renderItem);
  },

  // Optimize animations
  optimizeAnimation(animation: any) {
    return {
      ...animation,
      // Use transform instead of changing layout properties
      transform: animation.transform || 'translateZ(0)', // Force hardware acceleration
      willChange: 'transform', // Hint to browser about animation
    };
  },

  // Debounce expensive operations
  debounceExpensive<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 100
  ): (...args: Parameters<T>) => void {
    return PerformanceOptimizer.debounce(func, wait);
  },

  // Throttle frequent operations
  throttleFrequent<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 16
  ): (...args: Parameters<T>) => void {
    return PerformanceOptimizer.throttle(func, limit);
  }
}; 