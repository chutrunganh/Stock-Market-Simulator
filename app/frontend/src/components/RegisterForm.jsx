import React, { useState } from 'react';
import './RegisterForm.css';

function RegisterForm({ onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error messages
    setPasswordError(false);
    setConfirmPasswordError(false);
    setErrorMessage('');

    // Validate password length
    if (password.length < 8) {
      setPasswordError(true);
      setErrorMessage('Password must have at least 8 characters.');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setErrorMessage('Passwords do not match.');
      return;
    }

    const userData = {
      username,
      email,
      password
    };

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setIsRegistered(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Registration failed.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  if (isRegistered) {
    return (
      <div className="success-overlay">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Registration Successful!</h2>
          <button className="back-to-login-btn" onClick={onBackToLogin}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register</h2>

      {/* Hiển thị thông báo lỗi ở một vị trí duy nhất */}
      {errorMessage && (
        <div className="error-container">
          <p className="error-message">{errorMessage}</p>
        </div>
      )}

      <div className="form-group">
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
        />
      </div>

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
            className={passwordError ? 'error' : ''}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>
        {passwordError && (
          <span className="error-message">
            Password must have at least 8 characters.
          </span>
        )}
      </div>

      <div className="form-group">
        <label>Confirm Password:</label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            className={confirmPasswordError ? 'error' : ''}
          />
          <span
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>
        {confirmPasswordError && (
          <span className="error-message">Passwords do not match.</span>
        )}
      </div>

      <button type="submit" className="submit-button">Register</button>
    </form>
  );
}

export default RegisterForm;