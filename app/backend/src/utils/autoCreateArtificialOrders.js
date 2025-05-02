import axios from 'axios';
import { getLatestStockPriceByStockIdService } from '../services/stockPriceCRUDService.js';
import { getAllStockService } from '../services/stockCRUDService.js';
// Constants
const SERVER_URL = 'http://localhost:3000/api';
const ADMIN_JWT = 'your_admin_jwt_token_here'; //replace with admin token when signed up
const INTERVAL_MS = 5000; //one order every 5 sec = one cycle
const ORDERS_PER_CYCLE = 5; //num of orders per cycle 
const TREND = 'neutral'; // 'buy-dominant', 'sell-dominant', 'neutral'

//get the list of stocks from server
const getAvailableStocksAndPrices = async () => {
    try {
        // Fetch all stocks
        const stocks = await getAllStockService();

        // Fetch the latest price for each stock
        const stocksWithPrices = await Promise.all(
            stocks.map(async (stock) => {
                const latestPrice = await getLatestStockPriceByStockIdService(stock.stock_id);
                return {
                    ...stock,
                    latestPrice: latestPrice.close_price,
                };
            })
        );

        return stocksWithPrices;
    } catch (error) {
        console.error('Error fetching stocks and prices:', error.message);
        throw error;
    }
};


const generateArtificialOrder = (stocks) => {
    const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;

    //calculate ceiling and floor price - in ±7% range
    const referencePrice = randomStock.latestPrice;
    const floorPrice = referencePrice * 0.93;
    const ceilPrice = referencePrice * 1.07;

    const price = parseFloat(
        (floorPrice + Math.random() * (ceilPrice - floorPrice)).toFixed(2)
    );

    
    let orderType;
    const marketChance = 0.2; //assume that 20% of orders are market orders 
    const rand = Math.random();

    if (rand < marketChance) {
        orderType = Math.random() > 0.5 ? 'Market Buy' : 'Market Sell';
    } else {
        if (TREND === 'buy-dominant') {
            orderType = Math.random() < 0.8 ? 'Limit Buy' : 'Limit Sell';
        } else if (TREND === 'sell-dominant') {
            orderType = Math.random() < 0.8 ? 'Limit Sell' : 'Limit Buy';
        } else {
            orderType = Math.random() > 0.5 ? 'Limit Buy' : 'Limit Sell';
        }
    }

    const order = {
        stockId: randomStock.stock_id,
        quantity,
        price: orderType.includes('Limit') ? price : undefined,
        orderType,
    };

    return order;
};


const sendArtificialOrder = async (order) => {
    try {
        const response = await axios.post(`${SERVER_URL}/createArtiOrder`, order, {
            headers: {
                Authorization: `Bearer ${ADMIN_JWT}`,
            },
        });
        console.log('Created:', order.orderType, '–', order);
    } catch (error) {
        console.error('Failed to create order:', error.message);
    }
};

//main function
const startCreatingArtificialOrders = async () => {
    const stocks = await getAvailableStocksAndPrices();
    if (stocks.length === 0) {
        console.error('No stocks available to create orders.');
        return;
    }

    console.log('Starting auto-create orders...');
    console.log(`Current trend: ${TREND}`);

    setInterval(async () => {
        for (let i = 0; i < ORDERS_PER_CYCLE; i++) {
            const order = generateArtificialOrder(stocks);
            await sendArtificialOrder(order);
        }
    }, INTERVAL_MS);
};

startCreatingArtificialOrders();
