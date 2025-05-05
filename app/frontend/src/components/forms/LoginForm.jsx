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

    if (urlParams.has('login') && urlParams.get('login') === 'success') {
      const token = urlParams.get('token');
      setIsLoading(true);
      try {
        localStorage.setItem('authToken', token);
        const data = await getUserProfile();
        
        if (data.status === 200 && data.data && data.data.user) {
          window.history.replaceState({}, document.title, window.location.pathname);

          const loginData = {
            user: data.data.user,
            token: token
          };

          onLogin(loginData);
        } else {
          setError('Failed to get user profile');
        }
      } catch (err) {
        setError('Google login failed. Please try again.');
        console.error('Google login error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  handleGoogleCallback();
}, [onLogin]);  const handleSubmit = async (e) => {
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
      onLogin(userData);
    } catch (err) {
      // Display the error message to the user
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Use relative URL that will work in any environment
    window.location.href = '/api/auth/google';
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
