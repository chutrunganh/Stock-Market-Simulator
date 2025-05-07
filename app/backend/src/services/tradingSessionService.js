/**
 * This service is responsible for managing the trading session, which includes:
 * - activating and deactivating the trading session (admin will use this function to control the trading session)
 * - checking if the trading session is active or not
 */

// --- Logging ---
import log from '../utils/loggerUtil.js';

let isTradingSessionActive = true; // By default when the server starts, the trading session is active

export const activateTradingSession = () => {
    isTradingSessionActive = true;
    log.info('Trading session started.');
};

export const deactivateTradingSession = () => {
    isTradingSessionActive = false;
    log.info('Trading session stopped.');
};

export const isTradingSessionActiveStatus = () => {
    return isTradingSessionActive;
};
