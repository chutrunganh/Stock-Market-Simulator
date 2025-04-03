import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import pool from './config/dbConnect.js';
import userRoutes from './routes/userRoutes.js';
import errorHandling from './middlewares/errorHandler.js';
import createDatabase from './config/createDatabase.js';
import createUserTable from './config/createUserTable.js';
import createTransactionTable from './config/createTransactionTable.js';
import createStockTable from './config/createStockTable.js';
import createStockPriceTable from './config/createStockPriceTable.js';
import createPortfolioTable from './config/createPortfolioTable.js';
import createHoldingTable from './config/createHoldingTable.js';
import { getStockPricesByStockIdService } from './services/stockPriceService.js';
import { getStockBySymbolService } from './services/stockService.js';
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', userRoutes);

// Error handling middleware
app.use(errorHandling);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    // First create database if it doesn't exist
    await createDatabase();
    
    // Then create tables
    await createUserTable();
    await createPortfolioTable();
    await createTransactionTable();
    await createStockTable();
    await createStockPriceTable();
    await createHoldingTable();
    
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};
const testStockPriceService = async() =>{
  const stock_symbol = "AAPL";
  const stock = await getStockBySymbolService(stock_symbol);
  const stock_id = stock.stock_id;
  try {
    const stockPrices = await getStockPricesByStockIdService(stock_id);
    console.log('Stock Prices:', stockPrices);
  } catch (error) {
      console.error('Error fetching stock prices:', error.message);
  }
};
// Start server after database initialization
const startServer = async () => {
  await initializeDatabase();
  await testStockPriceService();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();