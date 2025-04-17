import React from 'react';
import './Trade.css';

const InfoIcon = () => <span className="info-icon">ⓘ</span>;
const SearchIcon = () => <span className="search-icon">🔍</span>;
const ShowMax = () => <button type="button" className="show-max-button">Show Max</button>;

function Trade(props) {
    return (
        
        <div className="trade-page-container">
            <h1 className="trade-title">Trade</h1>
            {/* <Link to="/portfolio" className="portfolio-link">Go to Portfolio</Link> */}
            <div className="account-summary-bar">
                <div className="summary-item">
                    <div className="item-title">Account Value</div>
                    <div className="item-value">$100,000.00</div>
                </div>
                <div className="summary-item">
                    <div className="item-title">Buying Power</div>
                    <div className="item-value">$100,000.00</div>
                </div>
                <div className="summary-item">
                    <div className="item-title">Cash</div>
                    <div className="item-value">$100,000.00</div>
                </div>
            </div>

            <div className="trade-content-area">
                <div className="form-section">
                    <label htmlFor="symbol-lookup" className="form-label">Symbol</label>
                    <div className="input-with-icon">
                        <input
                            type="text"
                            id="symbol-lookup"
                            className="form-input"
                            placeholder="Look up Symbol/Company Name"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-column">
                        <label htmlFor="action-select" className="form-label">
                            Action <InfoIcon />
                        </label>
                        <select id="action-select" className="form-select">
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>

                    <div className="form-column">
                        <label htmlFor="quantity-input" className="form-label">Quantity</label>
                        <div className="input-with-side-action">
                           <input
                                type="number"
                                id="quantity-input"
                                className="form-input"
                                defaultValue="0"
                                min="0"
                           />
                           <ShowMax />
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-column">
                        <label htmlFor="order-type-select" className="form-label">
                            Order Type <InfoIcon />
                        </label>
                        <select id="order-type-select" className="form-select">
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                        </select>
                    </div>

                    <div className="form-column">
                        <label htmlFor="duration-select" className="form-label">
                            Duration <InfoIcon />
                        </label>
                        <select id="duration-select" className="form-select">
                            <option value="day">Day Only</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-clear">CLEAR</button>
                    <button type="button" className="btn btn-preview">PREVIEW ORDER </button>
                </div>
            </div>
        </div>
    );
}

export default Trade;

