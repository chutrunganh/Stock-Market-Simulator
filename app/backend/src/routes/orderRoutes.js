import express from 'express';
import { createOrder, createArtificialOrder, cancelOrder } from '../controllers/orderController.js';
import { getOrderBook, orderBookSSE } from '../controllers/orderBookController.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';
import isTradingSessionMiddleware from '../middlewares/tradingSessionMiddleware.js';
import { validateOrder } from '../middlewares/orderMiddleware.js';
import { requireAdminRole } from '../middlewares/roleBasedAccessControlMiddleware.js';

const router = express.Router();

// Create order - any authenticated user can create orders
router.post('/createOrder', 
    authMiddleware,
    isTradingSessionMiddleware,
    validateOrder,
    createOrder
);

// Create artificial order - admin only and no validations
router.post('/createArtiOrder',
    authMiddleware,
    requireAdminRole,
    createArtificialOrder
);

// Public routes - anyone can view order book
router.get('/orderBook', getOrderBook);
router.get('/orderBook/stream', orderBookSSE);

// Cancel order - authenticated users can cancel their own orders
router.delete('/cancelOrder/:orderId', 
    authMiddleware,
    cancelOrder
);

export default router;