/**
 * Controller fucntions are responsible for extracting data from the request, calling and passing data to the service functions, and 
sending the response back to the client. They should not contain any business logic or database queries. The service 
functions will be responsible for those tasks.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust based on relative depth
import { createUserService, getAllUsersService, getUserByIdService, updateUserService, deleteUserService, loginUserService } from '../services/userService.js';
import passport from 'passport';

// Standardized response format
const handleResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    status,
    message,
    data,
  });
}

// Add 'next' parameter to all controller functions to pass to error handler middleware
export const registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        const newUser = await createUserService({ username, email, password }); // Call to service function in userService.js
        handleResponse(res, 201, 'User created successfully', newUser);
    }
    catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, 'List of users', users);
    }
    catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}

export const getUserById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await getUserByIdService(id);  // Call to service function in userService.js
        if (!user) {
            return handleResponse(res, 404, 'User not found');
        }
        handleResponse(res, 200, 'User found', user);
    }
    catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}

export const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const updatedUser = await updateUserService(id, { username, email, password });  // Call to service function in userService.js
        if (!updatedUser) {
            return handleResponse(res, 404, 'User not found');
        }
        handleResponse(res, 200, 'User updated successfully', updatedUser);
    }
    catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}

export const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedUser = await deleteUserService(id);  // Call to service function in userService.js
        if (!deletedUser) {
            return handleResponse(res, 404, 'User not found');
        }
        handleResponse(res, 200, 'User deleted successfully', deletedUser);
    }
    catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await loginUserService(email, password); // Call to service function in userService.js
        
        // Put the JWT token in a cookie to return to the client
        // The cookie will be sent back to the client in the response headers
        res.cookie('jwt', result.token, {
            httpOnly: true, // Prevents JavaScript from reading the cookie (XSS protection)
            secure: process.env.NODE_ENV === 'production', // Cookie can only be sent over HTTPS in production, in development it can be sent over HTTP
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict' // Prevents the cookie from being sent in cross-site requests
        });
        
    
        handleResponse(res, 200, 'Login successful', { user: result.user });
    
    }
    catch (error) {
        next(error); // Pass error to the error handler middleware
    }
}


// Initiate Google OAuth authentication, no need to call to any services since this is handled by Passport.js
export const googleAuth = (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  };
  
// Handle Google OAuth callback, no need to call to any services since this is handled by Passport.js
export const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        if (err) {
            return next(err);
        }
        
        if (!user) {
            return handleResponse(res, 401, 'Google authentication failed');
        }
        
        try {
            // Put the JWT token in a cookie
            res.cookie('jwt', user.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'strict'
            });
            
            // For easy testing, return the token in the response as well
            if (process.env.NODE_ENV === 'development') {
                return handleResponse(res, 200, 'Google authentication successful', {
                    user: user.user,
                    token: user.token, // Include token for testing
                    message: 'Copy this token for testing protected routes'
                });
            }
            
            // In production, redirect to frontend
            res.redirect(process.env.FE_URL || 'http://localhost:3000');
        } catch (error) {
            next(error);
        }
    })(req, res, next);
};