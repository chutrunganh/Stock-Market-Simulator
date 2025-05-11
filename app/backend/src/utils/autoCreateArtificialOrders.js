import axios from 'axios';
import { getLatestStockPriceByStockIdService, getAllStocksWithLatestPricesService } from '../services/stockPriceCRUDService.js';
import { getAllStockService } from '../services/stockCRUDService.js';

// Constants
const SERVER_URL = 'http://localhost:3000/api/orders';
const ADMIN_JWT = 'your_admin_jwt_token_here'; //replace with admin token when signed up
const INTERVAL_MS = 5000; //one order every 5 sec = one cycle
const ORDERS_PER_CYCLE = 500; //num of orders per cycle 
const BASE_TREND = 'neutral'; // 'buy-dominant', 'sell-dominant', 'neutral'

// Market events configuration
const MARKET_EVENTS = {
    TECH_BOOM: {
        name: 'Tech Boom',
        description: 'Tech stocks experiencing strong bull run',
        affectedIndustries: ['Technology'],
        probability: 0.05, // 5% chance per cycle
        duration: 12, // Duration in cycles (60 seconds)
        effect: {
            buyRatio: 0.8, // 80% buy orders
            priceModifier: 1.03, // Price tends to go up
        }
    },
    FINANCIAL_CRISIS: {
        name: 'Financial Crisis',
        description: 'Banking and financial stocks under heavy selling pressure',
        affectedIndustries: ['Financials'],
        probability: 0.04,
        duration: 15,
        effect: {
            buyRatio: 0.2, // 20% buy orders, 80% sell
            priceModifier: 0.96, // Price tends to go down
        }
    },
    MARKET_CRASH: {
        name: 'Market Crash',
        description: 'Widespread panic selling across all sectors',
        affectedIndustries: ['all'],
        probability: 0.02, // Rare event
        duration: 10,
        effect: {
            buyRatio: 0.15,
            priceModifier: 0.94,
        }
    },
    RECOVERY_RALLY: {
        name: 'Recovery Rally',
        description: 'Market recovery after extended downturn',
        affectedIndustries: ['all'],
        probability: 0.03,
        duration: 20,
        effect: {
            buyRatio: 0.75,
            priceModifier: 1.02,
        }
    },
};

// Track active market events and their durations
let activeEvents = [];
// Current trend based on events or default
let currentTrend = BASE_TREND;
// Track consecutive down movements for stocks
let consecutiveDownMoves = {};

const getAvailableStocksAndPrices = async () => {
    try {
        // Fetch all stocks with their latest prices
        const stocksWithPrices = await getAllStocksWithLatestPricesService();

        // Filter out stocks with invalid or missing prices
        const validStocks = stocksWithPrices.filter(stock => {
            if (!stock.reference_price || isNaN(stock.reference_price)) {
                console.error(`Invalid or missing price for stock ID ${stock.stock_id}`);
                return false; // Exclude invalid stocks with latest price = Nan or undefined
            }
            return true;
        });

        // Map the result to include the latest price as `latestPrice`
        return validStocks.map(stock => ({
            ...stock,
            latestPrice: stock.reference_price,
        }));
    } catch (error) {
        console.error('Error fetching stocks and prices:', error.message);
        throw error;
    }
};

// Function to check if a market event should be triggered
const checkForMarketEvents = () => {
    // Process any existing events that need to end
    activeEvents = activeEvents.filter(event => {
        event.remainingCycles--;
        if (event.remainingCycles <= 0) {
            console.log(`Market event ended: ${event.name}`);
            return false;
        }
        return true;
    });

    // Only try to trigger new events if we don't have too many active
    if (activeEvents.length < 2) {
        // Check each potential event
        Object.values(MARKET_EVENTS).forEach(event => {
            if (Math.random() < event.probability) {
                // Make sure we don't have this event type active already
                if (!activeEvents.some(e => e.name === event.name)) {
                    console.log(`New market event: ${event.name} - ${event.description}`);
                    activeEvents.push({
                        ...event,
                        remainingCycles: event.duration,
                    });
                }
            }
        });
    }
};

// Function to track consecutive down movements and trigger recovery
const trackStockMovements = (stocks) => {
    stocks.forEach(stock => {
        const stockId = stock.stock_id;
        
        // Initialize if not present
        if (!consecutiveDownMoves[stockId]) {
            consecutiveDownMoves[stockId] = {
                count: 0,
                lastPrice: stock.latestPrice,
                inRecovery: false,
                recoveryStrength: 0,
                recoveryDuration: 0
            };
        }
        
        const stockData = consecutiveDownMoves[stockId];
        const currentPrice = stock.latestPrice;
        
        // If in recovery mode, update recovery status
        if (stockData.inRecovery) {
            stockData.recoveryDuration--;
            if (stockData.recoveryDuration <= 0) {
                stockData.inRecovery = false;
                stockData.recoveryStrength = 0;
                console.log(`Stock ${stock.symbol} recovery period ended`);
            }
        }
        // Otherwise track price movements
        else if (currentPrice < stockData.lastPrice) {
            stockData.count++;
            console.log(`Stock ${stock.symbol} down for ${stockData.count} consecutive cycles`);
            
            // If we see 5+ consecutive down moves, trigger recovery
            if (stockData.count >= 5 && !stockData.inRecovery) {
                stockData.inRecovery = true;
                stockData.recoveryStrength = 0.6 + (Math.random() * 0.3); // 60-90% recovery strength
                stockData.recoveryDuration = 8 + Math.floor(Math.random() * 5); // 8-12 cycle recovery
                console.log(`Stock ${stock.symbol} initiating recovery after ${stockData.count} down moves`);
            }
        } else {
            stockData.count = 0; // Reset counter if price went up
        }
        
        // Update last price
        stockData.lastPrice = currentPrice;
    });
};

const generateArtificialOrder = (stocks) => {
    // Initialize with empty array if there are no affected stocks
    let affectedStocks = [];
    let orderParameters = {
        buyRatio: 0.5, // Default is neutral
        priceModifier: 1.0 // No modification by default
    };
    
    // Check if we have active events
    if (activeEvents.length > 0) {
        // Combine effects from all active events
        activeEvents.forEach(event => {
            // Get stocks affected by this event
            let eventAffectedStocks = stocks;
            
            // Filter by industry if the event doesn't affect all industries
            if (event.affectedIndustries[0] !== 'all') {
                eventAffectedStocks = stocks.filter(stock => 
                    event.affectedIndustries.includes(stock.industry)
                );
            }
            
            // Add these stocks to our affected pool
            affectedStocks = [...affectedStocks, ...eventAffectedStocks];
            
            // Update order parameters based on strongest effect
            if (Math.abs(event.effect.buyRatio - 0.5) > Math.abs(orderParameters.buyRatio - 0.5)) {
                orderParameters.buyRatio = event.effect.buyRatio;
            }
            
            // Price modifier is multiplicative
            orderParameters.priceModifier *= event.effect.priceModifier;
        });
    }
    
    // If no stocks are affected by events, use all stocks
    if (affectedStocks.length === 0) {
        affectedStocks = stocks;
    }
    
    // Remove duplicates from affected stocks
    affectedStocks = [...new Map(affectedStocks.map(stock => [stock.stock_id, stock])).values()];
    
    // Select a random stock from affected ones
    const randomStock = affectedStocks[Math.floor(Math.random() * affectedStocks.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;

    // Calculate ceiling and floor price - in ±7% range
    const referencePrice = randomStock.latestPrice;
    const floorPrice = referencePrice * 0.93; // 7% down
    const ceilPrice = referencePrice * 1.07; // 7% up
    
    // Check if this stock is in recovery mode
    const stockRecovery = consecutiveDownMoves[randomStock.stock_id];
    let recoveryMode = false;
    
    if (stockRecovery && stockRecovery.inRecovery) {
        recoveryMode = true;
        orderParameters.buyRatio = stockRecovery.recoveryStrength; // Adjust buy ratio for recovery
        orderParameters.priceModifier = 1.01 + (Math.random() * 0.02); // Slight upward bias
    }

    // Generate initial random price within the legal range
    let modifiedPrice = floorPrice + Math.random() * (ceilPrice - floorPrice);

    // Apply price modifier from events or recovery
    modifiedPrice = parseFloat((modifiedPrice * orderParameters.priceModifier).toFixed(2));

    //scale the modified price so that it pass the validLimitOrderPrice middleware

    if (modifiedPrice < floorPrice){
        modifiedPrice = floorPrice;
    }
    if (modifiedPrice > ceilPrice){
        modifiedPrice = ceilPrice;
    }

    // Ensure price stays strictly within floor/ceiling (±7% of reference price)
    modifiedPrice = Math.max(floorPrice, Math.min(ceilPrice, modifiedPrice));
    
    let orderType;
    // Additional check for slump conditions
    if (orderType === 'Limit Sell' && consecutiveDownMoves[randomStock.stock_id]?.count >= 3 && !recoveryMode) {
        // Price pressure increases with consecutive down moves
        const pressureFactor = 0.98 - (Math.min(consecutiveDownMoves[randomStock.stock_id].count, 10) * 0.005);
        // Apply pressure factor but ensure we don't go below floor price
        modifiedPrice = Math.max(floorPrice, modifiedPrice * pressureFactor);
    }

    // Final rounding to 2 decimal places
    modifiedPrice = parseFloat(modifiedPrice.toFixed(2));
    
    // Determine order type
    
    const marketChance = 0.2; // 20% market orders
    const rand = Math.random();

    if (rand < marketChance) {
        orderType = Math.random() > orderParameters.buyRatio ? 'Market Sell' : 'Market Buy';
    } else {
        // Use event-influenced buy ratio
        orderType = Math.random() < orderParameters.buyRatio ? 'Limit Buy' : 'Limit Sell';
    }
    
    const order = {
        stockId: randomStock.stock_id,
        quantity,
        price: orderType.includes('Limit') ? modifiedPrice : undefined,
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
        if (error.response) {
            // use to check the error's details
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        process.exit(1);
    }
};

// Main function
const startCreatingArtificialOrders = async () => {
    const stocks = await getAvailableStocksAndPrices();
    if (stocks.length === 0) {
        console.error('No stocks available to create orders.');
        return;
    }
    console.log('Starting auto-create orders...');
    console.log(`Base trend: ${BASE_TREND}`);
    
    setInterval(async () => {
        // Check for market events at the start of each cycle
        checkForMarketEvents();
        
        // Update stock movement tracking
        trackStockMovements(stocks);
        
        // Log active events
        if (activeEvents.length > 0) {
            console.log('Active market events:');
            activeEvents.forEach(event => {
                console.log(`- ${event.name} (${event.remainingCycles} cycles remaining)`);
            });
        }
        
        for (let i = 0; i < ORDERS_PER_CYCLE; i++) {
            const order = generateArtificialOrder(stocks);
            await sendArtificialOrder(order);
        }
    }, INTERVAL_MS);
};

startCreatingArtificialOrders();
