import pool from './dbConnect.js';

const createUserTable = async () => {
  const queryText = ` 
    CREATE TABLE IF NOT EXISTS "users" (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  try {
    // In production, you shouldn't drop tables on each startup
    // This is just for development convenience
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Recreating user table');
      await pool.query('DROP TABLE IF EXISTS "users" CASCADE');
    }
    
    await pool.query(queryText);
    console.log('User table verified/created successfully');
    
    // Seed some test data if in development mode
    if (process.env.NODE_ENV === 'development') {
      await seedTestData();
    }
  } 
  catch (error) {
    console.error('Error creating user table:', error.message);
    throw new Error(error.message);
  }
};

// Optional seeding function for development
const seedTestData = async () => {
  try {
    const seedQuery = `
      INSERT INTO users (username, email, password)
      VALUES 
        ('TestUser', 'test@example.com', 'password123'),
        ('AdminUser', 'admin@example.com', 'admin123')
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(seedQuery);
    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error.message);
  }
};

export default createUserTable;