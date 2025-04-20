import React, { useState } from 'react';
import { apiRequest } from '../helpers/apiHelper';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setPasswordError(true);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      return;
    }

    const userData = {
      username,
      email,
      password,
    };

    try {
      const response = await apiRequest('/register', 'POST', userData);
      setSuccessMessage('Account created successfully! You can now log in.');
      setErrorMessage('');
      console.log('User registered:', response);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length < 8);
    setConfirmPasswordError(value !== confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(password !== value);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register</h2>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

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
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
            placeholder="Enter your password"
            className={passwordError ? 'error' : ''}
          />
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
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            placeholder="Confirm your password"
            className={confirmPasswordError ? 'error' : ''}
          />
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