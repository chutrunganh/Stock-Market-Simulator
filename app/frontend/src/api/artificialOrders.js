import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const startArtificialOrders = async (config) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/artificial-orders/start`, config, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const stopArtificialOrders = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/artificial-orders/stop`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getArtificialOrdersStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/artificial-orders/status`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 