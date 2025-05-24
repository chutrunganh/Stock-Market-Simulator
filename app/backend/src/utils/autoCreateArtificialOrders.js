import axios from 'axios';
import { getAllStocksWithLatestPricesService } from '../services/stockPriceCRUDService.js';
import {createNoise2D} from 'simplex-noise';


const perlinInstance = createNoise2D();
// Constants
const SERVER_URL = 'http://localhost:3000/api';
const ADMIN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEwN2ExYjg3LTM5ODgtNDU5ZS1hYzkxLTMxNjVlM2FkYjRlMCIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN0b2NrbWFya2V0LmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJsb2dpbl9hdCI6MTc0ODEwMTg0NzEyMSwiaWF0IjoxNzQ4MTAxODQ3LCJleHAiOjE3NDgxMDM5NDd9.hSRaUC-iyQ74tgo1stlXyb4Pp82nW-zQKO2eXqBVBE0'; // Replace with your actual JWT token
const INTERVAL_MS = 5000; //one order every 5 sec = one cycle
const ORDERS_PER_CYCLE = 100; //num of orders per cycle 
const BASE_TREND = 'neutral'; // 'buy-dominant', 'sell-dominant', 'neutral'
const DEFAULT_BUY_RATIO = 0.6; 
let perlinTime = 0;
const PERLIN_TIME_STEP = 0.01; // Controls how "fast" the noise changes

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

const generateArtificialOrder = (
    stockForOrder,          // The specific stock to generate an order for (from the queue)
    allStocks,              // Full list of stocks (for context, if needed for broader rules)
    currentActiveEvents,    // Array of currently active market events
    currentStockMovements,  // Object tracking consecutive down moves for stocks
    perlinNoiseInstance,    // Pass your Perlin noise instance
    currentTimeForNoise     // Pass the current time/step for Perlin noise
) => {
    let orderParameters = {
        buyRatio: DEFAULT_BUY_RATIO, // Changed from 0.5 to 0.4 (40% buy, 60% sell)
        priceModifier: 1.0 // No modification by default
    };

    // --- Conceptual Perlin Noise Integration for base buyRatio ---
    if (perlinNoiseInstance && typeof currentTimeForNoise !== 'undefined') {
        // Generate a noise value (typically 0 to 1, or -1 to 1 depending on library)
        // Using stockForOrder.stock_id or an index as an offset to vary noise per stock.
        let noiseValForBuyRatio = perlinNoiseInstance(currentTimeForNoise + (stockForOrder.stock_id % 10));
        
        // Map the noise value to modulate the buyRatio
        // Example: if noise is 0-1, map it to a +/- 0.2 range around the base DEFAULT_BUY_RATIO
        let buyRatioModulation = (noiseValForBuyRatio - 0.5) * 0.4; // Results in modulation from -0.2 to +0.2
        let perlinInfluencedBuyRatio = DEFAULT_BUY_RATIO + buyRatioModulation;
        orderParameters.buyRatio = Math.max(0.1, Math.min(0.9, perlinInfluencedBuyRatio)); // Clamp between 10% and 90%
    }
    // --- End Perlin Noise for buyRatio ---

    // --- Conceptual Perlin Noise Integration for base priceModifier ---
    if (perlinNoiseInstance && typeof currentTimeForNoise !== 'undefined') {
        // Using a different offset for price modifier noise
        let noiseValForPriceMod = perlinNoiseInstance(currentTimeForNoise + (stockForOrder.stock_id % 10) + 0.5); // Example offset
        // Map noise (e.g., 0-1) to a small dynamic price pressure, e.g., 0.995 to 1.005
        let perlinPriceInfluence = 0.995 + (noiseValForPriceMod * 0.01);
        orderParameters.priceModifier *= perlinPriceInfluence; // Apply multiplicatively
    }
    // --- End Perlin Noise for priceModifier ---
    
    // Always reset to default buy ratio before applying event effects
    orderParameters.buyRatio = DEFAULT_BUY_RATIO;
    
    // Check if stockForOrder is affected by active events
    if (currentActiveEvents.length > 0) {
        currentActiveEvents.forEach(event => {
            let isEventApplicableToThisStock = false;
            if (event.affectedIndustries[0] === 'all' || event.affectedIndustries.includes(stockForOrder.industry)) {
                isEventApplicableToThisStock = true;
            }
            
            if (isEventApplicableToThisStock) {
                // Event effects override default values
                orderParameters.buyRatio = event.effect.buyRatio;
                // Event price modifier is multiplicative
                orderParameters.priceModifier *= event.effect.priceModifier;
            }
        });
    }
    
    const quantity = Math.floor(Math.random() * 100) + 1;

    const referencePrice = stockForOrder.latestPrice;
    
    const floorPrice = referencePrice * 0.93;
    const ceilPrice = referencePrice * 1.07;
    
    const stockRecoveryData = currentStockMovements[stockForOrder.stock_id];
    let recoveryMode = false;
    
    if (stockRecoveryData && stockRecoveryData.inRecovery) {
        recoveryMode = true;
        // Recovery mode can override other buyRatio settings
        orderParameters.buyRatio = stockRecoveryData.recoveryStrength;
        // Recovery mode also has its own price modifier logic
        orderParameters.priceModifier *= (1.01 + (Math.random() * 0.02));
    }

    let modifiedPrice = floorPrice + Math.random() * (ceilPrice - floorPrice); //
    modifiedPrice = parseFloat((modifiedPrice * orderParameters.priceModifier).toFixed(2)); //

    if (modifiedPrice < floorPrice){ //
        modifiedPrice = (floorPrice + 1).toFixed(2); //
    }
    if (modifiedPrice > ceilPrice){ //
        modifiedPrice = (ceilPrice-1).toFixed(2); //
    }
    // Ensure price stays strictly within floor/ceiling (already done by above, but Math.min/max is safer)
    modifiedPrice = Math.max(floorPrice, Math.min(ceilPrice, modifiedPrice)); //
    
    let orderType;
    // Slump condition check:
    // The original code had 'orderType' in the condition before it was defined.
    // We'll determine a preliminary order direction based on buyRatio for this check.
    const isLikelySellForSlumpCheck = Math.random() >= orderParameters.buyRatio;

    if (isLikelySellForSlumpCheck && stockRecoveryData?.count >= 3 && !recoveryMode) { //
        const pressureFactor = 0.98 - (Math.min(stockRecoveryData.count, 10) * 0.005); //
        modifiedPrice = Math.max(floorPrice, modifiedPrice * pressureFactor); //
    }

    modifiedPrice = parseFloat(modifiedPrice.toFixed(2)); //
    
    const marketChance = 0.2; // 20% market orders
    const randOrderCategory = Math.random(); //

    if (randOrderCategory < marketChance) { // It's a Market Order
        // Market orders still influenced by the dynamic buyRatio
        orderType = Math.random() > orderParameters.buyRatio ? 'Market Sell' : 'Market Buy';
    } else { // It's a Limit Order
        // For Limit orders, ensure a 50/50 balance between Buy and Sell
        orderType = Math.random() < 0.5 ? 'Limit Buy' : 'Limit Sell';
    }
    
    const order = {
        stockId: stockForOrder.stock_id,
        quantity, //
        price: orderType.includes('Limit') ? modifiedPrice : undefined, //
        orderType //
    };

    return order; //
};

const sendArtificialOrder = async (order) => {
    try {
        const response = await axios.post(`${SERVER_URL}/orders/createArtiOrder`, order, {
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
// Main function
const startCreatingArtificialOrders = async () => {
    const allFetchedStocks = await getAvailableStocksAndPrices(); // Renamed for clarity
    if (allFetchedStocks.length === 0) {
        console.error('No stocks available to create orders.');
        return;
    }
    //console.log("Fectched stock list: ",allFetchedStocks); //to check if returned stock list is valid
    let stockQueue = [...allFetchedStocks]; // Initialize the queue with all stocks

    console.log('Starting auto-create orders...');
    console.log(`Base trend: ${BASE_TREND}`); //
    
    setInterval(async () => {
        checkForMarketEvents(); //
        trackStockMovements(allFetchedStocks); // Pass all stocks for tracking
        
        if (activeEvents.length > 0) {
            console.log('Active market events:'); //
            activeEvents.forEach(event => { //
                console.log(`- ${event.name} (${event.remainingCycles} cycles remaining)`); //
            });
        }
        
        for (let i = 0; i < ORDERS_PER_CYCLE; i++) { //
            if (stockQueue.length === 0) {
                // Refill queue if empty to continue cycling.
                // Alternatively, you could stop or handle this differently.
                if (allFetchedStocks.length === 0) {
                    console.error("No stocks to process in queue and no stocks to refill from.");
                    break; 
                }
                console.warn("Stock queue was empty, refilling...");
                stockQueue = [...allFetchedStocks];
            }

            const currentStockToProcess = stockQueue.shift(); // Get stock from front of queue

            // Pass currentStockToProcess, allFetchedStocks (for context), activeEvents, and consecutiveDownMoves
            const order = generateArtificialOrder(
                currentStockToProcess,
                allFetchedStocks,
                activeEvents,         
                consecutiveDownMoves, 
                perlinInstance,       
                perlinTime            
            );
            if (order){
                await sendArtificialOrder(order); 
            }
            stockQueue.push(currentStockToProcess); // Add stock to the end of the queue
            perlinTime += PERLIN_TIME_STEP;
        }
    }, INTERVAL_MS); //
};

startCreatingArtificialOrders();