import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Function to verify payment and update balance
export const verifyPayment = async (transactionId) => {
    try {
        const response = await axios.post(`${API_URL}/payments/verify`, 
            { transactionId },
            { 
                withCredentials: true, // This is important for sending cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Function to get payment status
export const getPaymentStatus = async (transactionId) => {
    try {
        const response = await axios.get(`${API_URL}/payments/status/${transactionId}`, {
            withCredentials: true // This is important for sending cookies
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 