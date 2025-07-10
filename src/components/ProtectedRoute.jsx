import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// This component will now wrap our entire authenticated app layout
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While we're checking auth, show a simple loading message or a spinner
    return <div>Loading Application...</div>;
  }

  if (!currentUser) {
    // If check is done and there's no user, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If check is done and there IS a user, show the app
  return children;
};

export default ProtectedRoute;