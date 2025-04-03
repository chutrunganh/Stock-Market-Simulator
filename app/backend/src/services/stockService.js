import pool from "../config/dbConnect.js";
import Stocks from "../models/stockModel.js";

//create 

export const createStockService = async (stockData) => {
    const { symbol, company_name, industry, market_cap, description } = stockData;
    try {
        console.log("Create stock:", { symbol, company_name, industry, market_cap, description });
        const result = await pool.query(
            'INSERT INTO stocks (symbol, company_name, industry, market_cap, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [symbol, company_name, industry, market_cap, description]
        );
        return Stocks.getStocks(result.rows[0]);
    }
    catch (error) {
        console.error('Error when create stock:', error.message);
        throw new Error(error.message);
    }
};

//read 

//get all stocks information - for presentation in main page

export const getAllStocksService = async () => {
    try {
        const result = await pool.query('SELECT * FROM stocks');
        return result.rows;
    }
    catch (error) {
        throw new Error('Error occurs when getting all stocks:', error.message);
    }
};

//get stock by symbol - for search
export const getStockBySymbolService = async (symbol) => {
    try {
        const result = await pool.query(
            'SELECT * FROM stocks WHERE symbol = $1',
            [symbol]
        );
        if (!result.rows[0]) { //no stock found
            throw new Error('This stock does not exist');
        }
        return Stocks.getStocks(result.rows[0]);
    }
    catch (error) {
        throw error;
    }
};

//get stock by industry - for filtering feature
export const getStocksByIndustryService = async (industry) => {
    try {
        const result = await pool.query(
            'SELECT * FROM stocks WHERE industry = $1',
            [industry]
        );
        if (!result.rows[0]) { //no stock found
            throw new Error('This industry does not exist');
        }
        return result.rows;
    }
    catch (error) {
        throw error;
    }
};


//update 