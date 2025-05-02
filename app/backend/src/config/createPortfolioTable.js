/**
 * @file createPortfolioTable.js
 * @description This file contains the function to create the portfolio table in the database.
 * This table will be initialized with empty data. Only when a new user is created in user table -> trigger a corresponding portfolio created
 * in the portfolio table, see implementation in userCRUDService.js for more details.
 */
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
    }
    catch(error){
        log.error('\nError occurs when creating portfolios table:', error);
        throw new Error(error.message);
    }
};


export default createPortfolioTable;