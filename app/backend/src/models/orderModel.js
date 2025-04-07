class Order {
    constructor(orderData) {
        this.id = orderData.id;
        this.portfolioId = orderData.portfolioId;
        this.stockId = orderData.stockId;
        this.type = orderData.type; // 'buy' or 'sell'
        this.price = orderData.price;
        this.volume = orderData.volume; // quantity
        this.timestamp = orderData.timestamp;
    }

    static getOrder(orderData) {
        if (!orderData) return null; // if orderData doesn't exist, return null
        return {
            id: orderData.id,
            portfolioId: orderData.portfolioId,
            stockId: orderData.stockId,
            type: orderData.type,
            price: orderData.price,
            volume: orderData.volume,
            timestamp: orderData.timestamp
        };
    }
}

export default Order;