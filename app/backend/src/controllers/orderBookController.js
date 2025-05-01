import { OrderBook } from '../services/orderMatchingService.js';
import pool from '../config/dbConnect.js';

// In-memory store for tracking last changes per stock ID
// In a production environment, this should be in a database or Redis
const lastChanges = {
  timestamps: {},  // When each stock was last updated
  updates: {}       // Cache of recent updates by stock ID
};

// Controller to get the order book data
export const getOrderBook = async (req, res) => {
  try {
    // First, get all stocks with their latest closing prices
    const stocksResult = await pool.query(`
      WITH LatestPrices AS (
        SELECT DISTINCT ON (stock_id) 
          stock_id,
          close_price,
          date
        FROM stockprices
        ORDER BY stock_id, date DESC
      )
      SELECT 
        s.stock_id,
        s.symbol,
        s.company_name,
        lp.close_price as reference_price,
        lp.date as price_date
      FROM stocks s
      LEFT JOIN LatestPrices lp ON s.stock_id = lp.stock_id
      ORDER BY s.symbol;
    `);

    const orderBook = OrderBook.getInstance();
    
    // Get the order book data
    const buyOrders = orderBook.limitBuyOrderQueue || [];
    const sellOrders = orderBook.limitSellOrderQueue || [];
    const recentTransactions = orderBook.recentTransactions || {};
    
    console.log('OrderBook data:', {
      stocksCount: stocksResult.rows.length,
      buyOrdersCount: buyOrders.length,
      sellOrdersCount: sellOrders.length,
      recentTransactionsCount: Object.keys(recentTransactions).length
    });

    // Process data for frontend display, passing the stocks data
    const processedData = processOrderBookData(stocksResult.rows, buyOrders, sellOrders, recentTransactions);
    
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

// Helper function to format order book data for the frontend
function processOrderBookData(stocks, buyOrders, sellOrders, recentTransactions) {
  // If no stocks, return empty array to avoid errors
  if (!stocks || !stocks.length) {
    return [];
  }

  // Process each stock
  return stocks.map(stock => {
    // Get orders for this stock
    const stockBuyOrders = buyOrders
      .filter(order => order.stockId === stock.stock_id)
      .sort((a, b) => b.price - a.price); // Sort by price descending
      
    const stockSellOrders = sellOrders
      .filter(order => order.stockId === stock.stock_id)
      .sort((a, b) => a.price - b.price); // Sort by price ascending

    // Get recent transaction for this stock
    const transaction = recentTransactions[stock.stock_id];

    // Calculate ceiling and floor prices (±10% of reference price)
    const refPrice = stock.reference_price || 0;
    const ceilPrice = Math.round(refPrice * 1.1 * 100) / 100; // Round to 2 decimal places
    const floorPrice = Math.round(refPrice * 0.9 * 100) / 100;

    // Return the processed data
    return {
      symbol: stock.symbol,
      company_name: stock.company_name,
      ref: refPrice,
      ceil: ceilPrice,
      floor: floorPrice,
      bid_prc2: stockBuyOrders[1]?.price || 0,
      bid_vol2: stockBuyOrders[1]?.volume || 0,
      bid_prc1: stockBuyOrders[0]?.price || 0,
      bid_vol1: stockBuyOrders[0]?.volume || 0,
      match_prc: transaction?.price || 0,
      match_vol: transaction?.volume || 0,
      ask_prc1: stockSellOrders[0]?.price || 0,
      ask_vol1: stockSellOrders[0]?.volume || 0,
      ask_prc2: stockSellOrders[1]?.price || 0,
      ask_vol2: stockSellOrders[1]?.volume || 0
    };
  });
}

// Controller to get only the updated order book data since a timestamp
export const getOrderBookUpdates = async (req, res) => {
  try {
    // Get the timestamp from the query params
    const sinceTimestamp = parseInt(req.query.since) || 0;
    
    // If no valid timestamp, return the full data
    if (!sinceTimestamp) {
      return getOrderBook(req, res);
    }
    
    // Get all stocks first
    const stocksResult = await pool.query(`
      WITH LatestPrices AS (
        SELECT DISTINCT ON (stock_id) 
          stock_id,
          close_price,
          date
        FROM stockprices
        ORDER BY stock_id, date DESC
      )
      SELECT 
        s.stock_id,
        s.symbol,
        s.company_name,
        lp.close_price as reference_price,
        lp.date as price_date
      FROM stocks s
      LEFT JOIN LatestPrices lp ON s.stock_id = lp.stock_id
      ORDER BY s.symbol;
    `);

    const orderBook = OrderBook.getInstance();
    
    // Get the order book data
    const buyOrders = orderBook.limitBuyOrderQueue || [];
    const sellOrders = orderBook.limitSellOrderQueue || [];
    const recentTransactions = orderBook.recentTransactions || {};
    
    // Process all data first (to ensure we have valid data to work with)
    const allProcessedData = processOrderBookData(stocksResult.rows, buyOrders, sellOrders, recentTransactions);
    
    // Find stocks that were updated since the timestamp
    const updatedStocks = [];
    
    allProcessedData.forEach(stock => {
      const stockSymbol = stock.symbol;
      const lastTimestamp = lastChanges.timestamps[stockSymbol] || 0;
      
      // If this stock has been updated since the requested timestamp
      if (lastTimestamp > sinceTimestamp) {
        updatedStocks.push(stock);
        
        // Update our timestamp record
        lastChanges.timestamps[stockSymbol] = Date.now();
        lastChanges.updates[stockSymbol] = stock;
      }
    });
    
    console.log(`Returning ${updatedStocks.length} updated stocks since ${new Date(sinceTimestamp).toISOString()}`);
    
    res.status(200).json(updatedStocks);
  } catch (error) {
    console.error('Error fetching order book updates:', error);
    res.status(500).json({ message: 'Failed to fetch order book updates' });
  }
};
