// filepath: c:\Users\Chu Trung Anh\Desktop\Project\Product\Stock-Market-Simulator\app\backend\src\routes\devRoutes.js
import express from 'express';
import { addSampleOrderBookData } from '../controllers/devController.js';

const router = express.Router();

// Development route to add sample data
router.post('/addSampleOrderBookData', addSampleOrderBookData);

export default router;
