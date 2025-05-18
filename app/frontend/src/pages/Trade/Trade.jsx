import './Trade.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createOrder, getMostTradedStocks, getStockBySymbol } from '../../api/trade';
import { Autocomplete, TextField } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

// Predefined stock data
const STOCK_OPTIONS = [
    { symbol: 'VCB', name: 'Commercial Bank For Foreign Trade Of Vietnam (Vietcombank)' },
    { symbol: 'BID', name: 'Commercial Bank For Investment And Development Of Vietnam (BIDV)' },
    { symbol: 'VHM', name: 'Vinhomes' },
    { symbol: 'CTG', name: 'Vietnam Joint Stock Commercial Bank for Industry and Trade (VietinBank)' },
    { symbol: 'GAS', name: 'PetroVietnam Gas Joint Stock Corporation' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Google Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'BRK.A', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' }
];

const MiniLineChart = ({ data, width = 150, height = 50, strokeColor = '#007bff' }) => {
    if (!data || data.length < 2) {
        return <div style={{ height: `${height}px`, width: `${width}px`, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No data</div>;
    }
    const options = {
        chart: {
            type: 'line',
            sparkline: { enabled: true },
            toolbar: { show: false },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
            colors: [strokeColor],
        },
        tooltip: {
            enabled: false,
        },
        markers: {
            size: 0,
        },
        grid: {
            show: false,
        },
        xaxis: {
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            show: false,
        },
    };
    const series = [
        {
            name: 'Price',
            data: data,
        },
    ];
    return (
        <ReactApexChart options={options} series={series} type="line" width={width} height={height} />
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
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const stocksData = await getMostTradedStocks();
                setStocks(stocksData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load stocks data');
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

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

const InfoIcon = ({ title }) => (
    <span
        title={title}
        style={{ margin: '0 4px', cursor: 'pointer' }}
    >
        ⓘ
    </span>
);

function Trade(props) {
    const [symbol, setSymbol] = useState('');
    const [action, setAction] = useState('buy');
    const [quantity, setQuantity] = useState(0);
    const [orderType, setOrderType] = useState('market');
    const [limitPrice, setLimitPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { user } = useAuth();

    // Calculate estimated value for limit orders
    const estimatedValue = useMemo(() => {
        if (orderType === 'limit') {
            const numQuantity = parseFloat(quantity);
            const numLimitPrice = parseFloat(limitPrice);
            if (numQuantity > 0 && numLimitPrice > 0) {
                return (numQuantity * numLimitPrice).toFixed(2);
            }
        }
        return null;
    }, [orderType, quantity, limitPrice]);
    
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Check if user is authenticated
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('You must be logged in to place an order');
            }
            console.log('Creating order with user ID:', userId);

            // First get the stock details to get the stock ID
            const stockDetails = await getStockBySymbol(symbol.toUpperCase());
            if (!stockDetails || !stockDetails.id) {
                throw new Error(`Could not find stock with symbol ${symbol}`);
            }

            const orderData = {
                userId,
                stockId: stockDetails.id,
                quantity: parseInt(quantity),
                price: orderType === 'limit' ? parseFloat(limitPrice) : null,
                orderType: `${orderType.charAt(0).toUpperCase() + orderType.slice(1)} ${action.charAt(0).toUpperCase() + action.slice(1)}`
            };

            console.log('Order data:', orderData);
            const response = await createOrder(orderData);
            
            if (!response) {
                setErrorMessage('Order placement failed with no response');
                return;
            }
            
            if (response.status === 201 || response.success === true) {
                // Success case - set success message
                const successMsg = response.message || 'Order placed successfully';
                setSuccessMessage(`${successMsg} - Stock: ${symbol}, Quantity: ${quantity}, Price: ${orderType === 'limit' ? `$${limitPrice}` : 'Market Price'}`);
                
                // Reset form only if order was placed
                setQuantity(0);
                setLimitPrice(0);
                
                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                // Failure case (like trading closed)
                setErrorMessage(response.message || 'Order placement failed with no error message');
            }
        } catch (error) {
            console.error('Order placement error:', error);
            let errorMsg = 'Failed to place order';
            
            if (error.response) {
                errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMsg = 'No response from server. Please check your connection.';
            } else {
                errorMsg = error.message || 'Unknown error occurred';
            }
            
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSymbol('');
        setQuantity(0);
        setLimitPrice(0);
    };

    return (
        <div className="trade-page-container">
            <h1 className="trade-title">Trade</h1>
            <p className="trade-intro-text">
                Welcome to the Trade page! Here you can look up stock symbols, place buy or sell orders using different order types, and manage your trades within the simulation. Monitor the most traded stocks below.
            </p>

        

            <MostTradedStocks />

            <div className="trade-content-area">
                <div className="form-section">
                    <label htmlFor="symbol-lookup" className="form-label">Symbol</label>
                    <div className="input-with-icon">
                        <Autocomplete
                            value={STOCK_OPTIONS.find(option => option.symbol === symbol) || null}
                            onChange={(event, newValue) => {
                                setSymbol(newValue ? newValue.symbol : '');
                            }}
                            options={STOCK_OPTIONS}
                            getOptionLabel={(option) => {
                                if (!option) return '';
                                return typeof option === 'string' ? option : option.symbol;
                            }}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <li key={option.symbol} {...otherProps}>
                                        <strong>{option.symbol}</strong>
                                        <small style={{ marginLeft: '8px', color: '#666' }}>
                                            {option.name}
                                        </small>
                                    </li>
                                );
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Stock Symbol"
                                    variant="outlined"
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-column">
                        <label htmlFor="action-select" className="form-label">
                            Action 
                        </label>
                        <select 
                            id="action-select" 
                            className="form-select"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        >
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
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="0"
                           />
                        </div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-column">
                        <label htmlFor="order-type-select" className="form-label">
                            Order Type <InfoIcon title="Market Order: Executes immediately at the current market price. Limit Order: Executes only at a specified price or better you choose" />
                        </label>
                        <select 
                            id="order-type-select" 
                            className="form-select"
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                        >
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                        </select>
                    </div>
                    {orderType === 'limit' && (
                        <div className="form-column">
                            <label htmlFor="limit-price-input" className="form-label">Limit Price</label>
                            <div className="input-with-side-action">
                                <input
                                    type="number"
                                    id="limit-price-input"
                                    className="form-input"
                                    value={limitPrice}
                                    onChange={(e) => setLimitPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    placeholder='0.00'
                                />
                            </div>
                            {/* Display Estimated Value */}
                            {estimatedValue !== null && (
                                <div className="estimated-value-display">
                                    {action === 'buy' ? 'Estimated Cost: ' : 'Estimated Proceeds: '}
                                    ${estimatedValue}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="form-actions">                    <button 
                        type="button" 
                        className="btn btn-clear" 
                        onClick={handleClear}
                        disabled={loading}
                    >
                        CLEAR
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-preview" 
                        onClick={handleSubmit}
                        disabled={loading || !symbol || quantity <= 0 || (orderType === 'limit' && limitPrice <= 0)}
                    >
                        {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
                    </button>
                </div>                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Trade;