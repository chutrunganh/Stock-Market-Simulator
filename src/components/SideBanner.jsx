import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import cryptoMarket from '../assets/images/Green Modern Crypto Market Mobile Video.png';
import cryptoTrading from '../assets/images/Navy Modern Crypto Trading Mobile Video.png';

function SideBanner({ position }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [clickStartTime, setClickStartTime] = useState(0);

  const images = position === 'left' ? 
    [cryptoMarket, cryptoTrading] : 
    [cryptoTrading, cryptoMarket];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.clientWidth,
      behavior: 'smooth'
    });
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    scrollContainerRef.current.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  };

  const handleBannerClick = () => {
    const clickDuration = Date.now() - clickStartTime;
    if (clickDuration < 200 && !isDragging) {
      navigate('/tutorial');
    }
  };

  const handleMouseDown = (e) => {
    setClickStartTime(Date.now());
    setIsDragging(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    const scrollPosition = container.scrollLeft;
    const threshold = container.clientWidth / 2;
    
    if (scrollPosition > threshold) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const width = container.clientWidth;
      setCurrentIndex(Math.round(scrollPosition / width));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="side-banner">
      <div
        ref={scrollContainerRef}
        className="banner-scroll-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleBannerClick}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        <div className="banner-image-container">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Crypto ${index + 1}`}
              className="banner-image"
              draggable="false"
            />
          ))}
        </div>
      </div>

      <button className="banner-nav-button prev" onClick={handlePrev}>
        ←
      </button>
      <button className="banner-nav-button next" onClick={handleNext}>
        →
      </button>

      <div className="banner-dots">
        {images.map((_, index) => (
          <div
            key={index}
            className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentIndex(index);
              scrollContainerRef.current.scrollTo({
                left: index * scrollContainerRef.current.clientWidth,
                behavior: 'smooth'
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SideBanner; 