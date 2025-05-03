import express from 'express';
import { createOrder, cancelOrder } from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';
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


// Route to cancel a specific order by ID
router.delete('/cancelOrder/:orderId', authMiddleware, cancelOrder); // Added authMiddleware

export default router;
