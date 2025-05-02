import pool from './dbConnect.js';
import bcrypt from 'bcrypt';
import log from '../utils/loggerUtil.js';

const SALT_ROUNDS = 10;

const createUserTable = async () => {
  const queryText = ` 
    CREATE TABLE IF NOT EXISTS "users" (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Add role column with ENUM-like constraint
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHECK (password IS NOT NULL OR google_id IS NOT NULL) -- Ensure at least one authentication method
    )`;

    /**
     * The google_id column is used for Google SSO authentication.
     */

    /**
     * Why I use CHECK constraint instead of ENUM?
     * 1. Flexibility: CHECK constraints allow for more complex conditions and can be modified easily withoutneeding to 
     * alter the database schema.
     * 2. Simplier to implemet, maintain and also more portable across different databases systems.
     */

  try {
    // In production, you shouldn't drop tables on each startup
    // This is just for development convenience
    if (process.env.NODE_ENV === 'development') {
      await pool.query('DROP TABLE IF EXISTS "users" CASCADE');
    }
    
    await pool.query(queryText);
    //log.info('User table verified/created successfully');
    
  } 
  catch (error) {
    log.error('Error creating user table:', error);
    throw new Error(error.message);
  }
};

export default createUserTable;