import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

function LoginForm({ onLogin, onRegisterClick, onForgotPasswordClick }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  useEffect(() => {
    // Handle the Google OAuth callback
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.has('login') && urlParams.get('login') === 'success') {
        const token = urlParams.get('token');
        setIsLoading(true);
        try {
          // Store the token right away
          localStorage.setItem('authToken', token);
          
          // Get user data from the backend using the token
          const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          const data = await response.json();
            if (data.status === 200 && data.data && data.data.user) {
            // Remove the query parameters from the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Handle login success with the complete user data
            const loginData = {
              user: data.data.user,
              token: token
            };
            
            // Set user in auth context through the onLogin callback
            onLogin(loginData);
            
            // Redirect to home page after successful login
            window.location.href = '/';} else {
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
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const userData = await login({ email, password });
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
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
