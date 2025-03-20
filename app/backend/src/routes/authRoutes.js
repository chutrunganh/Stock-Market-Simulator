/**
 * Filename: authRoutes.js
 * Description: This file contains the routes for user authentication including registration and login.
 */

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middlewares/validationMiddleware');

// Auth routes with validation middleware
// A request must first go through the validation middleware before reaching the route handler
// See these middleware functions in app/backend/src/middlewares/validationMiddleware.js
// The router take the endpoint and call the corresponding controller function
// See these controller functions in app/backend/src/controllers/authController.js
// Middeleware -> Routes (we are here) -> Controller 
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Export the router so that it can be used in app.js
module.exports = router;