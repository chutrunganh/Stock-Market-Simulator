import { OrderBook } from './orderMatchingService.js';

// Initialize the OrderBook once at the module level so it can be shared across services
// This ensures that all order CRUD operations use the same instance of OrderBook
const orderBook = OrderBook.getInstance();

// Service to create a new order
// Every time an order is created, it will be added to the order book then matched with existing orders
export const createOrderService = async (orderData) => {
    const { userId, stockId, quantity, price, orderType } = orderData;
    const order = {
        id: Date.now().toString(), // Unique ID as string
        portfolioId: userId, // Assuming userId maps to portfolioId
        stockId,
        volume: quantity,
        price,
        type: orderType, // "Order Buy", "Order Sell", "Market Buy", "Market Sell"
        timestamp: Date.now(), // Timestamp for order arrangement incase of limit orders with same price
    };

    console.log('Creating order with information:', order);
    
    // Use the shared orderBook instance
    // Incase it is a market order, execute it immediately
    if (order.type === 'Market Buy' || order.type === 'Market Sell') {
        orderBook.marketOrderMatching(order); // Perform matching for market orders
  

    } else if (order.type === 'Limit Buy' || order.type === 'Limit Sell') {
        // For limit orders, add them to the queue for then matching
        orderBook.addOrderToQuene(order);
        orderBook.limitOrderMatching(order); // Perform matching for limit orders
    }
    // DEBUGGING: Display the order book after matching
    console.log('After matching, currently book:') 
    orderBook.displayOrderBook();
    return order;
};

//this function is used to create an "artificial order" (giao dịch ảo)
//for admin only
export const createArtificialOrderService = async (orderData) => {
    const { stockId, quantity, price, orderType } = orderData;
    const order = {
        id: `admin-${Date.now()}`, //unique ID prefixed with "admin" - for easier identification
        portfolioId: null, //admin does not have portfolioId
        stockId,
        volume: quantity,
        price,
        type: orderType, // "Limit Buy", "Limit Sell", "Market Buy", "Market Sell"
        timestamp: Date.now(),
    };

    console.log('Admin creating artificial order:', order);

    // Add the order to the order book
    if (order.type === 'Market Buy' || order.type === 'Market Sell') {
        orderBook.marketOrderMatching(order);
    } else if (order.type === 'Limit Buy' || order.type === 'Limit Sell') {
        orderBook.addOrderToQuene(order);
        orderBook.limitOrderMatching(order);
    }

    // Return the created order
    return order;
};

// Service to get an order by ID
export const getOrderByIdService = async (orderId) => {
    // Use the shared orderBook instance
    const allOrders = [...orderBook.limitBuyOrderQueue, ...orderBook.limitSellOrderQueue];
    return allOrders.find(order => order.id === orderId) || null;
};

// Service to remove an order from the queue by ID (Cancel order)
export const cancelOrderService = async (orderId) => {
    // Use the shared orderBook instance
    orderBook.removeOrderFromQuene(orderId);
    console.log('After removing, currently book:') 
    orderBook.displayOrderBook();
};
