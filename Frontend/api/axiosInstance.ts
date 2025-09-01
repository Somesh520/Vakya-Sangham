// api/axiosInstance.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vakya-sangham-2.onrender.com/', // 🔥 No trailing space
});

export default api;