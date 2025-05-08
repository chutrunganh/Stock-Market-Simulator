import React from 'react';
import './AnnouncementBanner.css';

const AnnouncementBanner = () => (
  <div className="announcement-banner">
    <span className="announcement-icon" role="img" aria-label="stock">🔔 News</span>
    <div className="announcement-text-wrapper">
      <span className="announcement-text">
        <span className="company-name">Soict Stock</span> - Welcome! Lãi thấp dài ngày, uptrend cùng thị trường! (Low interest, long-term uptrend with the market!) — Experience the best virtual stock trading platform for students and investors!
      </span>
    </div>
  </div>
);

export default AnnouncementBanner; 