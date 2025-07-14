import React from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry with proper configuration
export const initializeErrorMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.MODE,
      integrations: [
        new BrowserTracing({
          // Properly configure routing instrumentation
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            (useEffect: any) => useEffect,
            (useLocation: any) => useLocation,
            (useNavigationType: any) => useNavigationType,
            (createRoutesFromChildren: any) => createRoutesFromChildren,
            (matchRoutes: any) => matchRoutes
          ),
        }),
      ],
      tracesSampleRate: 0.2,
      beforeSend(event) {
        // Sanitize sensitive data
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
        }
        return event;
      },
    });
  }
};

// Custom error class for better error handling
export class SmartLabError extends Error {
  public readonly code: string;
  public readonly context: Record<string, any>;

  constructor(message: string, code: string, context: Record<string, any> = {}) {
    super(message);
    this.name = 'SmartLabError';
    this.code = code;
    this.context = context;
  }
}

// Enhanced error tracking
export const trackError = (
  error: Error | SmartLabError,
  context?: Record<string, any>
) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        errorType: error instanceof SmartLabError ? error.code : 'UNKNOWN_ERROR',
      },
    });
  } else {
    console.error('Error tracked:', error, context);
  }
};

// Enhanced event tracking
export const trackEvent = (
  eventName: string,
  data?: Record<string, any>
) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'user_action',
      message: eventName,
      data,
      level: 'info',
    });
  } else {
    console.log('Event tracked:', eventName, data);
  }
};

// Performance monitoring
export const trackPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${operation} took ${duration}ms`,
      data: metadata,
      level: 'info',
    });
  } else {
    console.log(`Performance: ${operation} took ${duration}ms`, metadata);
  }
};

// Global error handler
export const setupGlobalErrorHandling = () => {
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), {
      type: 'unhandledrejection',
    });
  });
};

// Form validation error handling
export const handleValidationError = (
  field: string,
  message: string,
  value?: any
) => {
  const error = new SmartLabError(
    `Validation error in ${field}: ${message}`,
    'VALIDATION_ERROR',
    { field, value }
  );
  
  trackError(error, { field, value });
  return error;
};

// API error handling
export const handleApiError = (
  error: any,
  endpoint: string,
  method: string
) => {
  const apiError = new SmartLabError(
    `API error: ${error.message}`,
    'API_ERROR',
    { endpoint, method, status: error.status }
  );
  
  trackError(apiError, { endpoint, method });
  return apiError;
};

// Database error handling
export const handleDatabaseError = (
  error: any,
  operation: string,
  collection?: string
) => {
  const dbError = new SmartLabError(
    `Database error: ${error.message}`,
    'DATABASE_ERROR',
    { operation, collection }
  );
  
  trackError(dbError, { operation, collection });
  return dbError;
};

// Firebase error handling
export const handleFirebaseError = (
  error: any,
  operation: string,
  collection?: string,
  documentId?: string
) => {
  const firebaseError = new SmartLabError(
    `Firebase error: ${error.message}`,
    'FIREBASE_ERROR',
    {
      operation,
      collection,
      documentId,
      firebaseCode: error.code,
    }
  );
  
  trackError(firebaseError, { operation, collection, documentId });
  return firebaseError;
};

// Network error handling
export const handleNetworkError = (
  error: any,
  url: string,
  method: string
) => {
  const networkError = new SmartLabError(
    `Network error: ${error.message}`,
    'NETWORK_ERROR',
    { url, method }
  );
  
  trackError(networkError, { url, method });
  return networkError;
};

// Authentication error handling
export const handleAuthError = (
  error: any,
  operation: string
) => {
  const authError = new SmartLabError(
    `Authentication error: ${error.message}`,
    'AUTH_ERROR',
    { operation, code: error.code }
  );
  
  trackError(authError, { operation });
  return authError;
};

// Enhanced error boundary component
export const createErrorBoundary = (fallback?: React.ComponentType<{ error: Error }>) => {
  return Sentry.withErrorBoundary(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    {
      fallback: fallback || (({ error: _error }: { error: Error }) => (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )),
      beforeCapture: (scope) => {
        scope.setTag('location', window.location.href);
        scope.setContext('characteristics', {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
        });
      },
    }
  );
};

// Performance measurement utility
export const measurePerformance = <T extends any[], R>(
  fn: (...args: T) => R,
  operationName: string
) => {
  return (...args: T): R => {
    const start = performance.now();
    try {
      const result = fn(...args);
      const end = performance.now();
      trackPerformance(operationName, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      trackPerformance(operationName, end - start, { error: true });
      throw error;
    }
  };
};

// Async performance measurement
export const measureAsyncPerformance = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      trackPerformance(operationName, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      trackPerformance(operationName, end - start, { error: true });
      throw error;
    }
  };
};

// Enhanced error reporting with user context
export const reportError = (
  error: Error,
  userContext?: {
    userId?: string;
    userRole?: string;
    userEmail?: string;
  },
  additionalContext?: Record<string, any>
) => {
  if (import.meta.env.DEV) {
    console.error('Error:', error);
    console.error('Context:', userContext);
    console.error('Additional Context:', additionalContext);
    console.error('Stack:', error.stack);
  }

  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (userContext?.userId) {
        scope.setUser({
          id: userContext.userId,
          email: userContext.userEmail,
          role: userContext.userRole,
        });
      }
      
      if (additionalContext) {
        scope.setContext('additional', additionalContext);
      }
      
      scope.setTag('errorSource', 'manual_report');
      Sentry.captureException(error);
    });
  }
};

// Export error types for use in other modules
// Remove duplicate export 