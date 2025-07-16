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
  static measure<T extends unknown[], R>(
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
  static async measureAsync<T extends unknown[], R>(
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
      const currentTime = Date.now();
      if (currentTime - this.lastWarningTime > this.warningThrottleMs) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        this.lastWarningTime = currentTime;
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
          const currentTime = Date.now();
          
          // Throttle warnings to avoid console spam
          if (currentTime - this.lastWarningTime > this.warningThrottleMs) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
            this.lastWarningTime = currentTime;
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
              if (source && source.nodeType === 1) {
                // DOM element
                const rect = source.getBoundingClientRect ? source.getBoundingClientRect() : {};
                console.warn(`  Source ${index + 1}: <${source.tagName.toLowerCase()} id='${source.id}' class='${source.className}'>`, rect);
              } else {
                console.warn(`  Source ${index + 1}:`, source);
              }
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
  startFirstInputDelayMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInput = entry as any;
        if (firstInput.processingStart && firstInput.startTime) {
          const delay = firstInput.processingStart - firstInput.startTime;
          
          if (delay > 100) {
            console.warn(`First input delay: ${delay.toFixed(2)}ms`, {
              name: firstInput.name,
              startTime: firstInput.startTime,
              processingStart: firstInput.processingStart,
              processingEnd: firstInput.processingEnd,
              duration: firstInput.duration
            });
            
            this.recordMetric('first_input_delay', delay);
            
            if (delay > 300) {
              console.warn('⚠️ High first input delay detected. Consider:');
              console.warn('  - Reducing JavaScript bundle size');
              console.warn('  - Implementing code splitting');
              console.warn('  - Optimizing critical rendering path');
              console.warn('  - Using preload for critical resources');
            }
          }
        }
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('first-input', observer);
  }

  // Enhanced memory monitoring with optimization suggestions
  startMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      this.recordMetric('memory_used_mb', usedMB);
      this.recordMetric('memory_total_mb', totalMB);
      
      const usagePercentage = (usedMB / limitMB) * 100;
      
      if (usagePercentage > 80) {
        console.warn(`⚠️ High memory usage: ${usagePercentage.toFixed(1)}% (${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB)`);
        console.warn('  - Check for memory leaks');
        console.warn('  - Implement proper cleanup in useEffect hooks');
        console.warn('  - Consider using React.memo for expensive components');
        console.warn('  - Review large data structures');
        console.warn('  - Implement virtual scrolling for large lists');
        console.warn('  - Use lazy loading for images and components');
      }
      
      // Track memory trends
      if (this.metrics.has('memory_used_mb')) {
        const recentMemory = this.metrics.get('memory_used_mb')!.slice(-10);
        const memoryGrowth = recentMemory[recentMemory.length - 1] - recentMemory[0];
        
        if (memoryGrowth > 50) { // 50MB growth in last 10 measurements
          console.warn(`⚠️ Memory growth detected: +${memoryGrowth.toFixed(1)}MB in recent measurements`);
          console.warn('  - Potential memory leak detected');
          console.warn('  - Check for uncleaned event listeners');
          console.warn('  - Review component unmounting');
        }
      }
    };

    // Check memory every 30 seconds
    const memoryInterval = setInterval(checkMemory, 30000);
    
    // Store interval for cleanup
    this.observers.set('memory_interval', { disconnect: () => clearInterval(memoryInterval) } as any);
  }

  // Monitor slow operations
  startSlowOperationMonitoring(): void {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    
    let operationCount = 0;
    const slowOperations = new Map();
    
    // Monitor setTimeout
    window.setTimeout = function(callback, delay, ...args) {
      const startTime = performance.now();
      const id = originalSetTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 100) {
          console.warn(`🐌 Slow setTimeout operation: ${duration.toFixed(2)}ms`, {
            delay,
            duration,
            timestamp: new Date().toISOString()
          });
        }
        
        callback(...args);
      }, delay, ...args);
      
      return id;
    };
    
    // Monitor setInterval
    window.setInterval = function(callback, delay, ...args) {
      const startTime = performance.now();
      const id = originalSetInterval(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 100) {
          console.warn(`🐌 Slow setInterval operation: ${duration.toFixed(2)}ms`, {
            delay,
            duration,
            timestamp: new Date().toISOString()
          });
        }
        
        callback(...args);
      }, delay, ...args);
      
      return id;
    };
    
    // Monitor requestAnimationFrame
    window.requestAnimationFrame = function(callback) {
      const startTime = performance.now();
      const id = originalRequestAnimationFrame(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 16) { // Should be ~16ms for 60fps
          console.warn(`🐌 Slow animation frame: ${duration.toFixed(2)}ms`, {
            duration,
            timestamp: new Date().toISOString()
          });
        }
        
        callback(endTime);
      });
      
      return id;
    };
    
    // Store original functions for cleanup
    this.observers.set('slow_operation_monitoring', {
      disconnect: () => {
        window.setTimeout = originalSetTimeout;
        window.setInterval = originalSetInterval;
        window.requestAnimationFrame = originalRequestAnimationFrame;
      }
    } as any);
  }

  // Monitor component render performance
  startComponentPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && window.React) {
      const originalCreateElement = window.React.createElement;
      
      window.React.createElement = function(type, props, ...children) {
        const startTime = performance.now();
        const element = originalCreateElement(type, props, ...children);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 10) {
          console.warn(`🐌 Slow component creation: ${duration.toFixed(2)}ms`, {
            type: typeof type === 'string' ? type : type?.displayName || type?.name || 'Unknown',
            props: props ? Object.keys(props) : [],
            duration,
            timestamp: new Date().toISOString()
          });
        }
        
        return element;
      };
      
      this.observers.set('component_monitoring', {
        disconnect: () => {
          window.React.createElement = originalCreateElement;
        }
      } as any);
    }
  }

  // Optimize large data operations
  optimizeDataOperations<T>(
    data: T[],
    operation: (item: T, index: number) => any,
    options: {
      chunkSize?: number;
      delay?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<any[]> {
    const { chunkSize = 100, delay = 0, onProgress } = options;
    const results: any[] = [];
    const totalChunks = Math.ceil(data.length / chunkSize);
    
    return new Promise((resolve) => {
      let currentChunk = 0;
      
      const processChunk = () => {
        const startIndex = currentChunk * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, data.length);
        
        for (let i = startIndex; i < endIndex; i++) {
          results.push(operation(data[i], i));
        }
        
        currentChunk++;
        
        if (onProgress) {
          onProgress((currentChunk / totalChunks) * 100);
        }
        
        if (currentChunk < totalChunks) {
          setTimeout(processChunk, delay);
        } else {
          resolve(results);
        }
      };
      
      processChunk();
    });
  }

  // Debounce expensive operations
  debounceExpensive<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number = 100,
    options: {
      leading?: boolean;
      trailing?: boolean;
      maxWait?: number;
    } = {}
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    let lastCallTime = 0;
    const { leading = false, trailing = true, maxWait } = options;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      if (leading && !timeout) {
        func(...args);
        lastCallTime = now;
      }
      
      if (timeout) {
        clearTimeout(timeout);
      }
      
      if (maxWait && timeSinceLastCall >= maxWait) {
        if (trailing) {
          func(...args);
        }
        lastCallTime = now;
      } else {
        timeout = setTimeout(() => {
          if (trailing) {
            func(...args);
          }
          timeout = null;
          lastCallTime = Date.now();
        }, wait);
      }
    };
  }

  // Throttle frequent operations
  throttleFrequent<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number = 16
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        lastRan = Date.now();
        inThrottle = true;
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  // Monitor network requests
  startNetworkMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const networkEntry = entry as any;
        
        if (networkEntry.duration > 5000) { // 5 seconds
          console.warn(`🌐 Slow network request: ${networkEntry.duration.toFixed(2)}ms`, {
            name: networkEntry.name,
            duration: networkEntry.duration,
            transferSize: networkEntry.transferSize,
            decodedBodySize: networkEntry.decodedBodySize,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('network', observer);
  }

  // Get performance recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check memory usage
    if (this.metrics.has('memory_used_mb')) {
      const recentMemory = this.metrics.get('memory_used_mb')!.slice(-5);
      const avgMemory = recentMemory.reduce((a, b) => a + b, 0) / recentMemory.length;
      
      if (avgMemory > 100) {
        recommendations.push('🔧 High memory usage detected - consider implementing virtual scrolling');
        recommendations.push('🔧 Review component lifecycle and cleanup');
        recommendations.push('🔧 Use React.memo for expensive components');
      }
    }
    
    // Check layout shifts
    if (this.metrics.has('layout_shift')) {
      const recentShifts = this.metrics.get('layout_shift')!.slice(-10);
      const totalCLS = recentShifts.reduce((a, b) => a + b, 0);
      
      if (totalCLS > 0.1) {
        recommendations.push('🔧 High layout shift detected - add explicit dimensions to elements');
        recommendations.push('🔧 Use skeleton loaders for dynamic content');
        recommendations.push('🔧 Implement CSS containment');
      }
    }
    
    // Check first input delay
    if (this.metrics.has('first_input_delay')) {
      const recentDelays = this.metrics.get('first_input_delay')!.slice(-5);
      const avgDelay = recentDelays.reduce((a, b) => a + b, 0) / recentDelays.length;
      
      if (avgDelay > 100) {
        recommendations.push('🔧 High first input delay - optimize JavaScript bundle');
        recommendations.push('🔧 Implement code splitting');
        recommendations.push('🔧 Use web workers for heavy computations');
      }
    }
    
    return recommendations;
  }

  // Generate performance report
  generatePerformanceReport(): {
    summary: Record<string, number>;
    recommendations: string[];
    details: Record<string, any>;
  } {
    const report = {
      summary: this.getPerformanceReport(),
      recommendations: this.getPerformanceRecommendations(),
      details: this.getDetailedPerformanceReport()
    };
    
    console.log('📊 Performance Report:', report);
    return report;
  }

  // Cleanup all observers
  cleanup(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }

  // Clear old metrics to prevent memory bloat
  clearOldMetrics(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [name, values] of this.metrics.entries()) {
      // Keep only recent metrics
      if (values.length > 100) {
        this.metrics.set(name, values.slice(-50));
      }
    }
  }

  // Start periodic cleanup
  startPeriodicCleanup(): void {
    setInterval(() => this.clearOldMetrics(), 60 * 60 * 1000); // Every hour
  }

  // Debounce function calls
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function calls
  static throttle<T extends (...args: unknown[]) => unknown>(
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

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        console.warn(`Slow component unmount: ${componentName} took ${duration.toFixed(2)}ms`);
      }
      
      PerformanceOptimizer.getInstance().recordMetric(`${componentName}_unmount`, duration);
    };
  }, [componentName]);
};

// Enhanced useMemo with performance tracking
export const useMemoWithPerformance = <T>(
  factory: () => T,
  deps: React.DependencyList,
  operationName: string
): T => {
  const result = useMemo(() => {
    const start = performance.now();
    const value = factory();
    const end = performance.now();
    
    PerformanceOptimizer.getInstance().recordMetric(`${operationName}_memo`, end - start);
    return value;
  }, deps);
  
  return result;
};

// Enhanced useCallback with performance tracking
export const useCallbackWithPerformance = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList,
  operationName: string
): T => {
  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    const start = performance.now();
    const result = callback(...args);
    const end = performance.now();
    
    PerformanceOptimizer.getInstance().recordMetric(`${operationName}_callback`, end - start);
    return result;
  }, deps) as T;
  
  return memoizedCallback;
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  const optimizer = PerformanceOptimizer.getInstance();
  
  // Start monitoring
  optimizer.startLongTaskMonitoring();
  optimizer.startLayoutShiftMonitoring();
  optimizer.startFirstInputDelayMonitoring();
  optimizer.startMemoryMonitoring();
  optimizer.startPeriodicCleanup();
  
  // Monitor scroll performance
  let scrollTimeout: NodeJS.Timeout | null = null;
  const originalAddEventListener = window.addEventListener;
  
  window.addEventListener = function(type: string, listener: EventListener, options?: AddEventListenerOptions) {
    if (type === 'scroll') {
      const throttledListener = (...args: unknown[]) => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
          listener.apply(this, args);
          scrollTimeout = null;
        }, 16); // ~60fps
      };
      
      return originalAddEventListener.call(this, type, throttledListener as EventListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Monitor resize performance
  let resizeTimeout: NodeJS.Timeout | null = null;
  
  window.addEventListener = function(type: string, listener: EventListener, options?: AddEventListenerOptions) {
    if (type === 'resize') {
      const debouncedListener = (...args: unknown[]) => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
          listener.apply(this, args);
        }, 250);
      };
      
      return originalAddEventListener.call(this, type, debouncedListener as EventListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Monitor DOM query performance
  const originalQuerySelector = document.querySelector;
  const originalQuerySelectorAll = document.querySelectorAll;
  
  document.querySelector = function(selector: string) {
    const start = performance.now();
    const result = originalQuerySelector.call(this, selector);
    const end = performance.now();
    
    if (end - start > 10) {
      console.warn(`Slow querySelector: ${selector} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
  
  document.querySelectorAll = function(selector: string) {
    const start = performance.now();
    const result = originalQuerySelectorAll.call(this, selector);
    const end = performance.now();
    
    if (end - start > 10) {
      console.warn(`Slow querySelectorAll: ${selector} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
  
  console.log('🚀 Performance monitoring initialized');
};

// Utility for breaking up large tasks
export class TaskScheduler {
  async breakUpTask<T>(
    task: () => T,
    _chunkSize: number = 1000,
    _delay: number = 1
  ): Promise<T> {
    return new Promise((resolve) => {
      const execute = () => {
        try {
          const result = task();
          resolve(result);
        } catch (error) {
          console.error('Task execution failed:', error);
          resolve(null as T);
        }
      };
      
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(execute);
      } else {
        setTimeout(execute, 0);
      }
    });
  }

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
      
      // Yield control if not the last chunk
      if (i + chunkSize < array.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return results;
  }

  optimizeComputation<T>(
    computation: () => T,
    options: {
      maxDuration?: number;
      useWorker?: boolean;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<T> {
    return new Promise((resolve) => {
      const execute = () => {
        const start = performance.now();
        const result = computation();
        const duration = performance.now() - start;
        
        if (duration > (options.maxDuration || 16)) {
          console.warn(`Computation took ${duration.toFixed(2)}ms, consider optimization`);
        }
        
        resolve(result);
      };
      
      if (options.priority === 'low' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(execute);
      } else {
        setTimeout(execute, 0);
      }
    });
  }

  optimizeListRendering<T>(
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode,
    _options: {
      itemHeight?: number;
      containerHeight?: number;
      overscan?: number;
    } = {}
  ) {
    // This would implement virtualization
    // For now, return the items as-is
    return items.map((item, index) => renderItem(item, index));
  }

  optimizeAnimation(_animation: unknown) {
    // Animation optimization logic would go here
    console.log('Animation optimization not implemented');
  }

  debounceExpensive<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number = 100
  ): (...args: Parameters<T>) => void {
    return PerformanceOptimizer.debounce(func, wait);
  }

  throttleFrequent<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number = 16
  ): (...args: Parameters<T>) => void {
    return PerformanceOptimizer.throttle(func, limit);
  }
}

// Export utilities
export const performanceUtils = {
  PerformanceOptimizer: PerformanceOptimizer.getInstance(),
  TaskScheduler: new TaskScheduler(),
  usePerformanceMonitor,
  useMemoWithPerformance,
  useCallbackWithPerformance,
  initializePerformanceMonitoring,
}; 

export const performanceOptimizer = PerformanceOptimizer.getInstance(); 