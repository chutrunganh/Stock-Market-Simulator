import React from 'react';
import { Link } from 'react-router-dom';
     

function Trade(props) {
    return(
        <div className="trade-container">
            <h1 className="trade-title">Trade</h1>
            <div className="trade-content">
                <p>Welcome to the trading page! Here you can buy and sell stocks.</p>
                {/* <Link to="/portfolio" className="portfolio-link">Go to Portfolio</Link> */}
            </div>
        </div>
    );
    
}

export default Trade;