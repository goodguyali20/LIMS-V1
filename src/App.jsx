import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

// Contexts and Styles
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';

// Page Components
import LoginPage from './pages/Login/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import PatientRegistration from './pages/PatientRegistration/PatientRegistration';
import AuditLog from './pages/Auditlog/AuditLog';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import PatientHistory from './pages/PatientHistory/PatientHistory';
import WorkQueue from './pages/WorkQueue/WorkQueue';
import OrderView from './pages/OrderView/OrderView';
import WorkloadView from './pages/Workload/WorkloadView';
import ResultEntry from './pages/ResultEntry/ResultEntry';
import Inventory from './pages/Inventory/Inventory';
import LotManager from './pages/LotManager/LotManager'; // <-- 1. IMPORT THE NEW PAGE
import NotFound from './pages/NotFound/NotFound';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// A wrapper to combine context providers
const AppProviders = ({ children }) => {
  const { theme, themeName } = useTheme();
  const { i18n } = useTranslation();
  
  React.useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n.dir()]);

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.dir() === 'rtl'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={themeName}
      />
      {children}
    </StyledThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProviders>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* All pages inside the main dashboard layout */}
                <Route index element={<ManagerDashboard />} />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="register" element={<PatientRegistration />} />
                <Route path="work-queue" element={<WorkQueue />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/:itemId" element={<LotManager />} /> {/* <-- 2. ADD THE NEW ROUTE */}
                <Route path="order/:orderId" element={<OrderView />} />
                <Route path="order/:orderId/enter-results" element={<ResultEntry />} />
                <Route path="patient/:patientId" element={<PatientHistory />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="audit-log" element={<ProtectedRoute roles={['Manager']}><AuditLog /></ProtectedRoute>} />
                <Route path="workload" element={<ProtectedRoute roles={['Manager']}><WorkloadView /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AppProviders>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;