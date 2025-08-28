import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://vakya-sangham-62l7.onrender.com', // <- yaha apna Render backend URL lagao
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', // Disable caching
    Pragma: 'no-cache',
    Expires: '0',
  },
  timeout: 60000, // Optional: 10s timeout
});

// Attach token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Log responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API ERROR]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
