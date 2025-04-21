import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config({ path: '../../.env' }); // Adjust based on relative depth
import pool from './config/dbConnect.js';
import userRoutes from './routes/userRoutes.js';
import errorHandling from './middlewares/errorHandlerMiddleware.js';
// Updated import path for createUserTable
import createUserTable from './config/createUserTable.js';
import './config/passportConfig.js';

// Create express app
const app = express();
const port = process.env.PORT || 3000;

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

// TESTING: test PostgreSQL connection
app.get('/testdb', async (req, res) => {
    try {
        const result = await pool.query('SELECT current_database()');
        res.send('The current database is: ' + result.rows[0].current_database);
    } catch (error) {
        res.status(500).send('Database connection error: ' + error.message);
    }
});

// Routes
app.use('/api', userRoutes);

// Error handling middleware
app.use(errorHandling);

// Initialize database tables
const initializeDatabase = async () => {
    try {
        await createUserTable();
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