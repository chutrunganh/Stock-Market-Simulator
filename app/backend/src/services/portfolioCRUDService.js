import pool from '../config/dbConnect.js';
import Portfolio from '../models/portfolioModel.js';


//get all portfolios - for admin
export const getAllPortfoliosService = async () => {
    try{
        const result = await pool.query('SELECT * FROM portfolios');
        return result.rows;
    }
    catch (error){
        throw new Error('Error occurs when getting all portfolios:', error.message);
    }
};

//get portfolio by user_id - specific user (for transaction buy/sell)
export const getPortfolioByUserIdService = async (user_id) => {
    try {
        const result = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1',
        [user_id]);
        if (!result.rows[0]){ //no portfolio found
            throw new Error('This user does not have any portfolio');
        }
        return Portfolio.getPortfolio(result.rows[0]);
    }
    catch(error){
        throw error;
    }
};

//update portfolio - cash balance, total value and last updated time
export const updatePortfolioService = async (portfolio_id, portfolioData) => {
    const { cash_balance, total_value } = portfolioData;
    try {
        const result = await pool.query('SELECT * FROM portfolios WHERE portfolio_id = $1', [portfolio_id]);
        if (!result.rows[0]) {
            throw new Error(`Portfolio with ID ${portfolio_id} not found`);
        }

        let queryText = 'UPDATE portfolios SET ';
        const queryParams = [];
        const updates = [];        if (cash_balance !== undefined) {
            const cashBalanceNum = Number(parseFloat(cash_balance).toFixed(2));
            if (cashBalanceNum < 0) {
                throw new Error('Cash balance can not be negative');
            }
            queryParams.push(cashBalanceNum);
            updates.push(`cash_balance = $${queryParams.length}`);
        }

        if (total_value !== undefined) {
            const totalValueNum = Number(parseFloat(total_value).toFixed(2));
            if (totalValueNum < 0) {
                throw new Error('Total value can not be negative');
            }
            queryParams.push(totalValueNum);
            updates.push(`total_value = $${queryParams.length}`);
        }        // Update last_updated timestamp
        const lastUpdated = new Date();
        queryParams.push(lastUpdated);
        updates.push(`last_updated = $${queryParams.length}`);

        queryText += updates.join(', ');
        queryParams.push(portfolio_id);
        queryText += ` WHERE portfolio_id = $${queryParams.length} RETURNING *`;
        const updateResult = await pool.query(queryText, queryParams);

        return Portfolio.getPortfolio(updateResult.rows[0]);
    
    } catch (error) {
        console.error(`Error updating portfolio with ID ${portfolio_id}:`, error.message);
        throw error;
    }
};

// Get portfolio holdings with current stock prices
export const getPortfolioHoldingsService = async (userId) => {
    try {
        const query = `
            SELECT 
                h.holding_id,
                h.stock_id,
                s.symbol,
                s.company_name,
                h.quantity,
                h.average_price,
                sp.close_price as current_price,
                (h.quantity * sp.close_price) as total_value
            FROM holdings h
            JOIN stocks s ON h.stock_id = s.stock_id
            JOIN portfolios p ON h.portfolio_id = p.portfolio_id
            LEFT JOIN LATERAL (
                SELECT close_price 
                FROM stockprices 
                WHERE stock_id = h.stock_id 
                ORDER BY date DESC 
                LIMIT 1
            ) sp ON true
            WHERE p.user_id = $1
            ORDER BY s.symbol`;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Get portfolio transactions
export const getPortfolioTransactionsService = async (userId) => {
    try {
        const query = `
            SELECT 
                t.transaction_id,
                t.stock_id,
                s.symbol,
                s.company_name,
                t.transaction_type,
                t.quantity,
                t.price,
                t.transaction_date
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            JOIN portfolios p ON t.portfolio_id = p.portfolio_id
            WHERE p.user_id = $1
            ORDER BY t.transaction_date DESC`;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};