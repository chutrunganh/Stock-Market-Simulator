import express from 'express';
import { startArtificialOrders, stopArtificialOrders, getArtificialOrdersStatus } from '../controllers/adminControllers.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';
import authorizeRole from '../middlewares/roleBasedAccessControlMiddleware.js';

const router = express.Router();

// Artificial Orders Management Routes
router.post('/artificial-orders/start', authMiddleware, authorizeRole('admin'), startArtificialOrders);
router.post('/artificial-orders/stop', authMiddleware, authorizeRole('admin'), stopArtificialOrders);
router.get('/artificial-orders/status', authMiddleware, authorizeRole('admin'), getArtificialOrdersStatus);

export default router; 