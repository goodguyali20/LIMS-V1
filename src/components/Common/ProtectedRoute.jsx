import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../Loaders/PageLoader.jsx';

const ProtectedRoute = ({ children, requiredRole = null, fallbackPath = '/login' }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const userRole = user.role?.toLowerCase();
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    const hasRequiredRole = requiredRoles.some(role => 
      userRole === role.toLowerCase()
    );

    if (!hasRequiredRole) {
      // Redirect to dashboard with error message for insufficient permissions
      return <Navigate to="/app/dashboard" state={{ 
        error: 'Insufficient permissions to access this page' 
      }} replace />;
    }
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;