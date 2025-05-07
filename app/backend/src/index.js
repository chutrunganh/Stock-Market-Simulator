// ====== External Dependencies ======
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';

// ====== Internal Dependencies ======

// --- Config Files ---
dotenv.config({ path: '../../.env' }); // Load environment variables
import configurePassport from './config/passportConfig.js';

// --- Logging ---
import log from './utils/loggerUtil.js';

// --- Database Connection and Table Creation ---
import pool from './config/dbConnect.js'; // PostgreSQL connection pool
import createUserTable from './config/createUserTable.js';
import createPortfolioTable from './config/createPortfolioTable.js';
import createTransactionTable from './config/createTransactionTable.js';
import createStockTable from './config/createStockTable.js';
import createStockPriceTable from './config/createStockPriceTable.js';
import createHoldingTable from './config/createHoldingTable.js';
import {getStockBySymbolService} from './services/stockService.js';
import {getStockPricesByStockIdService} from './services/stockPriceService.js';
import stockPriceRoutes from './routes/stockPriceRoutes.js';

// --- Routes ---
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tradingSessionRoutes from './routes/tradingSessionRoutes.js';
import stockRoutes from './routes/stockRoutes.js';

;

// --- Middlewares ---
import errorHandling from './middlewares/errorHandlerMiddleware.js';

// --- Controllers ---
import { googleAuth, googleAuthCallback } from './controllers/userControllers.js';

// ===== Initialize Express App ======
const app = express();
const port = process.env.BE_PORT || 3000;

// --- Middleware Configuration ---
app.use(express.json()); // Parse JSON request bodies

// --- CORS Configuration --
// Configure CORS with support for SSE
app.use((req, res, next) => {  // Special handling for SSE endpoint
  if (req.path === '/api/orders/orderBook/stream') {
    res.setHeader('Access-Control-Allow-Origin', process.env.FE_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
  }
  next();
});

// Regular CORS configuration for other routes
app.use(cors({
  origin: process.env.FE_URL, // Allow frontend origin
  credentials: true, // Important for cookies to work with CORS
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type']
}));

// Add headers specifically for SSE connections
app.use((req, res, next) => {
  // Check if the request is for SSE
  if (req.path === '/api/orders/orderBook/stream') {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx
    res.setHeader('Connection', 'keep-alive');
  }
  next();
});

app.use(cookieParser()); // Add cookie-parser middleware

// --- Google OAuth Configuration ---
const passportInstance = configurePassport();
app.use(passport.initialize());


// --- API Routes ---
// Mount routes
app.use('/api', userRoutes); // Changed from '/api/auth' to '/api' to match frontend paths
app.use('/api/orders', orderRoutes);
app.use('/api/trading-session', tradingSessionRoutes);
app.use('/api/stocks', stockRoutes)


// --- Error Handling Middleware ---
// This should be the last middleware in the stack
// It will catch any errors that occur in the routes or other middlewares
// Routes
app.use('/api', userRoutes);
app.use('/api', stockPriceRoutes);
// Error handling middleware
app.use(errorHandling);

// --- Initialize All Database Tables ---
const initializeDatabase = async () => {  try {
    // Create tables in proper dependency order
    await createUserTable();         // First create users
    await createPortfolioTable();    // Portfolios depend on users
    await createStockTable();        // Create stocks before stock-related tables
    await createStockPriceTable();   // StockPrices depend on stocks
    await createTransactionTable();  // Transactions depend on stocks and portfolios
    await createHoldingTable();      // Holdings depend on stocks and portfolios
    
    log.info('All tables initialized successfully!');
  } catch (error) {
    log.error('Tables in database initialization failed', { error });
    process.exit(1); // Exit with error
  }
};

// Start server after database initialization
const startServer = async () => {
    await initializeDatabase();
    
    app.listen(port, () => {
        log.info(`Server is running on port ${port}`);
        log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();