import React, { useState } from 'react';
import { apiRequest } from '../helpers/apiHelper';
import './LoginForm.css';

function LoginForm({ onLogin, onRegisterClick, onForgotPasswordClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/login', 'POST', { email, password });
      onLogin(data); // Gửi dữ liệu người dùng đã đăng nhập lên App
    } catch (err) {
      setError(err.message);
    }
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
        <a href="#" onClick={onRegisterClick}>Create New Account</a>
        <a href="#" onClick={onForgotPasswordClick}>Forgot Password?</a>
      </div>
    </form>
  );
}

export default LoginForm;
