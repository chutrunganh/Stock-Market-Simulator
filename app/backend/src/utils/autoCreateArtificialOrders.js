import axios from 'axios';
// node src/utils/createArtificialOrders.js to run this file

//define constants
const SERVER_URL = 'http://localhost:3000/api';
const ADMIN_JWT = 'your_admin_jwt_token_here'; 
//Replace above with the admin JWT token
//in reality we shoud login with admin account to get the token
const INTERVAL_MS = 5000; //delay to send requests (5 seconds)

// Helper function to get available stocks
const getAvailableStocks = async () => {
    try {
        const response = await axios.get(`${SERVER_URL}/stocks`, {
            headers: {
                Authorization: `Bearer ${ADMIN_JWT}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching stocks:', error.message);
        return [];
    }
};

// Helper function to generate random artificial orders
const generateArtificialOrder = (stocks) => {
    const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
    const randomQuantity = Math.floor(Math.random() * 100) + 1; // Random quantity between 1 and 100
    const randomPrice = parseFloat(
        (randomStock.referencePrice * (1 + (Math.random() * 0.14 - 0.07))).toFixed(2)
    ); // Random price within ±7% of reference price
    const orderType = Math.random() > 0.5 ? 'Limit Buy' : 'Limit Sell'; // Randomly choose buy or sell

    return {
        stockId: randomStock.id,
        quantity: randomQuantity,
        price: randomPrice,
        orderType,
    };
};

// Helper function to send artificial order to the server
const sendArtificialOrder = async (order) => {
    try {
        const response = await axios.post(`${SERVER_URL}/createArtiOrder`, order, {
            headers: {
                Authorization: `Bearer ${ADMIN_JWT}`,
            },
        });
        console.log('Artificial order created:', response.data);
    } catch (error) {
        console.error('Error creating artificial order:', error.message);
    }
};

// Main function to periodically create artificial orders
const startCreatingArtificialOrders = async () => {
    const stocks = await getAvailableStocks();
    if (stocks.length === 0) {
        console.error('No stocks available to create orders.');
        return;
    }

    console.log('Starting to create artificial orders...');
    setInterval(async () => {
        const order = generateArtificialOrder(stocks);
        console.log('Generated order:', order);
        await sendArtificialOrder(order);
    }, INTERVAL_MS);
};

// Start the script
startCreatingArtificialOrders();