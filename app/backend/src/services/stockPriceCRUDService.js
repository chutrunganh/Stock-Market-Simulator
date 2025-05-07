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

// Get latest stock price for a specific stock
export const getLatestStockPriceByStockIdService = async (stockId) => {
    try {
        const query = 'SELECT close_price as reference_price, date as price_date FROM stockprices WHERE stock_id = $1 ORDER BY date DESC LIMIT 1';
        const result = await pool.query(query, [stockId]);

        if (!result.rows[0]) {
            throw new Error('This stock does not have any price history');
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Get all stocks with their latest prices
export const getAllStocksWithLatestPricesService = async () => {
    try {
        const query = 'SELECT s.stock_id, s.symbol, s.company_name, sp.close_price as reference_price, sp.date as price_date FROM stocks s LEFT JOIN stockprices sp ON s.stock_id = sp.stock_id ORDER BY s.symbol, sp.date DESC';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

//no delete needed
//because the stock price has foreign constraints to stocks table
//so if the stock is deleted, its stock price history will be deleted as well

