/**
 * @file orderBookController.js
 * @description This file contains the function to help frontend side can display and efficiently update the order book data.
 */
import { OrderBook } from '../services/orderMatchingService.js';
import { getLatestStockPriceByStockIdService } from '../services/stockPriceCRUDService.js';


// In-memory store for tracking last changes per stock ID
// In a production environment, this should be in a database or Redis
const lastChanges = {
  timestamps: {},  // When each stock was last updated
  updates: {}      // Cache of recent updates by stock ID
};

// Controller to get the order book data
export const getOrderBook = async (req, res) => {
  try {
    // Get all stocks with their latest closing prices using the service
    const stocksResult = await getLatestStockPriceByStockIdService();

    const orderBook = OrderBook.getInstance();
    
    // Get the order book data
    const buyOrders = orderBook.limitBuyOrderQueue || [];
    const sellOrders = orderBook.limitSellOrderQueue || [];
    const recentTransactions = orderBook.recentTransactions || {};
    
    // Process data for frontend display, passing the stocks data
    const processedData = processOrderBookData(stocksResult, buyOrders, sellOrders, recentTransactions);
    
    // Store the current state and timestamp for each stock
    const now = Date.now();
    processedData.forEach(stock => {
      lastChanges.timestamps[stock.symbol] = now;
      lastChanges.updates[stock.symbol] = stock;
    });
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Error fetching order book data:', error);
    res.status(500).json({ message: 'Failed to fetch order book data' });
  }
};

/**
 * Processes raw stock, order, and transaction data into a format suitable for the frontend order book display.
 * 
 * @param {Array<Object>} stocks - An array of stock objects, each containing stock_id, symbol, company_name, and reference_price.
 * @param {Array<Object>} buyOrders - An array of all pending limit buy orders across all stocks.
 * @param {Array<Object>} sellOrders - An array of all pending limit sell orders across all stocks.
 * @param {Object} recentTransactions - An object mapping stock_id to the most recent transaction details (price, volume) for that stock.
 * @returns {Array<Object>} An array of objects, where each object represents a stock's order book view 
 *                          formatted for the frontend table. Includes symbol, reference price, top 2 bid/ask prices/volumes, 
 *                          and the last matched price/volume.
 */
function processOrderBookData(stocks, buyOrders, sellOrders, recentTransactions) {
  // If there are no stocks provided (e.g., database query returned empty), 
  // return an empty array immediately to prevent errors downstream.
  if (!stocks || !stocks.length) {
    return [];
  }

  // Iterate through each stock provided in the 'stocks' array.
  return stocks.map(stock => {
    // Filter the global list of buy orders to get only those for the current stock.
    // Sort them by price in descending order (highest bid price first).
    const stockBuyOrders = buyOrders
      .filter(order => order.stockId === stock.stock_id)
      .sort((a, b) => b.price - a.price); 
      
    // Filter the global list of sell orders to get only those for the current stock.
    // Sort them by price in ascending order (lowest ask price first).
    const stockSellOrders = sellOrders
      .filter(order => order.stockId === stock.stock_id)
      .sort((a, b) => a.price - b.price); 

    // Retrieve the most recent transaction details for the current stock from the 'recentTransactions' map.
    // If no recent transaction exists for this stock, 'transaction' will be undefined.
    const transaction = recentTransactions[stock.stock_id];

    // Get the reference price (usually the previous day's closing price) for the stock.
    // Default to 0 if not available.
    const refPrice = stock.reference_price || 0;

    // Construct the final object for this stock to be sent to the frontend.
    // This structure matches what the frontend 'Tables.jsx' component expects.
    return {
      symbol: stock.symbol,                 // Stock ticker symbol (e.g., 'AAPL')
      company_name: stock.company_name,     // Full company name
      ref: refPrice,                        // Reference price (used for color coding and ceiling/floor calculation on frontend)
      
      // Top 2 Bid Prices & Volumes:
      // Use optional chaining (?.) and nullish coalescing (|| 0) to safely access 
      // properties and provide default values (0) if orders don't exist at that level.
      bid_prc2: stockBuyOrders[1]?.price || 0, // Price of the second-best bid
      bid_vol2: stockBuyOrders[1]?.volume || 0,// Volume of the second-best bid
      bid_prc1: stockBuyOrders[0]?.price || 0, // Price of the best (highest) bid
      bid_vol1: stockBuyOrders[0]?.volume || 0,// Volume of the best (highest) bid
      
      // Last Matched Price & Volume:
      match_prc: transaction?.price || 0,   // Price of the last executed trade
      match_vol: transaction?.volume || 0,  // Volume of the last executed trade
      
      // Top 2 Ask Prices & Volumes:
      ask_prc1: stockSellOrders[0]?.price || 0, // Price of the best (lowest) ask
      ask_vol1: stockSellOrders[0]?.volume || 0,// Volume of the best (lowest) ask
      ask_prc2: stockSellOrders[1]?.price || 0, // Price of the second-best ask
      ask_vol2: stockSellOrders[1]?.volume || 0 // Volume of the second-best ask
    };
  });
}

/**
 * Controller to get only the order book data for stocks that have been updated 
 * since a specific timestamp provided by the client.
 * 
 * This is an optimization over getOrderBook to reduce data transfer for frequent updates.
 * It relies on an in-memory cache (`lastChanges`) to track when each stock's data was last sent.
 * 
 * @param {Object} req - Express request object, expects `req.query.since` (timestamp in milliseconds).
 * @param {Object} res - Express response object.
 */
export const getOrderBookUpdates = async (req, res) => {
  try {
    // Extract the timestamp from the client's query parameters.
    // This timestamp represents the last time the client successfully received data.
    // Default to 0 if missing or invalid, which will trigger a full data fetch.
    const sinceTimestamp = parseInt(req.query.since) || 0;
    
    // If the client didn't provide a valid timestamp (e.g., initial load or error),
    // fall back to sending the complete order book data using the getOrderBook controller.
    if (!sinceTimestamp) {
      console.log('No valid "since" timestamp provided, falling back to full getOrderBook.');
      return getOrderBook(req, res); // Delegate to the full fetch function
    }
    
    // --- Fetch Current State (Similar to getOrderBook) ---
    // We need the current full state to compare against the last known updates.
    
    // Get all stocks with their latest reference prices using the service
    const stocksResult = await getLatestStockPriceByStockIdService();

    // 2. Get the current order book instance.
    const orderBook = OrderBook.getInstance();
    
    // 3. Get the current buy/sell queues and recent transactions.
    const buyOrders = orderBook.limitBuyOrderQueue || [];
    const sellOrders = orderBook.limitSellOrderQueue || [];
    const recentTransactions = orderBook.recentTransactions || {};
    
    // 4. Process all current data into the frontend format.
    // This gives us the *potential* data to send for each stock.
    const allProcessedData = processOrderBookData(stocksResult, buyOrders, sellOrders, recentTransactions);
    
    // --- Filter for Updates ---
    
    // Array to hold only the data for stocks that have changed since the client's timestamp.
    const updatedStocks = [];
    const now = Date.now(); // Get current time once for consistency
    
    // Iterate through the currently processed data for all stocks.
    allProcessedData.forEach(stock => {
      const stockSymbol = stock.symbol;
      // Get the timestamp when this stock's data was last known to have changed (from our in-memory cache).
      const lastKnownChangeTimestamp = lastChanges.timestamps[stockSymbol] || 0;
      
      // Compare the last known change time with the client's last update time.
      // If our record of the last change is more recent than the client's timestamp,
      // it means this stock's data has potentially changed and needs to be sent.
      if (lastKnownChangeTimestamp > sinceTimestamp) {
        // Add the current processed data for this stock to the response list.
        updatedStocks.push(stock);
        
        // Update the cache: Record that we are sending this update *now*.
        // This timestamp will be used for the *next* update request from the client.
        lastChanges.timestamps[stockSymbol] = now;
        // Cache the actual data being sent (optional, but can be useful for debugging or other features).
        lastChanges.updates[stockSymbol] = stock; 
      }
      // Note: If a stock *wasn't* updated according to lastKnownChangeTimestamp, we don't send it,
      // even if its data might have changed between the lastKnownChangeTimestamp and now.
      // This relies on the assumption that *something* updates lastChanges.timestamps whenever
      // an order affecting a stock is processed or a transaction occurs.
      // If that assumption is wrong, this logic might miss updates.
    });
    
    // Log how many updates are being sent.
    console.log(`Returning ${updatedStocks.length} updated stocks since ${new Date(sinceTimestamp).toISOString()}`);
    
    // Send the filtered list of updated stocks to the client.
    res.status(200).json(updatedStocks);
  } catch (error) {
    // Standard error handling.
    console.error('Error fetching order book updates:', error);
    res.status(500).json({ message: 'Failed to fetch order book updates' });
  }
};
