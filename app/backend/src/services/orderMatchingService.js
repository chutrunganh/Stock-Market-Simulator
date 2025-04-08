import pool from '../config/dbConnect.js';
import Transaction from '../models/transactionModel.js';

// Order Matching Service
// This service is responsible for matching buy and sell orders based on price and time priority.
export class OrderBook {
  constructor() {
    this.limitBuyOrderQueue = [];
    this.limitSellOrderQueue = [];
  }

  // Singleton pattern to ensure only one instance of OrderBook exists
  // This instance will be shared across all order CRUD operations
  static getInstance() {
    if (!OrderBook.instance) {
      OrderBook.instance = new OrderBook();
    }
    return OrderBook.instance;
  }

  // Push orders into the appropriate queue with piority
  addOrder(order) {
    if (order.type === 'buy') {
      this.limitBuyOrderQueue.push(order);
      this.limitBuyOrderQueue.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
    } else if (order.type === 'sell') {
      this.limitSellOrderQueue.push(order);
      this.limitSellOrderQueue.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
    }
  }

  // Remove orders from the queues (e.g., when they are canceled or completed)
  removeOrder(orderId) {
    this.limitBuyOrderQueue = this.limitBuyOrderQueue.filter(order => order.id !== orderId);
    this.limitSellOrderQueue = this.limitSellOrderQueue.filter(order => order.id !== orderId);
  }

  matchOrders() {
    while (this.limitBuyOrderQueue.length > 0 && this.limitSellOrderQueue.length > 0) {
      const buyOrder = this.limitBuyOrderQueue[0];
      const sellOrder = this.limitSellOrderQueue[0];

      // Ensure the stock IDs match before attempting to match orders
      if (buyOrder.stockId === sellOrder.stockId && buyOrder.price >= sellOrder.price) {
        const matchedQuantity = Math.min(buyOrder.volume, sellOrder.volume);
        const matchedPrice = sellOrder.price;

        // Update volumes
        buyOrder.volume -= matchedQuantity;
        sellOrder.volume -= matchedQuantity;

        // Record transaction (simplified for now)
        console.log(`Transaction: ${matchedQuantity} shares of stock ${buyOrder.stockId} at $${matchedPrice} each`);

        // Remove completed orders
        if (buyOrder.volume === 0) this.limitBuyOrderQueue.shift();
        if (sellOrder.volume === 0) this.limitSellOrderQueue.shift();
      } else {
        break;
      }
    }
  }

  // Display the order book in a properly aligned tabular format with full borders
  displayOrderBook() {
    // Group orders by stockId
    const stockGroups = {};

    // Process buy orders
    this.limitBuyOrderQueue.forEach(order => {
      if (!stockGroups[order.stockId]) {
        stockGroups[order.stockId] = {
          bids: [],
          asks: []
        };
      }
      stockGroups[order.stockId].bids.push(order);
    });

    // Process sell orders
    this.limitSellOrderQueue.forEach(order => {
      if (!stockGroups[order.stockId]) {
        stockGroups[order.stockId] = {
          bids: [],
          asks: []
        };
      }
      stockGroups[order.stockId].asks.push(order);
    });

    // Display the order book for each stock
    console.log('\n');
    console.log('╔════════════╦═══════════════════════════════════════╦════════════════════╦═══════════════════════════════════════╗');
    console.log('║ Stock ID   ║                   Bid                 ║       Matched      ║               Ask                     ║');
    console.log('║            ╠═══════════╦═══════╦═══════════╦═══════╬═══════════╦════════╬═══════════╦═══════╬═══════════╦═══════╣');
    console.log('║            ║   Prc 2   ║ Vol 2 ║   Prc 1   ║ Vol 1 ║    Prc    ║  Vol   ║   Prc 1   ║ Vol 1 ║   Prc 2   ║ Vol 2 ║');
    console.log('╠════════════╬═══════════╬═══════╬═══════════╬═══════╬═══════════╬════════╬═══════════╬═══════╬═══════════╬═══════╣');

    Object.keys(stockGroups).forEach(stockId => {
      const group = stockGroups[stockId];

      // Get top 2 bids and asks directly from the queue (already sorted)
      const topBids = group.bids.slice(0, 2);
      const topAsks = group.asks.slice(0, 2);

      // Determine matched volume and price
      let matchedVolume = null;
      let matchedPrice = null;
      if (topBids[0] && topAsks[0] && topBids[0].price >= topAsks[0].price) {
        matchedVolume = Math.min(topBids[0].volume, topAsks[0].volume);
        matchedPrice = topAsks[0].price;
      }

      console.log(
        `║ ${stockId.padEnd(10)} ║ ${
          topBids[1] ? topBids[1].price.toFixed(2).padStart(9) : '         '} ║ ${
          topBids[1] ? topBids[1].volume.toString().padStart(5) : '     '} ║ ${
          topBids[0] ? topBids[0].price.toFixed(2).padStart(9) : '         '} ║ ${
          topBids[0] ? topBids[0].volume.toString().padStart(5) : '     '} ║ ${
          matchedPrice ? matchedPrice.toFixed(2).padStart(9) : '         '} ║ ${
          matchedVolume ? matchedVolume.toString().padStart(6) : '      '} ║ ${
          topAsks[0] ? topAsks[0].price.toFixed(2).padStart(9) : '         '} ║ ${
          topAsks[0] ? topAsks[0].volume.toString().padStart(5) : '     '} ║ ${
          topAsks[1] ? topAsks[1].price.toFixed(2).padStart(9) : '         '} ║ ${
          topAsks[1] ? topAsks[1].volume.toString().padStart(5) : '     '} ║`
      );
    });

    console.log('╚════════════╩═══════════╩═══════╩═══════════╩═══════╩═══════════╩════════╩═══════════╩═══════╩═══════════╩═══════╝\n');
  }
}