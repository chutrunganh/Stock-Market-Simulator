import express from 'express';
import { verifyPayment, getPaymentStatus } from '../controllers/paymentControllers.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';

const router = express.Router();

// Payment verification endpoint
router.post('/verify', authMiddleware, verifyPayment);

// Payment status endpoint
router.get('/status/:transactionId', authMiddleware, getPaymentStatus);

export default router; 