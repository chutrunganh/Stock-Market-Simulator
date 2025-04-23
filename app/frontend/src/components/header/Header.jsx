import {Link, NavLink} from 'react-router-dom';
import React, { useState } from 'react';
import './Header.css';

function Header({ onLoginClick, isLoggedIn, userEmail, onLogoutClick }) {

    const [menuOpen, setMenuOpen] = useState(false);
    return(
        
          <header className="header">
            
            <h1><Link to="/" className="title"><img src="logo.png" height="50" alt="Logo"></img>Stock Market Simulator</Link></h1>
            
            <nav className="nav-header">
              <ul>
                <li tabIndex="0" onClick={() => console.log('Home clicked')}>
                  <NavLink to="/home" className="navbar__link">Home</NavLink>
                </li>
                <li tabIndex="0" onClick={() => console.log('Trade clicked')}>
                  <NavLink to="/trade" className="navbar__link">Trade</NavLink>        
                </li>
                <li tabIndex="0" onClick={() => console.log('Portfolio clicked')}>
                  <NavLink to="/portfolio" className="navbar__link">Portfolio</NavLink>        
                </li>
                <li tabIndex="0" onClick={() => console.log('Tutorial clicked')}>
                  <NavLink to="/tutorial" className="navbar__link">Tutorial</NavLink>        
                </li>
              </ul>
              
            </nav>

            <nav className='nav-profile'>
              {isLoggedIn ? (
                <div className="profile" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
                  <div className="user-info">
                    <span className="user-icon">👤</span>
                    <span className="user-email">{userEmail}</span>
                  </div>
                  <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
                    <button className="dropdown-item" onClick={() => console.log('Profile clicked')}>Profile</button>
                    <button className="logout-button" onClick={onLogoutClick}>Logout</button>
                  </div>
                </div>
              ) : (
                <button className="login-btn" onClick={onLoginClick}>Login</button>
              )}
            </nav>
            
            
          </header>  
        
    );

}

export default Header;