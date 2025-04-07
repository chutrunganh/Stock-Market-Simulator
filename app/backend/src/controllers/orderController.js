import { 
    createOrderService, 
    getOrderByIdService, 
    getAllOrdersService 
} from '../services/orderCRUDService.js';

const handleResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        status,
        message,
        data,
    });
};

// Controller to create a new order
export const createOrder = async (req, res, next) => {
    const { userId, stockId, quantity, price, orderType } = req.body;
    try {
        const newOrder = await createOrderService({ userId, stockId, quantity, price, orderType });
        handleResponse(res, 201, 'Order created successfully', newOrder);
    } catch (error) {
        next(error);
    }
};

// Controller to get an order by ID
export const getOrderById = async (req, res, next) => {
    const { orderId } = req.params;
    try {
        const order = await getOrderByIdService(orderId);
        if (!order) {
            return handleResponse(res, 404, 'Order not found');
        }
        handleResponse(res, 200, 'Order retrieved successfully', order);
    } catch (error) {
        next(error);
    }
};

// Controller to get all orders
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await getAllOrdersService();
        handleResponse(res, 200, 'Orders retrieved successfully', orders);
    } catch (error) {
        next(error);
    }
};