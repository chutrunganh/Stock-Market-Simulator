import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar({ onLoginClick }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">Stock Market Simulator</Link>
      </div>
      <div className="navbar-auth">
        {user ? (
          <div className="logged-in">
            <span className="user-icon"></span>
            <span className="user-email">{user.email}</span>
            <button className="logout-button" onClick={logout}>Logout</button>
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



