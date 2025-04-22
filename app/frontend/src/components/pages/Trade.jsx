import React from 'react';
import './Trade.css';

const MiniLineChart = ({ data, width = 150, height = 50, strokeColor = '#007bff' }) => {
    if (!data || data.length < 2) {
        return <div style={{ height: `${height}px`, width: `${width}px`, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No data</div>;
    }
    const padding = 5;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - minVal) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" points={points} />
        </svg>
    );
};

const StockCard = ({ stock }) => {
    const isPositive = stock.changePercent >= 0;
    const changeColor = isPositive ? '#28a745' : '#dc3545';

    const getLogo = (ticker) => {
        switch(ticker) {
            case 'AAPL': return <div className="stock-logo apple-logo"></div>;
            case 'NVDA': return <div className="stock-logo nvidia-logo"></div>;
            case 'TSLA': return <div className="stock-logo tesla-logo">T</div>;
            case 'COST': return <div className="stock-logo costco-logo">C</div>;
            case 'NFLX': return <div className="stock-logo netflix-logo">N</div>;
            case 'MSFT': return <div className="stock-logo msft-logo"></div>;
            default: return <div className="stock-logo">{ticker.charAt(0)}</div>;
        }
    }

    return (
        <div className="stock-card">
            <div className="stock-card-header">
                 {getLogo(stock.ticker)}
                <div className="stock-card-ticker-name">
                    <span className="stock-ticker">{stock.ticker} <span className="market-dot">•</span></span>
                    <span className="stock-name">{stock.name}</span>
                </div>
                <span className="stock-card-icon"></span>
            </div>
            <div className="stock-card-price-info">
                <span className="stock-price">${stock.price.toFixed(2)}</span>
                <span className="stock-change" style={{ color: changeColor }}>
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}% ({isPositive ? '+' : ''}{stock.changeValue.toFixed(2)})
                </span>
            </div>
            <div className="stock-chart-container">
                 <MiniLineChart data={stock.chartData} strokeColor={isPositive ? '#007bff' : '#6c757d'} />
            </div>
             <div className="stock-chart-xaxis">
                <span>May</span>
                <span>Aug</span>
                <span>2025</span>
                <span>Apr</span>
            </div>
        </div>
    );
};

const MostTradedStocks = () => {
    const stocks = [
        { ticker: 'AAPL', name: 'APPLE INC', price: 196.98, changePercent: 1.39, changeValue: 2.71, chartData: [180, 185, 183, 190, 195, 192, 198, 196, 193, 195] },
        { ticker: 'NVDA', name: 'NVIDIA CORPORATION', price: 101.49, changePercent: -2.87, changeValue: -3.00, chartData: [110, 108, 112, 105, 103, 100, 102, 101, 104, 99] },
        { ticker: 'TSLA', name: 'TESLA, INC.', price: 241.37, changePercent: -0.07, changeValue: -0.18, chartData: [230, 235, 228, 240, 245, 238, 242, 241, 248, 240] },
        { ticker: 'COST', name: 'COSTCO WHOLESALE', price: 994.50, changePercent: 2.76, changeValue: 26.75, chartData: [950, 960, 955, 970, 985, 975, 995, 994, 980, 990] },
        { ticker: 'NFLX', name: 'NETFLIX, INC.', price: 973.03, changePercent: 1.19, changeValue: 11.40, chartData: [920, 930, 925, 940, 955, 945, 965, 973, 960, 970] },
        { ticker: 'MSFT', name: 'MICROSOFT CORP', price: 415.50, changePercent: 0.85, changeValue: 3.50, chartData: [400, 405, 402, 410, 412, 408, 415, 413, 416, 415] },
    ];

    return (
        <div className="most-traded-section">
            <h2 className="most-traded-title">MOST TRADED STOCKS</h2>
            <div className="stock-cards-container">
                {stocks.map(stock => (
                    <StockCard key={stock.ticker} stock={stock} />
                ))}
            </div>
        </div>
    );
};

const InfoIcon = () => <span className="info-icon">ⓘ</span>;
const ShowMax = () => <button type="button" className="show-max-button">Show Max</button>;

function Trade(props) {
    return (
        <div className="trade-page-container">
            <h1 className="trade-title">Trade</h1>
            <p className="trade-intro-text">
                Welcome to the Trade page! Here you can look up stock symbols, place buy or sell orders using different order types, and manage your trades within the simulation. Monitor the most traded stocks below.
            </p>

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

            <MostTradedStocks />

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