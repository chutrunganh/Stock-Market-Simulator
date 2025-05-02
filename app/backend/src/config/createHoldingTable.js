import pool from './dbConnect.js'
import log from '../utils/loggerUtil.js';

const createHoldingTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS "holdings"(
        holding_id SERIAL PRIMARY KEY,
        portfolio_id INT NOT NULL,
        stock_id INT NOT NULL,
        quantity INT,
        average_price DECIMAL(10,2),
        CONSTRAINT holdings_portfolio UNIQUE(portfolio_id, stock_id),
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE
    )`;

    try{
        if(process.env.NODE_ENV === 'development'){
            //drop the table to recreate
            await pool.query('DROP TABLE IF EXISTS "holdings" CASCADE');
        }
        await pool.query(queryText);
    }
    catch(error){
        log.error('\nError occurs when creating holdings table:', error.message);
        throw new Error(error.message);
    }
};


export default createHoldingTable;