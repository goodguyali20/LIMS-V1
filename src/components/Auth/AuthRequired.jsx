import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../Loaders/PageLoader';

const AuthRequired = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected content if user is authenticated
  return children;
};

export default AuthRequired; 