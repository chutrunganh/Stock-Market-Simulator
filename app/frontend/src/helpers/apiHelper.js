import { API_BASE_URL } from '../config/apiConfig';

export const apiRequest = async (endpoint, method = 'POST', body = null) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error.message);
    throw error;
  }
};