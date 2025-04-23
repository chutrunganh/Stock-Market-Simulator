/**
 * User API services
 * Handles all user-related API requests
 */
import apiClient from './apiClient';

/**
 * Register a new user
 * @param {Object} userData - User registration data (username, email, password)
 * @returns {Promise} - Promise with the registration response
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Registration failed. Please try again.'
    );
  }
};

/**
 * Log in a user
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} - Promise with the login response and user data
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/login', credentials);
    
    // Store user info in local storage for persistence
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Login failed. Please check your credentials.'
    );
  }
};

/**
 * Log out the current user
 * @returns {Promise} - Promise indicating logout status
 */
export const logoutUser = async () => {
  // Clear user from local storage
  localStorage.removeItem('user');
  
  try {
    // Optional: Call logout endpoint if your backend requires it
    // await apiClient.post('/logout');
    return { success: true };
  } catch (error) {
    throw new Error('Logout failed');
  }
};

/**
 * Get the current user from localStorage
 * @returns {Object|null} - Current user or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated based on local storage
 * @returns {Boolean} - True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

/**
 * Request password reset for an email
 * @param {String} email - User's email
 * @returns {Promise} - Promise with the reset request response
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Password reset request failed. Please try again.'
    );
  }
};