import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userControllers.js';
import { validateUser, validateUserUpdate } from '../middlewares/inputValidation.js';

const router = express.Router();

router.post("/user", validateUser, createUser); // Validate user input with middleware before creating a new user
router.get("/user", getAllUsers);
router.get("/user/:id", getUserById);
router.put("/user/:id", validateUserUpdate, updateUser);
router.delete("/user/:id", deleteUser);

export default router;