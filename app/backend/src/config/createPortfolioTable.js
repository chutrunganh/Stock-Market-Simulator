import pool from './dbConnect.js';
import log from '../utils/loggerUtil.js';

const createPortfolioTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS "portfolios"(
        portfolio_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        cash_balance DECIMAL(15,2) DEFAULT 100000.00,
        total_value DECIMAL(15,2) DEFAULT 100000.00,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
    try{
        if (process.env.NODE_ENV === 'development'){
            //drop the table to recreate
            await pool.query('DROP TABLE IF EXISTS "portfolios" CASCADE');
        }
        
        await pool.query(queryText);
        //console.log('\nPortfolios table created successfully');

        if (process.env.NODE_ENV === 'development'){
            await seedPortfolioTestData();
        }

    }
    catch(error){
        log.error('\nError occurs when creating portfolios table:', error);
        throw new Error(error.message);
    }
};
const seedPortfolioTestData = async () => {
    try{
        // No need to seed anymore, since with each new user created, a portfolio is created for them automatically
    }
    catch(error){
        log.error('Error adding test data for portfolios table:', error);
    }
}

export default createPortfolioTable;