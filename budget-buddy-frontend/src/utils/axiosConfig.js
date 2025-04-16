import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

// Set base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized responses
      if (error.response.status === 401) {
        store.dispatch(logout());
      }
      
      // Handle other error responses
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
); 