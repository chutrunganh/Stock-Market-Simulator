import React, { useState } from 'react';

function LoginForm({ onLogin, onRegisterClick, onForgotPasswordClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Thực hiện logic đăng nhập ở đây
    onLogin({ email, password });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <div className="form-group">
        <label>Username:</label>
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
      <div className="form-footer">
        <a href="#" onClick={onRegisterClick}>Create New Account</a>
        <a href="#" onClick={onForgotPasswordClick}>Forgot Password?</a>
      </div>
    </form>
  );
}

export default LoginForm;
