import { isTradingSessionActiveStatus } from '../services/tradingSessionService.js';

const isTradingSessionMiddleware = (req, res, next) => {
    if (!isTradingSessionActiveStatus()) {
        return res.status(200).json({ success: false, message: 'Trading is currently closed.' });
    }
    next();
};

export default isTradingSessionMiddleware;
