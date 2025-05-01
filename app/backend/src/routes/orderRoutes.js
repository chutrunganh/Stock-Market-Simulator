import express from 'express';
import { createOrder, createArtificialOrder, cancelOrder } from '../controllers/orderController.js';
import { getOrderBook, getOrderBookUpdates } from '../controllers/orderBookController.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';
import authorizeRole from '../middlewares/roleBasedAccessControlMiddleware.js';
import  isTradingSessionMiddleware  from '../middlewares/tradingSessionMiddleware.js';
const router = express.Router();

// Route to create a new order - applies middleware in sequence
router.post('/createOrder', 
    authMiddleware,
    isTradingSessionMiddleware,
    createOrder);   
//only allow for admin
//and only open in trading session
router.post('/createArtiOrder',
    isTradingSessionMiddleware,
    createArtificialOrder);
// Route to cacel a specific order by ID
router.delete('/cancelOrder/:orderId', cancelOrder);

// Route to get the order book data
router.get('/orderBook', getOrderBook);

// Route to get order book updates since a specific timestamp
router.get('/orderBook/updates', getOrderBookUpdates);

export default router;