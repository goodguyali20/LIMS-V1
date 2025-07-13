import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useTheme } from './contexts/ThemeContext.jsx';

// Pages & Components
import ManagerDashboard from './pages/Dashboard/ManagerDashboard.jsx';
import PrintOrder from './pages/PrintOrder.jsx';
import Orders from './pages/Orders.jsx';
import Settings from './pages/Settings/Settings.jsx';
import General from './pages/Settings/General.jsx';
import Tests from './pages/Settings/Tests.jsx';
import Users from './pages/Settings/Users.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import Layout from './components/Layout/Layout.jsx';
import AuthRequired from './components/Auth/AuthRequired.jsx';
import PatientRegistration from './pages/PatientRegistration/PatientRegistration.jsx';
import PatientHistory from './pages/PatientHistory/PatientHistory.jsx';
import WorkQueue from './pages/WorkQueue/WorkQueue.jsx';
import QualityControl from './pages/QualityControl/QualityControl.jsx';
import Inventory from './pages/Inventory/Inventory.jsx';
import WorkloadView from './pages/Workload/WorkloadView.jsx';
import AuditLog from './pages/AuditLog/AuditLog.jsx';
import Profile from './pages/Profile/Profile.jsx';
import OrderView from './pages/OrderView/OrderView.jsx';
import ResultEntry from './pages/ResultEntry/ResultEntry.jsx';
import Phlebotomist from './pages/Phlebotomist/Phlebotomist.jsx';
import SearchResults from './pages/SearchResults.jsx';
import Scanner from './pages/Scanner/Scanner.jsx';
import LibraryShowcase from './components/LibraryShowcase.jsx';
import MathematicalAnimations from './components/MathematicalAnimations.jsx';
import AdvancedLibraryShowcase from './components/AdvancedLibraryShowcase.jsx';

// Wrapper component that uses theme context
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <StyledThemeProvider theme={theme}>
      <Routes
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Route path="/login" element={<LoginPage />} />
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
          {/* The route for adding an order is now just the dashboard */}
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
          <Route path="scanner" element={<Scanner />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="showcase" element={<LibraryShowcase />} />
          <Route path="advanced-showcase" element={<AdvancedLibraryShowcase />} />
          <Route path="math-animations" element={<MathematicalAnimations />} />
          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<General />} />
            <Route path="tests" element={<Tests />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </StyledThemeProvider>
  );
};

const AppRoutes = () => {
  return <AppContent />;
};

export default AppRoutes; 