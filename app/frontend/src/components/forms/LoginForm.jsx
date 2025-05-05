import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../api/user';
import './LoginForm.css';

// Debug utility
const logObject = (label, obj) => {
  console.log(`${label}:`, JSON.stringify(obj));
};

function LoginForm({ onLogin, onRegisterClick, onForgotPasswordClick }) {
  const { login } = useAuth();  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);useEffect(() => {
  const handleGoogleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we're returning from Google authentication
    const isGoogleLoginFlow = sessionStorage.getItem('googleLoginInProgress') === 'true';
    
    // Handle success case
    if (urlParams.has('login') && urlParams.get('login') === 'success') {
      const token = urlParams.get('token');
      setIsLoading(true);
      try {
        console.log('Google login successful, processing token...');
        
        // Clear the Google login flag
        sessionStorage.removeItem('googleLoginInProgress');
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Get user profile
        const data = await getUserProfile();
        
        if (data.status === 200 && data.data && data.data.user) {
          console.log('User profile fetched successfully');
          
          // Clean up URL parameters to avoid issues with browser history
          window.history.replaceState({}, document.title, window.location.pathname);

          // Prepare login data
          const loginData = {
            user: data.data.user,
            token: token
          };
            // Use the auth context's login method directly instead of just calling onLogin
          // This ensures the auth context is properly updated
          await login(loginData);
          
          // Force the header to update immediately by dispatching the custom event directly
          window.dispatchEvent(new CustomEvent('auth-state-changed', { 
            detail: { user: data.data.user, isAuthenticated: true }
          }));
          
          // Then call onLogin to close the modal and update UI
          setTimeout(() => {
            onLogin(loginData);
          }, 100);
        } else {
          console.error('Failed to get user profile:', data);
          setError('Failed to get user profile. Please try again.');
        }
      } catch (err) {
        setError('Google login failed. Please try again.');
        console.error('Google login error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    // Handle error case
    else if (urlParams.has('error')) {
      const errorMsg = urlParams.get('error');
      console.error('Google login error from URL:', errorMsg);
      setError(decodeURIComponent(errorMsg) || 'Google login failed. Please try again.');
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  handleGoogleCallback();
}, [onLogin]);const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate inputs
    if (!identifier || !identifier.trim()) {
      setError('Username or email is required');
      setIsLoading(false);
      return;
    }
    
    if (!password || !password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      // Debug log credentials before sending
      logObject("Login credentials", { identifier: identifier.trim(), password: password.trim() });
        // Pass the credentials to the login function
      const userData = await login({
        identifier: identifier.trim(), 
        password: password.trim()
      });
      
      // Debug log the received user data
      logObject("Login successful, user data", userData);
      
      // If login was successful, notify the parent component
      // Small delay to ensure the state updates are processed
      setTimeout(() => {
        onLogin(userData);
      }, 100);
    } catch (err) {
      // Display the error message to the user
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };  const handleGoogleLogin = () => {
    try {
      setIsLoading(true);
      console.log('Redirecting to Google login...');
      
      // Store a flag in sessionStorage to indicate we're in the Google login flow
      // This will help us detect if we're returning from Google authentication
      sessionStorage.setItem('googleLoginInProgress', 'true');
      
      // Use correct URL path for Google authentication
      window.location.href = '/api/auth/google';
      
      // Add visual feedback that we're redirecting
      setError('');
      const googleRedirectTimeout = setTimeout(() => {
        // If we're still on this page after 5 seconds, show an error
        setError('Google login is taking longer than expected. Please try again.');
        setIsLoading(false);
      }, 5000);
      
      // Clear timeout if component unmounts
      return () => clearTimeout(googleRedirectTimeout);
    } catch (err) {
      console.error('Failed to redirect to Google login:', err);
      setError('Failed to start Google login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}      <div className="form-group">
        <label>Email or Username:</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          placeholder="Enter your email or username"
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </div>
      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <button
        type="button"
        className="google-login-button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Login with Google'}
      </button>
      <div className="form-footer">
        <a href="#" onClick={(e) => { e.preventDefault(); onRegisterClick(); }}>
          Create New Account
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); onForgotPasswordClick(); }}>
          Forgot Password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
