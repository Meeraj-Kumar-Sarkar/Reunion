import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export const createOrder = async (amount) => {
  const { data } = await api.post('/api/payments/order', { amount });
  return data;
};

export const verifyPayment = async (paymentData) => {
  const { data } = await api.post('/api/payments/verify', paymentData);
  return data;
};

export const getFundingStatus = async () => {
  const { data } = await api.get('/api/payments/status');
  return data;
};

export default api;
