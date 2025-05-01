// filepath: c:\Users\Chu Trung Anh\Desktop\Project\Product\Stock-Market-Simulator\app\backend\src\controllers\orderBookController.js
import { OrderBook } from '../services/orderMatchingService.js';

// In-memory store for tracking last changes per stock ID
// In a production environment, this should be in a database or Redis
const lastChanges = {
  timestamps: {},  // When each stock was last updated
  updates: {}       // Cache of recent updates by stock ID
};

// Controller to get the order book data
export const getOrderBook = (req, res) => {
  try {
    const orderBook = OrderBook.getInstance();
    
    // Get the order book data
    const buyOrders = orderBook.limitBuyOrderQueue || [];
    const sellOrders = orderBook.limitSellOrderQueue || [];
    const recentTransactions = orderBook.recentTransactions || {};
    
    console.log('OrderBook data:', {
      buyOrdersCount: buyOrders.length,
      sellOrdersCount: sellOrders.length,
      recentTransactionsCount: Object.keys(recentTransactions).length
    });
      // Process data for frontend display
    const processedData = processOrderBookData(buyOrders, sellOrders, recentTransactions);
    
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
function processOrderBookData(buyOrders, sellOrders, recentTransactions) {
  // Group orders by stockId
  const stockGroups = {};

  // If there's no data, return a sample structure with empty arrays
  if (!buyOrders.length && !sellOrders.length && Object.keys(recentTransactions).length === 0) {
    // Return an empty order book structure
    return [{
      symbol: 'No Data',
      bids: [],
      asks: [],
      matchedPrice: null,
      matchedVolume: null
    }];
  }

  // Helper function to aggregate orders by price
  const aggregateOrders = (orders, isBuyOrder) => {
    const aggregated = {};
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    orders.forEach(order => {
      if (!aggregated[order.price]) {
        aggregated[order.price] = { price: order.price, volume: 0 };
      }
      aggregated[order.price].volume += order.volume;
    });
    // Sort buy orders high to low, sell orders low to high
    return Object.values(aggregated).sort((a, b) => 
      isBuyOrder ? b.price - a.price : a.price - b.price
    );
  };
  // Process buy orders
  if (Array.isArray(buyOrders)) {
    buyOrders.forEach(order => {
      if (order && order.stockId) {
        if (!stockGroups[order.stockId]) {
          stockGroups[order.stockId] = {
            symbol: order.stockId,
            bids: [],
            asks: [],
            matchedPrice: null,
            matchedVolume: null
          };
        }
        stockGroups[order.stockId].bids = aggregateOrders(
          buyOrders.filter(o => o && o.stockId === order.stockId),
          true
        );
      }
    });
  }

  // Process sell orders
  if (Array.isArray(sellOrders)) {
    sellOrders.forEach(order => {
      if (order && order.stockId) {
        if (!stockGroups[order.stockId]) {
          stockGroups[order.stockId] = {
            symbol: order.stockId,
            bids: [],
            asks: [],
            matchedPrice: null,
            matchedVolume: null
          };
        }
        stockGroups[order.stockId].asks = aggregateOrders(
          sellOrders.filter(o => o && o.stockId === order.stockId),
          false
        );
      }
    });
  }

  // Add recent transactions
  if (recentTransactions && typeof recentTransactions === 'object') {
    Object.entries(recentTransactions).forEach(([stockId, transaction]) => {
      if (stockId && transaction) {
        if (!stockGroups[stockId]) {
          stockGroups[stockId] = {
            symbol: stockId,
            bids: [],
            asks: [],
            matchedPrice: null,
            matchedVolume: null
          };
        }
        stockGroups[stockId].matchedPrice = transaction.price;
        stockGroups[stockId].matchedVolume = transaction.volume;
      }
    });
  }

  // If we end up with no data, provide a sample structure
  const result = Object.values(stockGroups);
  if (result.length === 0) {
    return [{
      symbol: 'No Data',
      bids: [],
      asks: [],
      matchedPrice: null,
      matchedVolume: null
    }];
  }
    return result;
}

// Controller to get only the updated order book data since a timestamp
export const getOrderBookUpdates = (req, res) => {
  try {
    // Get the timestamp from the query params
    const sinceTimestamp = parseInt(req.query.since) || 0;
    
    // If no valid timestamp, return the full data
    if (!sinceTimestamp) {
      return getOrderBook(req, res);
    }
    
    const orderBook = OrderBook.getInstance();
    
    // Get the order book data
    const buyOrders = orderBook.limitBuyOrderQueue || [];
    const sellOrders = orderBook.limitSellOrderQueue || [];
    const recentTransactions = orderBook.recentTransactions || {};
    
    // Process all data first (to ensure we have valid data to work with)
    const allProcessedData = processOrderBookData(buyOrders, sellOrders, recentTransactions);
    
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
