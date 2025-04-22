import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ onLoginClick, isLoggedIn, userEmail, onLogoutClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">Stock Market Simulator</Link>
      </div>
      <div className="navbar-auth">
        {isLoggedIn ? (
          <div className="logged-in">
            <span className="user-icon">👤</span>
            <span className="user-email">{userEmail}</span>
            <button className="logout-button" onClick={onLogoutClick}>Logout</button>
          </div>
        ) : (
          <button className="login-button" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;



