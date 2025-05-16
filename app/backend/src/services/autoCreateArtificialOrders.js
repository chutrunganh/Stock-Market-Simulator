import { getAllStocksWithLatestPricesService } from './stockPriceCRUDService.js';

// Market events configuration
const MARKET_EVENTS = {
    TECH_BOOM: {
        name: 'Tech Boom',
        description: 'Tech stocks experiencing strong bull run',
        affectedIndustries: ['Technology'],
        probability: 0.05,
        duration: 12,
        effect: {
            buyRatio: 0.8,
            priceModifier: 1.03,
        }
    },
    FINANCIAL_CRISIS: {
        name: 'Financial Crisis',
        description: 'Banking and financial stocks under heavy selling pressure',
        affectedIndustries: ['Financials'],
        probability: 0.04,
        duration: 15,
        effect: {
            buyRatio: 0.2,
            priceModifier: 0.96,
        }
    },
    MARKET_CRASH: {
        name: 'Market Crash',
        description: 'Widespread panic selling across all sectors',
        affectedIndustries: ['all'],
        probability: 0.02,
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
        const stocksWithPrices = await getAllStocksWithLatestPricesService();
        return stocksWithPrices.filter(stock => stock.reference_price && !isNaN(stock.reference_price))
            .map(stock => ({
                ...stock,
                latestPrice: stock.reference_price,
            }));
    } catch (error) {
        console.error('Error fetching stocks and prices:', error.message);
        throw error;
    }
};

const checkForMarketEvents = () => {
    activeEvents = activeEvents.filter(event => {
        event.remainingCycles--;
        if (event.remainingCycles <= 0) {
            console.log(`Market event ended: ${event.name}`);
            return false;
        }
        return true;
    });

    if (activeEvents.length < 2) {
        Object.values(MARKET_EVENTS).forEach(event => {
            if (Math.random() < event.probability && !activeEvents.some(e => e.name === event.name)) {
                console.log(`New market event: ${event.name} - ${event.description}`);
                activeEvents.push({
                    ...event,
                    remainingCycles: event.duration,
                });
            }
        });
    }
};

const trackStockMovements = (stocks) => {
    stocks.forEach(stock => {
        const stockId = stock.stock_id;
        
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
        
        if (stockData.inRecovery) {
            stockData.recoveryDuration--;
            if (stockData.recoveryDuration <= 0) {
                stockData.inRecovery = false;
                stockData.recoveryStrength = 0;
            }
        } else if (currentPrice < stockData.lastPrice) {
            stockData.count++;
            
            if (stockData.count >= 5 && !stockData.inRecovery) {
                stockData.inRecovery = true;
                stockData.recoveryStrength = 0.6 + (Math.random() * 0.3);
                stockData.recoveryDuration = 8 + Math.floor(Math.random() * 5);
            }
        } else {
            stockData.count = 0;
        }
        
        stockData.lastPrice = currentPrice;
    });
};

const generateArtificialOrder = (stocks, baseTrend = 'neutral') => {
    let affectedStocks = [];
    let orderParameters = {
        buyRatio: baseTrend === 'buy-dominant' ? 0.7 : 
                 baseTrend === 'sell-dominant' ? 0.3 : 0.5,
        priceModifier: 1.0
    };
    
    if (activeEvents.length > 0) {
        activeEvents.forEach(event => {
            let eventAffectedStocks = event.affectedIndustries[0] === 'all' 
                ? stocks 
                : stocks.filter(stock => event.affectedIndustries.includes(stock.industry));
            
            affectedStocks = [...affectedStocks, ...eventAffectedStocks];
            
            if (Math.abs(event.effect.buyRatio - 0.5) > Math.abs(orderParameters.buyRatio - 0.5)) {
                orderParameters.buyRatio = event.effect.buyRatio;
            }
            
            orderParameters.priceModifier *= event.effect.priceModifier;
        });
    }
    
    affectedStocks = affectedStocks.length > 0 ? affectedStocks : stocks;
    affectedStocks = [...new Map(affectedStocks.map(stock => [stock.stock_id, stock])).values()];
    
    const randomStock = affectedStocks[Math.floor(Math.random() * affectedStocks.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const referencePrice = randomStock.latestPrice;
    const floorPrice = referencePrice * 0.93;
    const ceilPrice = referencePrice * 1.07;
    
    const stockRecovery = consecutiveDownMoves[randomStock.stock_id];
    if (stockRecovery?.inRecovery) {
        orderParameters.buyRatio = stockRecovery.recoveryStrength;
        orderParameters.priceModifier = 1.01 + (Math.random() * 0.02);
    }

    let modifiedPrice = floorPrice + Math.random() * (ceilPrice - floorPrice);
    modifiedPrice = parseFloat((modifiedPrice * orderParameters.priceModifier).toFixed(2));
    modifiedPrice = Math.max(floorPrice, Math.min(ceilPrice, modifiedPrice));
    
    const marketChance = 0.2;
    const orderType = Math.random() < marketChance
        ? (Math.random() > orderParameters.buyRatio ? 'Market Sell' : 'Market Buy')
        : (Math.random() < orderParameters.buyRatio ? 'Limit Buy' : 'Limit Sell');
    
    return {
        stockId: randomStock.stock_id,
        quantity,
        price: orderType.includes('Limit') ? modifiedPrice : undefined,
        orderType
    };
};

const startCreatingArtificialOrders = async (config = {}, createOrderCallback) => {
    const stocks = await getAvailableStocksAndPrices();
    if (stocks.length === 0) {
        throw new Error('No stocks available to create orders.');
    }

    return setInterval(async () => {
        checkForMarketEvents();
        trackStockMovements(stocks);
        
        const ordersToCreate = config.ordersPerCycle || 5;
        for (let i = 0; i < ordersToCreate; i++) {
            try {
                const order = generateArtificialOrder(stocks, config.baseTrend);
                await createOrderCallback(order);
            } catch (error) {
                console.error('Failed to create artificial order:', error.message);
            }
        }
    }, config.intervalMs || 5000);
};

export default { startCreatingArtificialOrders };
