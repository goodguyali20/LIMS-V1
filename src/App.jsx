import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TestProvider } from './contexts/TestContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OrderProvider } from './contexts/OrderContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import { GlobalStyles } from './styles/GlobalStyles';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TestProvider>
            <NotificationProvider>
              <OrderProvider>
                <SettingsProvider>
                  <Router>
                    <ErrorBoundary>
                      <GlobalStyles />
                      <AppRoutes />
                      <Toaster 
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      />
                    </ErrorBoundary>
                  </Router>
                </SettingsProvider>
              </OrderProvider>
            </NotificationProvider>
          </TestProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;