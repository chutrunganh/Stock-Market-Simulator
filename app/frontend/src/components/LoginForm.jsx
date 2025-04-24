import React, { useState } from 'react';
import { apiRequest } from '../helpers/apiHelper';
import './LoginForm.css';

function LoginForm({ onLogin, onRegisterClick, onForgotPasswordClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Thêm state cho hiện/ẩn mật khẩu

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            // data should include both email and username
            onLogin({
                email: data.email,
                username: data.username
            });
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Login failed');
        }
    } catch (err) {
        setError('An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:3000/api/auth/google';
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
        />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>
      </div>
      <button type="submit" className="submit-button">Login</button>
      <button
        type="button"
        className="google-login-button"
        onClick={handleGoogleLogin}
      >
        <span className="google-icon"></span>
        Login with Google
      </button>
      <div className="form-footer">
        <a href="#" onClick={onRegisterClick}>Create New Account</a>
        <a href="#" onClick={onForgotPasswordClick}>Forgot Password?</a>
      </div>
    </form>
  );
}

export default LoginForm;
