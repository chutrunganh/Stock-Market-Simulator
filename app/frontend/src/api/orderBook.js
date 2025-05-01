// filepath: c:\Users\Chu Trung Anh\Desktop\Project\Product\Stock-Market-Simulator\app\frontend\src\api\orderBook.js
import apiClient from './apiClient';

/**
 * Get order book data from the backend
 * @returns {Promise} The order book data for all stocks
 */
export const getOrderBookData = async () => {
  try {
    const response = await apiClient.get('/orderBook');
    return response.data;
  } catch (error) {
    console.error('Error fetching order book data:', error);
    throw new Error('Failed to fetch order book data. Please try again.');
  }
};
