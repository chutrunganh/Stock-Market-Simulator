import pool from '../config/dbConnect.js';
import StockPrices from '../models/stockPriceModel.js';

// Add a new stock price to the stockprices table
export const createStockPriceService = async (stockpriceData) => {
    const {stock_id, date, open_price, high_price, low_price, close_price, volume} = stockpriceData;
    try{
        console.log("Create stock price:", {stock_id, date, open_price, high_price, low_price, close_price, volume});
        const result = await pool.query(
            'INSERT INTO stockprices (stock_id, date, open_price, high_price, low_price, close_price, volume) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [stock_id, date, open_price, high_price, low_price, close_price, volume]
        );
        return StockPrices.getStockPrices(result.rows[0]);
    }
    catch(error){
        console.error('Error when create stock price:', error.message);
        throw new Error(error.message);
    }
};

// Get latest stock prices with additional stock information
export const getLatestStockPriceByStockIdService = async (stockId = null) => {
    try {
        const query = `
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
                lp.date as price_date
            FROM stocks s
            LEFT JOIN LatestPrices lp ON s.stock_id = lp.stock_id
            ${stockId ? 'WHERE s.stock_id = $1' : ''}
            ORDER BY s.symbol;
        `;
        
        const params = stockId ? [stockId] : [];
        const result = await pool.query(query, params);
        
        if (stockId && !result.rows[0]) {
            throw new Error('This stock does not have any price history');
        }
        
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// // Update getLatestStockPriceByStockIdService to use the new function
// export const getLatestStockPriceByStockIdService = async (stock_id) => {
//     try {
//         const result = await getLatestPrices(stock_id);
//         return result[0]; // Return first (and only) result
//     } catch (error) {
//         throw error;
//     }
// };

//no update and delete
//because the stock price has foreign constraints to stocks table
//so if the stock is deleted, its stock price history will be deleted as well
//also the stock price is fixed, it should not be updated