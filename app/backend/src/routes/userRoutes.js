/**
 * @file userRoutes.js
 * @description This file defines the routes for user-related operations in the application like CRUD, login, and registration.
 */

import express from 'express';
import { registerUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } from '../controllers/userControllers.js';
import { validateUser, validateUserUpdate, validateLogin } from '../middlewares/inputValidationMiddleware.js';
import authorizeRole from '../middlewares/roleBasedAccessControlMiddleware.js';
import authMiddleware from '../middlewares/authenticationMiddleware.js';


const router = express.Router();

// Routes realted to user operations arranged in privileged order

// 1. Public routes (no authentication required)
router.get("/", (req, res) => {}); // Placeholder for homepage route
router.post("/register", validateUser, registerUser); // Register a new user
router.post("/login", validateLogin, loginUser);  // User login



// 2.Protected routes (authentication required)
router.get("/profile", authMiddleware, (req, res) => {}); // Placeholder for user profile route
router.post("/logout", authMiddleware, (req, res) => {}); // Placeholder for user logout route

// 3. Protected routes (authentication required) + Authorization (admin role required)
router.get("/admin/dashboard", authMiddleware, authorizeRole('admin'), (req, res) => {}); // Placeholder for admin dashboard route
router.put("/admin/user/:id", validateUserUpdate, authMiddleware, authorizeRole('admin'), updateUser); // Update an user account based on a ID
router.get("/admin/users", authMiddleware, authorizeRole('admin'), getAllUsers); // List all users
router.get("/admin/user/:id", authMiddleware, authorizeRole('admin'),  getUserById); // View a user account based on a ID
router.delete("/admin/user/:id", authMiddleware, authorizeRole('admin'), deleteUser); // Delete a user account based on a ID

export default router;