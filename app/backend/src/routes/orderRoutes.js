import express from 'express';
import { createOrder, cancelOrder } from '../controllers/orderController.js';
import { getOrderBook } from '../controllers/orderBookController.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';
import  isTradingSessionMiddleware  from '../middlewares/tradingSessionMiddleware.js';
const router = express.Router();

// Route to create a new order - applies middleware in sequence
router.post('/createOrder', 
    authMiddleware,
    isTradingSessionMiddleware,
    createOrder);


// Route to cacel a specific order by ID
router.delete('/cancelOrder/:orderId', cancelOrder);

// Route to get the order book data
router.get('/orderBook', getOrderBook);

export default router;