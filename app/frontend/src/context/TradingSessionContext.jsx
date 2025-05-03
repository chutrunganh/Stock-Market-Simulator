/**
 * @file TradingSessionContext.jsx
 * @description This file contains the context for managing the trading session state throughout the application.
 * Every other componet if want to check the trading session status, import this file and use the context.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TradingSessionContext = createContext();

export function TradingSessionProvider({ children }) {
    const [isTradingActive, setIsTradingActive] = useState(false);

    const checkTradingStatus = async () => {
        try {
            const response = await axios.get('/api/tradingSession/status');
            setIsTradingActive(response.data.isActive);
        } catch (error) {
            console.error('Failed to fetch trading session status:', error);
        }
    };

    useEffect(() => {
        checkTradingStatus();
        const interval = setInterval(checkTradingStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const startTrading = async () => {
        try {
            await axios.post('/api/tradingSession/startTrading');
            setIsTradingActive(true);
        } catch (error) {
            console.error('Failed to start trading session:', error);
        }
    };

    const stopTrading = async () => {
        try {
            await axios.post('/api/tradingSession/stopTrading');
            setIsTradingActive(false);
        } catch (error) {
            console.error('Failed to stop trading session:', error);
        }
    };

    return (
        <TradingSessionContext.Provider value={{ 
            isTradingActive, 
            startTrading, 
            stopTrading 
        }}>
            {children}
        </TradingSessionContext.Provider>
    );
}

export function useTradingSession() {
    const context = useContext(TradingSessionContext);
    if (!context) {
        throw new Error('useTradingSession must be used within a TradingSessionProvider');
    }
    return context;
}

export default TradingSessionContext;
