import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';

/**
 * A wrapper component for protected routes
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // If not authenticated, show message and redirect after delay
  useEffect(() => {
    if (!isAuthenticated) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000); // Show message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        marginTop: '50px'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h3>Authentication Required</h3>
          <p>You need to be logged in to view this page.</p>
          <p>Redirecting to home page...</p>
        </div>
        <Navigate to="/" state={{ from: location.pathname }} replace />
      </div>
    );
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
