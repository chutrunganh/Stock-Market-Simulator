/** 
 * The userService.js file contains the service functions that handle the business logic, in this case 
 * is SQL queries, for the user-related operations. it interract with the database through ORM userModel.js
 * 
 * When writing SQL queries, it's important to use $1, $2, etc. as placeholders for parameters to prevent SQL injection attacks.
*/
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10; // Cost factor for bcrypt
import pool from '../config/dbConnect.js';
import User from '../models/userModel.js';

/**
 * To store the password securely, we use bcrypt to hash the password before storing it in the database. How does bcrypt work?
 * 
 * 1. It auto generates a random salt, concatenates it with the password, and then hashes the result. This will prevent attackers from 
 * using precomputed hash tables (rainbow tables) to crack the password.
 * 
 * 2. bycrpyt use slow hashing algorithm, which makes it computationally expensive to brute-force the password. The cost factor (SALT_ROUNDS) determines how many 
 * iterations of the hashing algorithm are performed. A higher cost factor means more iterations, making it harder to crack the password. In the code, we
 * use 10 rounds which tells bcrypt to perform 2^10 iterations of the hashing algorithm. The larger the number of rounds, the more secure the hash is, but it also requires
 * more hardware resources to compute. As OWASP recommends, a cost factor should be at least 10.
 * 
 * So in theory, when user register, the process would be: hash(password_user_input + salt), we store this result in the database. When the user 
 * tries to log in, take in the password they entered, hash it again with the SAME salt, and compare the result to the stored hash. This means we need to store 
 * both the hashed password and the salt in the database corresponding to user account. However, in practicular, we do not need to create another field in the database or write any code to store the salt, brypt 
 * automaticaly handles that under the hood. For more detail, bycrypt auto includes the salt in the output string itself, so when you hash a password, the output will include both the salt and the 
 * hash. The output string is something like this:
 * 
 * $2a$10$abcdefghijklmnopqrstuu3guuo/XeYbYBk7Zenk4Yf9XuYoeZ4JWD
 * 
 * With:
 * - $2a$: The bcrypt version identifier.
 * - $10$: The cost factor (SALT_ROUNDS).
 * - abcdefghijklmnopqrstuu: The salt used for hashing (22 characters).
 * - 3guuo/XeYbYBk7Zenk4Yf9XuYoeZ4JWD: The actual hashed password.
 * 
 */


// This function is responsible for creating a new user in the database
export const createUserService = async (userData) => {
  const { username, email, password } = userData;
  
  try {

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Debug log to see what data is being received
    console.log('Creating user with data:', { username, email, password: '***' });
    
    // Database operation
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword] 
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
      // Hash the password before updating
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      queryParams.push(hashedPassword);
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

// This function checks for user login credentials
/**
 * Incase we check the email first, if the email does not exits, throw an error, if the email exists, then hash the password and compare it with the hashed password in the database.
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
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email]
    );

    let user = result.rows[0];

    // Generate a fake hash
    const fakeHashedPassword = '$2b$10$abcdefghijklmnopqrstuv';  // A dummy bcrypt hash
    
    // Determind the hashed password to use for comparison
    const hashedPassword = user ? user.password : fakeHashedPassword; // Use the actual hashed password if user exists, otherwise use a dummy hash

    // ALWAYS perform input password hash and comparison, even if the email does not exist
    // The idea is we ALWAYS hash the password user input, incase the email exists, we compare with true hashed password, otherwise we compare with a fake hash to 
    // maintain timing attack resistance
    const isPasswordValid = await bcrypt.compare(password, hashedPassword); // bycrypt.compare 

    // If user does not exist or password is incorrect, return the same error message
    if (!user || !isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return User.getSafeUser(user);
  } catch (error) {
    throw error;
  }
};

/**
 * How does bcrypt.compare work under the hood?
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