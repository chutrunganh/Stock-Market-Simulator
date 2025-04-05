import React, { useState } from 'react';

function ForgotPasswordForm({ onReset }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReset(email);
  };

  return (
    <form className="forgot-password-form" onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
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
    </form>
  );
}

export default ForgotPasswordForm;
