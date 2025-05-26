import autoCreateArtificialOrders from '../services/autoCreateArtificialOrders.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust based on relative depth


dotenv.config();

let artificialOrdersInterval = null;
let currentConfig = {
    intervalMs: 5000,
    ordersPerCycle: 5,
    baseTrend: 'neutral'
};

const BASE_URL = process.env.BE_URL;

const createOrder = async (order) => {
    try {
        await axios.post(`${BASE_URL}/api/orders/createArtiOrder`, order);
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error; 
    }
};

export const startArtificialOrders = async (req, res) => {
    try {
        const { intervalMs, ordersPerCycle, baseTrend } = req.body;
        
        // Update configuration if provided
        if (intervalMs) currentConfig.intervalMs = intervalMs;
        if (ordersPerCycle) currentConfig.ordersPerCycle = ordersPerCycle;
        if (baseTrend) currentConfig.baseTrend = baseTrend;

        // Start the service with new configuration
        artificialOrdersInterval = await autoCreateArtificialOrders.startCreatingArtificialOrders(
            currentConfig,
            createOrder
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Artificial orders service started',
            config: currentConfig
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const stopArtificialOrders = (req, res) => {
    try {
        if (artificialOrdersInterval) {
            clearInterval(artificialOrdersInterval);
            artificialOrdersInterval = null;
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Artificial orders service stopped'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getArtificialOrdersStatus = (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            data: {
                isActive: artificialOrdersInterval !== null,
                config: currentConfig
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 