import pool from './dbConnect.js';
import log from '../utils/loggerUtil.js';

const createStockTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS "stocks"(
        stock_id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL UNIQUE,
        company_name VARCHAR(100) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        market_cap DECIMAL(15,2) NOT NULL,
        description TEXT NOT NULL
    )`;

    try{
        if (process.env.NODE_ENV === 'development'){
            //drop the table to recreate
            await pool.query('DROP TABLE IF EXISTS "stocks" CASCADE');
        }
        await pool.query(queryText);
        
        if (process.env.NODE_ENV === 'development'){
            await seedStockTestData();
        }
    }
    catch(error){
        log.error('Error occurs when creating stock table:', error);
        throw new Error(error.message);
    }
};

const seedStockTestData = async () => {
    try{
        const queryText = `
        INSERT INTO stocks (symbol, company_name, industry, market_cap, description)
        VALUES
        ('AAPL', 'Apple Inc.', 'Technology', 2500000000000, 'Apple Inc. is an American multinational technology company that specializes in consumer electronics, computer software, and online services.'),
        ('GOOGL', 'Google Inc.', 'Technology', 1800000000000, 'Just Google.'),
        ('MSFT', 'Microsoft Corporation', 'Technology', 2900000000000, 'Microsoft develops, licenses, and supports software, services, devices, and solutions worldwide.'),
        ('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 1700000000000, 'Amazon is an American multinational technology company focusing on e-commerce, cloud computing, and AI.'),
        ('TSLA', 'Tesla Inc.', 'Automotive', 700000000000, 'Tesla designs, manufactures, and sells electric vehicles and energy storage solutions.'),
        ('META', 'Meta Platforms Inc.', 'Technology', 1100000000000, 'Meta builds technologies that help people connect, find communities, and grow businesses.'),
        ('NVDA', 'NVIDIA Corporation', 'Semiconductors', 2200000000000, 'NVIDIA is a global leader in GPUs for gaming, AI, and data centers.'),
        ('BRK.A', 'Berkshire Hathaway Inc.', 'Financials', 780000000000, 'Berkshire Hathaway is a multinational conglomerate holding company led by Warren Buffett.'),
        ('JPM', 'JPMorgan Chase & Co.', 'Financials', 450000000000, 'JPMorgan Chase is a leading global financial services firm and one of the largest banking institutions in the U.S.'),
        ('V', 'Visa Inc.', 'Financials', 500000000000, 'Visa is a world leader in digital payments, facilitating transactions between consumers, merchants, financial institutions, and governments.')`;
        await pool.query(queryText);
    }
    catch(error){
        log.error('Error adding test data for stocks table:', error);
    }
}

export default createStockTable;