/** 
 * The userService.js file contains the service functions that handle the business logic, in this case 
 * is SQL queries, for the user-related operations. it interract with the database through ORM userModel.js
 * 
*/
import pool from '../config/dbConnect.js';
import User from '../models/userModel.js';


// This function is responsible for creating a new user in the database
export const createUserService = async (userData) => {
  const { username, email, password } = userData;
  
  try {
    // Debug log to see what data is being received
    console.log('Creating user with data:', { username, email, password: '***' });
    
    // Database operation
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password] // In production, password should be hashed before storage
    );
    
    return User.getSafeUser(result.rows[0]);
  } catch (error) {
    // More detailed error logging
    console.error('Full error details:', error);
    throw new Error(`Error creating user: ${error.message}`);
  }
};


// This function retrieves all users from the database
export const getAllUsersService = async () => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users');
    return result.rows;
  } catch (error) {
    throw new Error(`Error getting users: ${error.message}`);
  }
};



// This function retrieves a user by their ID from the database
export const getUserByIdService = async (id) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (!result.rows[0]) {
      throw new Error('User not found');
    }
    
    return User.getSafeUser(result.rows[0]);
  } catch (error) {
    throw error;
  }
};


// This function updates a user's information in the database
export const updateUserService = async (id, userData) => {
  const { username, email, password } = userData;
  
  try {
    // First check if user exists
    const user = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (!user.rows[0]) {
      throw new Error('User not found');
    }
    
    // Build the query dynamically based on what fields were provided
    let queryText = 'UPDATE users SET ';
    const queryParams = [];
    const updates = [];
    
    if (username !== undefined) {
      queryParams.push(username);
      updates.push(`username = $${queryParams.length}`);
    }
    
    if (email !== undefined) {
      queryParams.push(email);
      updates.push(`email = $${queryParams.length}`);
    }
    
    if (password !== undefined) {
      queryParams.push(password);
      updates.push(`password = $${queryParams.length}`);
    }
    
    queryText += updates.join(', ');
    queryParams.push(id);
    queryText += ` WHERE id = $${queryParams.length} RETURNING id, username, email, created_at`;
    
    const result = await pool.query(queryText, queryParams);
    return User.getSafeUser(result.rows[0]);
  } catch (error) {
    throw error;
  }
};


// This function deletes a user from the database by their ID
export const deleteUserService = async (id) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, email, created_at',
      [id]
    );
    
    if (!result.rows[0]) {
      throw new Error('User not found');
    }
    
    return User.getSafeUser(result.rows[0]);
  } catch (error) {
    throw error;
  }
};