/**
 * AuthContext provides authentication state and methods throughout the app
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../api/user';

// Create the Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Implement token verification with your backend
          const userData = await verifyToken(token);
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);    try {
      const response = await loginUser(credentials);
      console.log('Full login response:', response);  // Debug log
      const { user, token } = response.data;
      if (!user || !token) {
        throw new Error('Invalid login response from server.');
      }
      setUser(user);
      localStorage.setItem('authToken', token);
      return { user, token };
    } catch (err) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await registerUser(userData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async () => {
    try {
      // The backend will set the JWT cookie automatically
      // and the user data will be in the response
      const response = await fetch('http://localhost:3000/auth/google/callback', {
        credentials: 'include' // Important for cookies
      });
      const data = await response.json();
      
      if (data.data.user) {
        setUser(data.data.user);
        localStorage.setItem('authToken', data.data.token);
        return data.data;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Context value
  const contextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    handleGoogleCallback
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
