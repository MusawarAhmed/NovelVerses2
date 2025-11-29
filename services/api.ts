import axios from 'axios';

// Simple and robust API URL selection
const isProduction = import.meta.env.MODE === 'production';
const baseURL = isProduction ? '/api' : 'http://localhost:5000/api';

console.log('🔌 API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
