import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yatralok_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, remove stale credentials
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        localStorage.removeItem('yatralok_token');
        localStorage.removeItem('yatralok_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
