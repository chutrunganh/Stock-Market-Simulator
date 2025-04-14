import React, { useState } from 'react';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        const result = await response.json();
        console.log('User registered:', result);
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
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
            onChange={handlePasswordChange}
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
            onChange={handleConfirmPasswordChange}
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