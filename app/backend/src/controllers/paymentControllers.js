import pool from '../config/dbConnect.js';
import log from '../utils/loggerUtil.js';
import axios from 'axios';

const SEPAY_API_TOKEN = process.env.SEPAY_API_TOKEN;
const SEPAY_API_URL = process.env.SEPAY_API_URL || 'https://api.sepay.vn/v1';

// Verify payment and update user's balance
export const verifyPayment = async (req, res, next) => {
    const { transactionId } = req.body;
    const userId = req.user.id;

    try {
        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if transaction ID was already used
            const existingTransaction = await client.query(
                'SELECT * FROM payment_transactions WHERE transaction_id = $1',
                [transactionId]
            );

            if (existingTransaction.rows.length > 0) {
                throw new Error('Transaction ID already used');
            }

            // Verify the transaction with Sepay's API
            const sepayResponse = await axios.get(`${SEPAY_API_URL}/transactions/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${SEPAY_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!sepayResponse.data.success) {
                throw new Error('Invalid transaction ID or payment not found');
            }

            const vndAmount = sepayResponse.data.amount;
            const virtualAmount = vndAmount; // 1:1 conversion

            // Update user's portfolio balance
            await client.query(
                'UPDATE portfolios SET cash_balance = cash_balance + $1 WHERE user_id = $2',
                [virtualAmount, userId]
            );

            // Record the payment transaction
            await client.query(
                'INSERT INTO payment_transactions (user_id, transaction_id, vnd_amount, virtual_amount) VALUES ($1, $2, $3, $4)',
                [userId, transactionId, vndAmount, virtualAmount]
            );

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Payment verified and balance updated successfully',
                data: {
                    vndAmount,
                    virtualAmount
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        log.error('Payment verification error:', error);
        next(error);
    }
};

// Get payment status
export const getPaymentStatus = async (req, res, next) => {
    const { transactionId } = req.params;
    const userId = req.user.id;

    try {
        // First check our database
        const result = await pool.query(
            'SELECT * FROM payment_transactions WHERE transaction_id = $1 AND user_id = $2',
            [transactionId, userId]
        );

        if (result.rows.length > 0) {
            return res.json({
                success: true,
                data: result.rows[0]
            });
        }

        // If not in our database, check with Sepay
        const sepayResponse = await axios.get(`${SEPAY_API_URL}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${SEPAY_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            data: sepayResponse.data
        });
    } catch (error) {
        log.error('Get payment status error:', error);
        next(error);
    }
}; 