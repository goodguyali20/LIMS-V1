import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { OrderProvider } from './contexts/OrderContext.jsx';

// Pages & Components
import Dashboard from './pages/Dashboard.jsx';
import PrintOrder from './pages/PrintOrder.jsx';
import Orders from './pages/Orders.jsx';
import Settings from './pages/Settings/Settings.jsx';
import General from './pages/Settings/General.jsx';
import Tests from './pages/Settings/Tests.jsx';
import Users from './pages/Settings/Users.jsx';
import Login from './pages/Login.jsx';
import Layout from './components/Layout/Layout.jsx';
import AuthRequired from './components/Auth/AuthRequired.jsx';

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <AuthRequired>
                  <Layout />
                </AuthRequired>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              {/* The route for adding an order is now just the dashboard */}
              <Route path="add-order" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="orders" element={<Orders />} />
              <Route path="print-order/:orderId" element={<PrintOrder />} />
              <Route path="settings" element={<Settings />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<General />} />
                <Route path="tests" element={<Tests />} />
                <Route path="users" element={<Users />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;