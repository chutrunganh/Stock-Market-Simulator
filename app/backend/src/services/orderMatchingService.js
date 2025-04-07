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

      if (buyOrder.price >= sellOrder.price) {
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

  // Display the current state of the order book (for debugging purposes)
  displayOrderBook() {
    // Display only price and quantity for buy orders
    this.limitBuyOrderQueue.forEach(order => {
      console.log(`Buy: Price: ${order.price}, Quantity: ${order.volume}`);
    });
    
    // Display only price and quantity for sell orders
    console.log('-------------------------');
    this.limitSellOrderQueue.forEach(order => {
      console.log(`Sell: Price: ${order.price}, Quantity: ${order.volume}`);
    });
  }
}