import React, { useState } from 'react';
import './LoginForm.css';

function LoginForm({ onLogin, onRegisterClick, onForgotPasswordClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
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
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>
      <button type="submit" className="submit-button">Login</button>
      <div className="form-footer">
        <a href="#" onClick={onRegisterClick} style={{ float: 'left' }}>Create New Account</a>
        <a href="#" onClick={onForgotPasswordClick} style={{ float: 'right' }}>Forgot Password?</a>
      </div>
    </form>
  );
}

export default LoginForm;
