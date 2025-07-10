import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { lightTheme, darkTheme } from './styles/theme.js';
import GlobalStyle from './styles/GlobalStyle.js';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CustomThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx';
import PhlebotomyQueue from './pages/PhlebotomyQueue.jsx';
import TechnologistWorklist from './pages/TechnologistWorklist.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PrintLabels from './pages/PrintLabels.jsx';
import ResultEntry from './pages/ResultEntry.jsx';
import ReportView from './pages/ReportView.jsx';
import PatientHistoryPage from './pages/PatientHistoryPage.jsx'; // Import new page

const AuthenticatedApp = () => {
    return (
        <AppLayout>
            <Routes>
                <Route path="/reception" element={<ReceptionistDashboard />} />
                <Route path="/phlebotomy" element={<PhlebotomyQueue />} />
                <Route path="/technologist" element={<TechnologistWorklist />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/patient/:patientId" element={<PatientHistoryPage />} /> {/* Add new route */}
                <Route path="/" element={<ManagerDashboard />} /> {/* Default route for logged-in users */}
            </Routes>
        </AppLayout>
    );
}

const ThemedApp = () => {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const currentTheme = theme === 'light' ?
    { ...lightTheme, direction: i18n.dir(), isRTL } :
    { ...darkTheme, direction: i18n.dir(), isRTL };

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n.dir()]);

  return (
    <StyledThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={isRTL}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/print/:orderId" element={<ProtectedRoute><PrintLabels /></ProtectedRoute>} />
          <Route path="/results/:orderId" element={<ProtectedRoute><ResultEntry /></ProtectedRoute>} />
          <Route path="/report/:orderId" element={<ProtectedRoute><ReportView /></ProtectedRoute>} />
          <Route path="/*" element={<ProtectedRoute><AuthenticatedApp /></ProtectedRoute>} />
        </Routes>
      </Router>
    </StyledThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <ThemedApp />
      </CustomThemeProvider>
    </AuthProvider>
  );
}

export default App;