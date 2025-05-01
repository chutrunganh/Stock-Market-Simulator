import { activateTradingSession, deactivateTradingSession, isTradingSessionActiveStatus } from '../services/tradingSessionService.js';

export const startTradingSession = (req, res) => {
    try {
        activateTradingSession();
        res.status(200).json({ success: true, message: 'Trading session started.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start trading session.', error: error.message });
    }
};

export const stopTradingSession = (req, res) => {
    try {
        deactivateTradingSession();
        res.status(200).json({ success: true, message: 'Trading session stopped.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to stop trading session.', error: error.message });
    }
};

export const getStatus = (req, res) => {
    const isActive = isTradingSessionActiveStatus();
    res.status(200).json({ isActive });
};
