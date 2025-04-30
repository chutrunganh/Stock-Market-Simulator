import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10; // Cost factor for bcrypt
import pool from '../config/dbConnect.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust based on relative depth

/**
 * This function handles user login. It checks if the provided email and password match a user in the database. After user logs in successfully, it returns the user object 
 * and Json Web Token (JWT) for authentication.
 * 
 * @param {*} email - the email of the user to be logged in
 * @param {*} password - the password of the user typed in the login form
 * @returns 
 *
 * In case we check the email first, if the email does not exits, throw an error, if the email exists, then hash the password and compare it with the hashed password in the database.
 * This is not a good practice because it can lead to timing attacks. An attacker can determine if an email exists in the database by measuring the time it takes to respond to 
 * the login request, like in case the web immediately respone, attacker can know that the email does not exist in the database, and if the web takes a long time to 
 * respond (since it  need to slow hash the provided password and compare it with the hashed password in the database), attacker can know that the email exists in the database.
 * 
 * To prevent this, always perfrom password hashing, even if the email does not exist in the database. This way, the time it takes to respond to the login request will be 
 * the same regardless of whether the email exists or not.
 */
export const loginUserService = async (email, password) => {
  try {
    // Fetch the user by email
    const result = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE email = $1',
      [email]
    );

    let user = result.rows[0];

    // Generate a fake hash
    const fakeHashedPassword = '$2b$10$abcdefghijklmnopqrstuv';  // A dummy bcrypt hash
    
    // Determine the hashed password to use for comparison
    const hashedPassword = user ? user.password : fakeHashedPassword; // Use the actual hashed password if user exists, otherwise use a dummy hash

    // ALWAYS perform input password hash and comparison, even if the email does not exist. The idea is we ALWAYS hash the password user input, incase the email 
    // exists, we compare with true hashed password, otherwise we compare with a fake hash to maintain timing attack resistance
    const isPasswordValid = await bcrypt.compare(password, hashedPassword ); 

    // If user does not exist or password is incorrect, return the same error message
    if (!user || !isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // If user authenticated successfully, generate JWT token
    // See more about JWT: https://youtu.be/fyTxwIa-1U0?si=9TshHtO-Hl3oiS4L, https://youtu.be/LxeYH4D1YAs?si=1lOsrVljX55OVXfH
    const userForToken = { // Define the user object to be included in the token
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Create JWT token with user info and secret key from environment variables
    const token = jwt.sign(
      userForToken,
      process.env.JWT_SECRET, // Fallback for development
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } // Fallback for development
    );

    // Return user info and token
    return {
      user: User.getSafeUser(user),
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * More info, How does bcrypt.compare work under the hood?
 * 
 * 1. It extracts the salt and cost factor from string of the hashed password.
 * 2. It hashes the user input password with the extracted salt and cost factor.
 * 3. It compares the newly hashed password with the stored hashed password. This comparison uses a
 * constant-time algorithm instead of naive === comparison to prevent timing attacks (This timming attack is mention about gesting the password one character at a time aspect, not 
 * for the timing attack in bruce force login name we mentione earlier).
 * 
 * Why using === comparison is not a good idea?
 * 
 * String comparision is JavaScript with === termiates as soon as it finds a mismatch. This means if two strings are not the same length or have 
 * an early mismatch, === stops immediately. An attacker can measure response time and gradually guess the correct password one character at a time.
 * 
 */



/**
 * This function finds an existing user by Google ID or creates a new one if it doesn't exist.
 * It also links an existing user account with the same email to the Google account.
 * 
 * @param {Object} userData - Data received from Google OAuth containing google_id, email, username
 * @returns {Object} - The user object and JWT token
 */
export const findOrCreateGoogleUserService = async (userData) => {
  const { google_id, email, username } = userData;
  
  try {
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // First check if user exists with this Google ID
      let result = await client.query(
        'SELECT id, username, email, role, google_id, created_at FROM users WHERE google_id = $1',
        [google_id]
      );
      
      let user = result.rows[0];
      
      // If no user found with Google ID, check if user exists with the same email
      if (!user) {
        result = await client.query(
          'SELECT id, username, email, role, google_id, created_at FROM users WHERE email = $1',
          [email]
        );
        
        user = result.rows[0];
        
        // If user exists with same email but no Google ID, link the accounts
        if (user) {
          result = await client.query(
            'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING id, username, email, role, google_id, created_at',
            [google_id, user.id]
          );
          
          user = result.rows[0];
        } 
        // If no user exists at all, create a new one
        else {
          result = await client.query(
            'INSERT INTO users (username, email, google_id, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, google_id, created_at',
            [username, email, google_id, 'user']
          );
          
          user = result.rows[0];
        }
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Generate JWT token
      const userForToken = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      const token = jwt.sign(
        userForToken,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      return {
        user: User.getSafeUser(user),
        token
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw new Error(`Error during Google authentication: ${error.message}`);
  }
};

/** 
 * For user register function, just use the userCreateService function in userCRUDService.js
 */