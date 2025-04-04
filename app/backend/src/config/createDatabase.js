import pkg from 'pg';
const { Pool } = pkg;

const createDatabase = async () => {
  // Connect to postgres database first to create our database
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    // Check if database exists
    const checkDb = await pool.query(
      "SELECT datname FROM pg_catalog.pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Database ${process.env.DB_NAME} does not exist, creating...`);
      // Need to use template0 to avoid "database is being accessed by other users" error
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME} TEMPLATE template0`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

export default createDatabase;