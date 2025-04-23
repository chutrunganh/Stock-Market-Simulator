import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

/**
 * LoginForm component
 * Handles user login with email/password or Google SSO
 */
function LoginForm({ onClose, onRegisterClick, onForgotPasswordClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error: authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      onClose(); // Close modal on successful login
    } catch (error) {
      console.error('Login error:', error);
      // Auth context already handles the error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      {authError && <div className="error-message">{authError}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </div>
      
      <button
        type="button"
        className="google-login-button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
      >
        <span className="google-icon">G</span>
        Login with Google
      </button>
      
      <div className="form-footer">
        <button type="button" className="link-button" onClick={onRegisterClick}>
          Create New Account
        </button>
        <button type="button" className="link-button" onClick={onForgotPasswordClick}>
          Forgot Password?
        </button>
      </div>
    </form>
  );
}

export default LoginForm;