// filepath: c:\Users\Chu Trung Anh\Desktop\Project\Product\Stock-Market-Simulator\app\backend\src\controllers\devController.js
import { OrderBook } from '../services/orderMatchingService.js';

// Controller for development endpoints
export const addSampleOrderBookData = (req, res) => {
  try {
    const orderBook = OrderBook.getInstance();
    
    // Add sample buy orders
    orderBook.limitBuyOrderQueue.push(
      {
        orderId: 'b1',
        stockId: 'AAPL',
        userId: 'user1',
        type: 'Limit Buy',
        price: 150.50,
        volume: 100,
        timestamp: Date.now()
      },
      {
        orderId: 'b2',
        stockId: 'AAPL',
        userId: 'user2',
        type: 'Limit Buy',
        price: 149.75,
        volume: 200,
        timestamp: Date.now()
      },
      {
        orderId: 'b3',
        stockId: 'MSFT',
        userId: 'user3',
        type: 'Limit Buy',
        price: 290.00,
        volume: 50,
        timestamp: Date.now()
      }
    );
    
    // Add sample sell orders
    orderBook.limitSellOrderQueue.push(
      {
        orderId: 's1',
        stockId: 'AAPL',
        userId: 'user4',
        type: 'Limit Sell',
        price: 151.25,
        volume: 150,
        timestamp: Date.now()
      },
      {
        orderId: 's2',
        stockId: 'MSFT',
        userId: 'user5',
        type: 'Limit Sell',
        price: 291.50,
        volume: 75,
        timestamp: Date.now()
      }
    );
    
    // Add sample recent transactions
    orderBook.recentTransactions = {
      'AAPL': {
        price: 150.75,
        volume: 50,
        timestamp: Date.now()
      },
      'MSFT': {
        price: 290.25,
        volume: 25,
        timestamp: Date.now()
      }
    };
    
    res.status(200).json({ message: 'Sample order book data added successfully' });
  } catch (error) {
    console.error('Error adding sample order book data:', error);
    res.status(500).json({ message: 'Failed to add sample order book data' });
  }
};
