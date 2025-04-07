import express from 'express';
import { createOrder, getOrderById, getAllOrders } from '../controllers/orderController.js';

const router = express.Router();

// Route to create a new order
router.post('/createOrder', createOrder);

export default router;