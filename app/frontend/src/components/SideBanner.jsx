import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cryptoMarket from '../assets/images/Green Modern Crypto Market Mobile Video.png';
import cryptoTrading from '../assets/images/Navy Modern Crypto Trading Mobile Video.png';
import './SideBanner.css';

function SideBanner({ position }) {
  const navigate = useNavigate();
  const [currentImage] = useState(position === 'left' ? cryptoMarket : cryptoTrading);

  const handleBannerClick = () => {
    navigate('/tutorial');
  };

  return (
    <div className={`side-banner ${position}`} onClick={handleBannerClick}>
      <div className="banner-scroll-container">
        <div className="banner-image-wrapper">
          <img
            src={currentImage}
            alt="Banner Advertisement"
            className="banner-image"
            draggable="false"
            loading="lazy"
          />
          <img
            src={currentImage}
            alt="Banner Advertisement"
            className="banner-image"
            draggable="false"
            loading="lazy"
          />
        </div>
      </div>
      <div className="learn-more">Learn More</div>
    </div>
  );
}

export default SideBanner;