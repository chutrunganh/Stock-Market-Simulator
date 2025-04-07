import { OrderBook } from './orderMatchingService.js';

// Initialize the OrderBook once at the module level
const orderBook = OrderBook.getInstance();

// Service to create a new order
export const createOrderService = async (orderData) => {
    const { userId, stockId, quantity, price, orderType } = orderData;
    const order = {
        id: Date.now().toString(), // Unique ID as string
        portfolioId: userId, // Assuming userId maps to portfolioId
        stockId,
        volume: quantity,
        price,
        type: orderType,
        timestamp: new Date().getTime(),
    };

    console.log('Creating order:', order);
    
    // Use the shared orderBook instance
    orderBook.addOrder(order);
    console.log('Add order to book, current book:')
    orderBook.displayOrderBook(); // Display the current state of the order book
    
    // Perform matching after adding the order
    orderBook.matchOrders(); //Once a new order is added, perfrom matching on the orderBook
    console.log('After matching, currently book')
    orderBook.displayOrderBook();
    return order;
};

// Service to get an order by ID
export const getOrderByIdService = async (orderId) => {
    // Use the shared orderBook instance
    const allOrders = [...orderBook.limitBuyOrderQueue, ...orderBook.limitSellOrderQueue];
    return allOrders.find(order => order.id === orderId) || null;
};

// Service to get all orders
export const getAllOrdersService = async () => {
    // Use the shared orderBook instance
    return {
        buyOrders: orderBook.limitBuyOrderQueue,
        sellOrders: orderBook.limitSellOrderQueue,
    };
};