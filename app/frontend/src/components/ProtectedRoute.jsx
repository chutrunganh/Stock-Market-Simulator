/**
 * ProtectedRoute component - Ensures routes are only accessible to authenticated users
 * Redirects unauthenticated users to the home page with a notification
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to home with a message
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ 
      from: location.pathname,
      authMessage: 'You need to be logged in to access this page' 
    }} replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
