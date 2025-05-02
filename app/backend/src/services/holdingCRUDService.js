import pool from '../config/dbConnect.js';
import Holdings from '../models/holdingModel.js';

// //create

// export const createHoldingService = async(holdingData) => {
//     const {portfolio_id, stock_id, quantity, average_cost} = holdingData;
//     try{
//         console.log('Add holding row:', {portfolio_id, stock_id, quantity, average_cost});
//         const result = await pool.query(
//             `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_cost)
//             VALUES ($1, $2, $3, $4) RETURNING *`, [portfolio_id, stock_id, quantity, average_cost]
//         );
//     }
//     catch(error){
//         console.log('Error when creating holding rows:', error.message);
//         throw new Error(error.message);
//     }

// };

// Service to create default holdings for a new portfolio
export const createDefaultHoldingsForPortfolioService = async (portfolioId, client) => {
    const defaultQuantity = 10; // Default number of shares for each stock
    const defaultAverageCost = 0; // Default cost (given for free initially)

    try {
        // Get all stock IDs from the stocks table
        const stocksResult = await client.query('SELECT stock_id FROM stocks'); // Corrected column name
        const stockIds = stocksResult.rows.map(stock => stock.stock_id); // Corrected property access

        if (stockIds.length === 0) {
            console.log('No stocks found in the database. Skipping default holdings creation.');
            return; // No stocks to add holdings for
        }

        // Prepare bulk insert query
        const values = [];
        const valuePlaceholders = [];
        stockIds.forEach((stockId, index) => {
            const baseIndex = index * 4;
            valuePlaceholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`);
            values.push(portfolioId, stockId, defaultQuantity, defaultAverageCost); // Use defaultAverageCost variable, but insert into average_price column
        });

        const queryText = `INSERT INTO holdings (portfolio_id, stock_id, quantity, average_price) VALUES ${valuePlaceholders.join(', ')}`; // Corrected column name to average_price

        console.log(`Creating default holdings for portfolio ${portfolioId} for ${stockIds.length} stocks.`);
        await client.query(queryText, values);
        console.log(`Successfully created default holdings for portfolio ${portfolioId}.`);

    } catch (error) {
        console.error(`Error creating default holdings for portfolio ${portfolioId}:`, error.message);
        // Re-throw the error to be caught by the transaction handler in userCRUDService
        throw new Error(`Failed to create default holdings: ${error.message}`);
    }
};

//read 

//get holdings information of a specific user, by their portfolio id
//for portfolio presentation in user tab

//get all holdings for admin only 
export const getAllHoldingByService = async() =>{
    try{
        const result = await pool.query('SELECT * FROM holdings');
        return result.rows;
    }
    catch(error){
        throw new Error('Error happens when get all holdings:', error.message);
    } 
 };


export const getHoldingByUserIdService = async(portfolio_id) =>{
   try{
        const result = await pool.query(
            'SELECT * FROM holdings WHERE portfolio_id = $1', [portfolio_id]);

        if (!result.rows[0]){
            throw new Error('This portfolio does not have any holdings');
        }
        return Holdings.getHoldings(result.rows[0]);
   }
   catch(error){
        throw new Error('Error happens when get holdings of this user:', error.message);
   } 
};


//update - do it later
//only update if the user buy the same stock or sell stock

//delete - i think we don't need feature