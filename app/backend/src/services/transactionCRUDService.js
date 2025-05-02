// SQL queries to retrieves transactions information from the Transactions table

import pool from '../config/dbConnect.js';
import Transaction from '../models/transactionModel.js';
//CRUD Services

//create
export const createTransactionService = async (transactionData) => {
    const {portfolio_id, stock_id, transaction_type, quantity, price} = transactionData;

    try{
        console.log("Create transaction:", {portfolio_id, stock_id, transaction_type, quantity, price});

        const result = await pool.query(
            'INSERT INTO transactions (portfolio_id, stock_id, transaction_type, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [portfolio_id, stock_id, transaction_type, quantity, price]
        );
        return Transaction.getTransaction(result.rows[0]);
    }
    catch(error){
        console.error('Error:', error.message);
        throw new Error(error.message);
    }
};

