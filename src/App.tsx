import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { TestProvider } from './contexts/TestContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { GlobalStyles } from './styles/GlobalStyles';

// Lazy load components for better performance
const ManagerDashboard = lazy(() => import('./pages/Dashboard/ManagerDashboard'));
const PrintOrder = lazy(() => import('./pages/PrintOrder'));
const Orders = lazy(() => import('./pages/Orders'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const General = lazy(() => import('./pages/Settings/General'));
const Tests = lazy(() => import('./pages/Settings/Tests'));
const Users = lazy(() => import('./pages/Settings/Users'));
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const Layout = lazy(() => import('./components/Layout/Layout'));
const AuthRequired = lazy(() => import('./components/Auth/AuthRequired'));
const PatientRegistration = lazy(() => import('./pages/PatientRegistration/PatientRegistration'));
const PatientHistory = lazy(() => import('./pages/PatientHistory/PatientHistory'));
const WorkQueue = lazy(() => import('./pages/WorkQueue/WorkQueue'));
const QualityControl = lazy(() => import('./pages/QualityControl/QualityControl'));
const Inventory = lazy(() => import('./pages/Inventory/Inventory'));
const WorkloadView = lazy(() => import('./pages/Workload/WorkloadView'));
const AuditLog = lazy(() => import('./pages/AuditLog/AuditLog'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const OrderView = lazy(() => import('./pages/OrderView/OrderView'));
const ResultEntry = lazy(() => import('./pages/ResultEntry/ResultEntry'));
const Phlebotomist = lazy(() => import('./pages/Phlebotomist/Phlebotomist'));
const QRStatusPage = lazy(() => import('./pages/QRStatusPage'));
const TestVisualEffects = lazy(() => import('./components/TestVisualEffects'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
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
          gap: '1rem'
        }}>
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that uses theme context
const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <StyledThemeProvider theme={theme}>
      <AuthProvider>
        <OrderProvider>
          <TestProvider>
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
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/status/:orderId" element={<QRStatusPage />} />
                    <Route path="/test-visuals" element={<TestVisualEffects />} />
                    <Route
                      path="/app"
                      element={
                        <AuthRequired>
                          <Layout />
                        </AuthRequired>
                      }
                    >
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<ManagerDashboard />} />
                      <Route path="add-order" element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="print-order/:orderId" element={<PrintOrder />} />
                      <Route path="register" element={<PatientRegistration />} />
                      <Route path="patient-history" element={<PatientHistory />} />
                      <Route path="work-queue" element={<WorkQueue />} />
                      <Route path="phlebotomist" element={<Phlebotomist />} />
                      <Route path="quality-control" element={<QualityControl />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="workload" element={<WorkloadView />} />
                      <Route path="audit-log" element={<AuditLog />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="order/:orderId" element={<OrderView />} />
                      <Route path="order/:orderId/enter-results" element={<ResultEntry />} />
                      <Route path="settings" element={<Settings />}>
                        <Route index element={<Navigate to="general" replace />} />
                        <Route path="general" element={<General />} />
                        <Route path="tests" element={<Tests />} />
                        <Route path="users" element={<Users />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/app" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </SettingsProvider>
          </TestProvider>
        </OrderProvider>
      </AuthProvider>
    </StyledThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 