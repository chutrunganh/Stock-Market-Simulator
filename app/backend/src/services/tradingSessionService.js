// --- Logging ---
import log from '../utils/loggerUtil.js';

let isTradingSessionActive = false;

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
