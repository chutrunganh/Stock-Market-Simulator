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
    await createTransactionTable();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
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