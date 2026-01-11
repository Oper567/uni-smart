import axios from 'axios';

const api = axios.create({
  // Optimized baseURL: removes the hardcoded string to ensure you always know which environment you're hitting
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // Check for window to ensure we are on the client side
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

// --- 2. RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined') {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Capture current path to redirect back after re-login
        const currentPath = window.location.pathname;
        
        if (currentPath !== '/login' && currentPath !== '/register') {
          // Add a flag to the URL so the login page can show a "Session Expired" message
          window.location.href = `/login?expired=true&returnUrl=${currentPath}`;
        }
      }
    }

    // Handle 500+ errors or Network errors
    if (!error.response) {
      console.error("Network Error: Please check if the backend is running.");
    }

    return Promise.reject(error);
  }
);

export default api;