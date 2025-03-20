/**
 * Filename: app.js
 * Description: Entry point for the backend application.
 * 
 * This file will setup and initialize:
 * - Environment variables
 * - Database connection
 * - Middleware
 * - Routes
 * 
 * Workflow of the backend:
 * 1. app.js starts the server to listen on a port.
 * 2. When a request is received:
 *    - It first goes through the middleware for checking, validating, ...
 *    - Then it goes to the routes.
 *    - The route will trigger the corresponding controller function.
 *    - The controller function extracts data from the request, calls and passes those data to service functions.
 *    - The service functions execute actual business logic and may interact with database objects defined inside the models folder.
 *    - The service function returns data to the controller.
 *    - The controller converts data to JSON and sends it back to the client.
 * 
 * Middlleware -> Routes -> Controller -> Service -> Model -> Service -> Controller -> Middleware (optional) -> Response
 * 
 */
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // For handling cookies
const cors = require('cors'); // For handling CORS
const authRoutes = require('./routes/authRoutes'); // Import routes
const roleRoutes = require('./routes/roleRoutes'); // Import role routes
const User = require('./models/userModel'); // Import User model

// Load env vars - fix the syntax for dotenv config
dotenv.config({ path: '../../.env' });

// Debug to check if the environment variable is loaded correctly
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const dbConnect = require('./config/dbConnect');

// Connect to MongoDB
dbConnect();

const app = express();

// Middleware
// Global middlewares - applied to all routes
app.use(express.json()); // Middleware for parsing JSON bodies
app.use(cookieParser()); // Middleware for parsing cookies
app.use(cors()); // Middleware for handling CORS

// Logging middleware - custom middleware applied globally
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next(); // Important! This passes control to the next middleware
});

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/roles', roleRoutes); // Role-based routes

// Error handling middleware - this should be the last middleware, do no re order this
// This will catch any errors and return a 500 status code
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
