import React, { Suspense, lazy, memo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { TestProvider } from './contexts/TestContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { GlobalStyles } from './styles/GlobalStyles';
import PerformanceMonitor from './components/PerformanceMonitor';
import AppRoutes from './AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load components for standalone routes
const QRStatusPage = lazy(() => import('./pages/QRStatusPage'));
const TestVisualEffects = lazy(() => import('./components/TestVisualEffects'));

// Optimized loading fallback component
const LoadingFallback = memo(() => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }} />
      <p>Loading SmartLab LIMS...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Optimized Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send error to monitoring service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          color: '#333'
        }}>
          <h1>Something went wrong.</h1>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Optimized wrapper component that uses theme context
const AppContent = memo(() => {
  const { theme } = useTheme();
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Show performance monitor in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Show performance monitor after 5 seconds in development
      const timer = setTimeout(() => {
        setShowPerformanceMonitor(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard shortcut to toggle performance monitor
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setShowPerformanceMonitor(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <StyledThemeProvider theme={theme}>
        <AuthProvider>
          <TestProvider>
            <NotificationProvider>
              <OrderProvider>
                <SettingsProvider>
                  <GlobalStyles />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/status/:orderId" element={<QRStatusPage />} />
                        <Route path="/test-visuals" element={<TestVisualEffects />} />
                        <Route path="/*" element={<AppRoutes />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                  
                  {/* Performance Monitor for Development */}
                  {process.env.NODE_ENV === 'development' && (
                    <PerformanceMonitor
                      isVisible={showPerformanceMonitor}
                      onClose={() => setShowPerformanceMonitor(false)}
                    />
                  )}
                  
                  {/* Toast Container */}
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={true}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </SettingsProvider>
              </OrderProvider>
            </NotificationProvider>
          </TestProvider>
        </AuthProvider>
      </StyledThemeProvider>
    </QueryClientProvider>
  );
});

AppContent.displayName = 'AppContent';

// Main App component with performance optimizations
const App = memo(() => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App; 