import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import './App.css';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (userData) => {
    // Thực hiện xác thực người dùng ở đây
    console.log('User logged in:', userData);
    setIsLoggedIn(true);
    setUserEmail(userData.email);
    setShowLoginModal(false);
  };

  const handleRegister = (userData) => {
    console.log('User registered:', userData);
    setShowRegisterModal(false);
    setShowSuccessModal(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  const handleResetPassword = (email) => {
    console.log('Password reset link sent to:', email);
    setShowForgotPasswordModal(false);
    setShowSuccessModal(true);
  };

  return (
    <Router>
      <div className="App">
        <Navbar 
          onLoginClick={() => setShowLoginModal(true)} 
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLogoutClick={handleLogout}
        />
        
        {/* Modal Login Form */}
        {showLoginModal && (
          <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
              <LoginForm 
                onLogin={handleLogin} 
                onRegisterClick={() => { 
                  setShowLoginModal(false); 
                  setShowRegisterModal(true); 
                }} 
                onForgotPasswordClick={() => {
                  setShowLoginModal(false);
                  setShowForgotPasswordModal(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Register Form */}
        {showRegisterModal && (
          <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowRegisterModal(false)}>×</button>
              <RegisterForm onRegister={handleRegister} />
            </div>
          </div>
        )}

        {/* Modal Forgot Password Form */}
        {showForgotPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowForgotPasswordModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForgotPasswordModal(false)}>×</button>
              <ForgotPasswordForm onReset={handleResetPassword} />
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowSuccessModal(false)}>×</button>
              <h2>Success!</h2>
              <p>An email has been sent with further instructions.</p>
              <button className="submit-button" onClick={() => setShowSuccessModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
