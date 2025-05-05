/**
 * AuthContext provides authentication state and methods throughout the app
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getUserProfile } from '../api/user';
import apiClient from '../api/apiClient';

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
          // Verify token by fetching user profile
          const response = await getUserProfile();
          if (response && response.data && response.data.user) {
            setUser(response.data.user);
          } else {
            // If verification fails, clear the auth state
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      let userData;
      let authToken;
      
      // If credentials contains both user and token (from Google login)
      if (credentials.user && credentials.token) {
        userData = credentials.user;
        authToken = credentials.token;      } else {
        // Regular identifier/password login
        const response = await loginUser({
          identifier: credentials.identifier,
          password: credentials.password
        });
        if (!response || !response.data || !response.data.user || !response.data.token) {
          throw new Error('Invalid login response from server.');
        }
        userData = response.data.user;
        authToken = response.data.token;
      }
      
      // Store auth data and update state
      localStorage.setItem('authToken', authToken);
      setUser(userData);
        // Verify the stored token immediately
      const verifyResponse = await getUserProfile();
      if (!verifyResponse || !verifyResponse.data) {
        throw new Error('Failed to verify login state');
      }
      
      return userData;
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
      if (!response || !response.data) {
        throw new Error('Invalid registration response from server.');
      }
      
      // Check for specific error cases in the response
      if (response.status === 500) {
        if (response.error?.includes('users_username_key')) {
          throw new Error('Username already exists. Please choose a different username.');
        }
        if (response.error?.includes('users_email_key')) {
          throw new Error('Email already exists. Please use a different email address.');
        }
      }
      
      return response.data;
    } catch (err) {
      // Handle axios error response
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Registration failed.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error,
        isAuthenticated: !!user, // Add this to indicate if user is logged in
        login,
        logout,
        register 
      }}
    >
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
