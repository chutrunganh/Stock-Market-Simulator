import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import axios from 'axios';
import './Portfolio.css';

function Portfolio() {
    const [portfolioDetails, setPortfolioDetails] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState({
        details: true,
        holdings: false,
        transactions: false
    });
    const [error, setError] = useState(null);
    const [showHoldings, setShowHoldings] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);

    // Fetch portfolio details on component mount
    useEffect(() => {
        fetchPortfolioDetails();
    }, []);

    const fetchPortfolioDetails = async () => {
        try {
            setLoading(prev => ({ ...prev, details: true }));
            const response = await axios.get('/api/portfolio/details');
            setPortfolioDetails(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load portfolio details');
            console.error('Error fetching portfolio details:', err);
        } finally {
            setLoading(prev => ({ ...prev, details: false }));
        }
    };

    const fetchHoldings = async () => {
        if (!showHoldings) {
            try {
                setLoading(prev => ({ ...prev, holdings: true }));
                const response = await axios.get('/api/portfolio/holdings');
                setHoldings(response.data.data);
                setError(null);
            } catch (err) {
                setError('Failed to load holdings');
                console.error('Error fetching holdings:', err);
            } finally {
                setLoading(prev => ({ ...prev, holdings: false }));
            }
        }
        setShowHoldings(!showHoldings);
    };

    const fetchTransactions = async () => {
        if (!showTransactions) {
            try {
                setLoading(prev => ({ ...prev, transactions: true }));
                const response = await axios.get('/api/portfolio/transactions');
                setTransactions(response.data.data);
                setError(null);
            } catch (err) {
                setError('Failed to load transactions');
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(prev => ({ ...prev, transactions: false }));
            }
        }
        setShowTransactions(!showTransactions);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading.details) {
        return (
            <div className="portfolio">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio">
                <Box p={3}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </div>
        );
    }

    return (
        <div className="portfolio">
            {/* Portfolio Summary Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>Portfolio Summary</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Available Balance</Typography>
                        <Typography variant="h4" color="primary">
                            {formatCurrency(portfolioDetails?.cash_balance || 0)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Total Holdings Value</Typography>
                        <Typography variant="h4" color="primary">
                            {formatCurrency(portfolioDetails?.total_value || 0)}
                        </Typography>
                    </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    * Estimated values are for reference only and do not constitute investment advice
                </Typography>
            </Paper>

            {/* Holdings Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography 
                    variant="h6" 
                    onClick={fetchHoldings}
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    Portfolio Holdings {showHoldings ? '▼' : '▶'}
                </Typography>
                {showHoldings && (
                    <Box mt={2}>
                        {loading.holdings ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Symbol</TableCell>
                                            <TableCell>Company</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Avg. Price</TableCell>
                                            <TableCell align="right">Current Price</TableCell>
                                            <TableCell align="right">Total Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {holdings.map((holding) => (
                                            <TableRow key={holding.holding_id}>
                                                <TableCell>{holding.symbol}</TableCell>
                                                <TableCell>{holding.company_name}</TableCell>
                                                <TableCell align="right">{holding.quantity}</TableCell>
                                                <TableCell align="right">{formatCurrency(holding.average_price)}</TableCell>
                                                <TableCell align="right">{formatCurrency(holding.current_price)}</TableCell>
                                                <TableCell align="right">{formatCurrency(holding.total_value)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Transactions Section */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography 
                    variant="h6" 
                    onClick={fetchTransactions}
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    Transaction History {showTransactions ? '▼' : '▶'}
                </Typography>
                {showTransactions && (
                    <Box mt={2}>
                        {loading.transactions ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Symbol</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.transaction_id}>
                                                <TableCell>
                                                    {new Date(transaction.transaction_date).toLocaleString()}
                                                </TableCell>
                                                <TableCell>{transaction.symbol}</TableCell>
                                                <TableCell>{transaction.transaction_type}</TableCell>
                                                <TableCell align="right">{transaction.quantity}</TableCell>
                                                <TableCell align="right">{formatCurrency(transaction.price)}</TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(transaction.quantity * transaction.price)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </Paper>
        </div>
    );
}

export default Portfolio;