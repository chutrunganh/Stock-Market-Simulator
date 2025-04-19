import React, { useState } from 'react';
import { apiRequest } from '../helpers/apiHelper';
import './ForgotPasswordForm.css';

function ForgotPasswordForm({ onReset, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/forgot-password', 'POST', { email });
      setMessage('A reset link has been sent to your email.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="forgot-password-form" onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      {message && <p className="success-message">{message}</p>}
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
      <button type="submit" className="submit-button">Send Reset Link</button>
      <button type="button" className="close-button" onClick={onClose}>Cancel</button>
    </form>
  );
}

export default ForgotPasswordForm;
