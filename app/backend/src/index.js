import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
dotenv.config({ path: '../../.env' }); // Adjust based on relative depth
import pool from './config/dbConnect.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import errorHandling from './middlewares/errorHandlerMiddleware.js';
// Updated import path for createUserTable
import createUserTable from './config/createUserTable.js';
// Import passport configuration
import configurePassport from './config/passportConfig.js';
// Import Google OAuth controllers
import { googleAuth, googleAuthCallback } from './controllers/userControllers.js';
import  createPortfolioTable  from './config/createPortfolioTable.js';
import createTransactionTable from './config/createTransactionTable.js';
import createStockTable from './config/createStockTable.js';
import createStockPriceTable from './config/createStockPriceTable.js';
import createHoldingTable from './config/createHoldingTable.js';
// import {getStockBySymbolService} from './services/stockService.js';
// import {getStockPricesByStockIdService} from './services/stockPriceService.js';

// Create express app
const app = express();
const port = process.env.BE_PORT || 3000;

// Middlewares
app.use(express.json());
// Configure CORS
// REMEBER TO CHANGE THE CROS ORIGIN BACK TO YOUR FRONTEND URL WHEN DEPLOYING, 
// Idealy, defined the origin in the .env file and use it here.
// See more about cros in this link: https://youtu.be/FggsjTsJ7Hk?si=Cwp0EzYCwREDtG7R , 
// https://youtu.be/E6jgEtj-UjI?si=lmJzdVFbUFbnRXsZ, https://200lab.io/blog/cors-la-gi
app.use(cors({
  origin: '*', // Allow all origins while testing
  credentials: true // Important for cookies to work with CORS
}));
app.use(cookieParser()); // Add cookie-parser middleware
// Initialize and configure Passport
const passportInstance = configurePassport();
app.use(passport.initialize());

// TESTING: test PostgreSQL connection
app.get('/testdb', async (req, res) => {
    try {
        const result = await pool.query('SELECT current_database()');
        res.send('The current database is: ' + result.rows[0].current_database);
    } catch (error) {
        res.status(500).send('Database connection error: ' + error.message);
    }
});

// Define Google OAuth routes at the root level to match the callback URL in Google Cloud Console
// Two routes will not have prefix /api as other routes since it is not our own API, but Google API
// when user click on "Login with Google" button in frontend, they will be forward to  uor backend endpoint /auth/google
app.get('/auth/google', googleAuth);
app.get('/auth/google/callback', googleAuthCallback);

// Routes
app.use('/api', userRoutes);
app.use('/api', orderRoutes);

// Error handling middleware
app.use(errorHandling);

// Initialize tables in the database
const initializeDatabase = async () => {
  try {
    
    // Then create tables
    await createUserTable();
    await createPortfolioTable();
    //await createTransactionTable();
    await createStockTable();
    await createStockPriceTable();
    await createHoldingTable();
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1); // Exit with error
  }
};

// Start server after database initialization
const startServer = async () => {
    await initializeDatabase();

    
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();