import axios from 'axios';

const api = axios.create({
  // Priority 1: Vercel Env Var | Priority 2: Hardcoded Production | Priority 3: Local Dev
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://uni-smart-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach JWT to headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Global Errors (Like Expired Tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      // If the backend says the token is invalid or expired
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if we aren't already on the login page to avoid loops
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;