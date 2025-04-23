import React, { useState } from 'react';
import { requestPasswordReset } from '../../api/user';
import './ForgotPasswordForm.css';

/**
 * ForgotPasswordForm component
 * Handles password reset requests
 */
function ForgotPasswordForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      // Call the API service to request password reset
      await requestPasswordReset(email);
      
      // Show success message (even if email doesn't exist for security)
      setMessage('If an account with that email exists, we have sent password reset instructions.');
      
      // Clear form
      setEmail('');
      
      // Close the form after a delay
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      // Show generic error to prevent email enumeration
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-form">
      <h2>Reset Password</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
