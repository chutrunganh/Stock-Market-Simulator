/**
 * @file userRoutes.js
 * @description This file defines the routes for user-related operations in the application like CRUD, login, and registration.
 */

import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userControllers.js';
import { validateUser, validateUserUpdate } from '../middlewares/inputValidation.js';
import authorizeRole from '../middlewares/roleBasedAccessControl.js';

const router = express.Router();

// CRUD operations for user management
router.post("/user", validateUser, createUser); // Validate user input with middleware before creating a new user, then
// call the controller function to create a new user
router.get("/user", getAllUsers);
router.get("/user/:id", getUserById);
router.put("/user/:id", validateUserUpdate, updateUser); // Validate user input with middleware before updating a user
router.delete("/user/:id", authorizeRole('admin'), deleteUser); // use middleware to authorize only admin can access this route

// Authentication routes
router.post("/user/register", validateUser, createUser); // Same as createUser function
router.post("/user/login", validateUser, loginUser); // Validate user input with middleware before logging in a user


export default router;