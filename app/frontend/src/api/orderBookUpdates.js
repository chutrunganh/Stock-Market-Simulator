// filepath: c:\Users\Chu Trung Anh\Desktop\Project\Product\Stock-Market-Simulator\app\frontend\src\api\orderBookUpdates.js
import apiClient from './apiClient';

/**
 * Get order book data updates since a specific timestamp
 * This allows for partial updates to the order book
 * @param {number} lastUpdateTimestamp - The timestamp of the last update
 * @returns {Promise} The updated order book data
 */
export const getOrderBookUpdates = async (lastUpdateTimestamp) => {
  try {
    const response = await apiClient.get('/orderBook/updates', {
      params: { since: lastUpdateTimestamp }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order book updates:', error);
    throw new Error('Failed to fetch order book updates. Please try again.');
  }
};
