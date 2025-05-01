// filepath: c:\Users\Chu Trung Anh\Desktop\Project\Product\Stock-Market-Simulator\app\backend\src\services\stockTableService.js
import pool from '../config/dbConnect.js';

export const getStocksWithReferencePrices = async () => {
    try {
        // Get all stocks with their latest closing prices by joining stocks and stockprices tables
        const result = await pool.query(`
            WITH LatestPrices AS (
                SELECT DISTINCT ON (stock_id) 
                    stock_id,
                    close_price,
                    date
                FROM stockprices
                ORDER BY stock_id, date DESC
            )
            SELECT 
                s.stock_id,
                s.symbol,
                s.company_name,
                lp.close_price as reference_price,
                lp.date as price_date,
                ROUND(lp.close_price * 1.1, 2) as ceiling_price,
                ROUND(lp.close_price * 0.9, 2) as floor_price
            FROM stocks s
            LEFT JOIN LatestPrices lp ON s.stock_id = lp.stock_id
            ORDER BY s.symbol;
        `);

        if (!result.rows.length) {
            console.warn('No stocks found in database');
            return [];
        }

        return result.rows;
    } catch (error) {
        console.error('Error fetching stocks with reference prices:', error);
        throw error;
    }
};
