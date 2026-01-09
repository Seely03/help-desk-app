import axios from 'axios';

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? '/api'                   // Production: Use relative path (same domain)
    : 'http://localhost:5000/api', // Development: Point to local backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (The "Magic" Part)
// This runs before every request. It checks if we have a token and attaches it.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // We will save the token here on login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (Optional but helpful)
// If the token is expired (401), we can auto-logout the user
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;