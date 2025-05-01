import express from 'express';
import { startTradingSession, stopTradingSession, getStatus } from '../controllers/tradingSessionController.js';

const router = express.Router();

// Route to start trading session
router.post('/startTrading', startTradingSession);

// Route to stop trading session
router.post('/stopTrading', stopTradingSession);

// Route to get trading session status
router.get('/status', getStatus);

export default router;
