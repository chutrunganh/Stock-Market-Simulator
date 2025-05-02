import express from 'express';
import { createOrder, createArtificialOrder, cancelOrder } from '../controllers/orderController.js';
import { getOrderBook, getOrderBookUpdates } from '../controllers/orderBookController.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';
import authorizeRole from '../middlewares/roleBasedAccessControlMiddleware.js';
import isTradingSessionMiddleware from '../middlewares/tradingSessionMiddleware.js';
import { validateOrder } from '../middlewares/orderMiddleware.js'; // Import the combined validator
import pool from '../config/dbConnect.js'; // Import pool for database connection

const router = express.Router();

// Route to create a new order - applies middleware in sequence
router.post('/createOrder',
    authMiddleware,
    isTradingSessionMiddleware,
    validateOrder, // Add the combined validation middleware here
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



// Route to cancel a specific order by ID
router.delete('/cancelOrder/:orderId', authMiddleware, cancelOrder); // Added authMiddleware

export default router;
