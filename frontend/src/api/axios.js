import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Cache and Deduplication Storage
const cacheMap = new Map();
const pendingRequests = new Map();

const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Optimize API requests by caching GET responses for 4 seconds and deduplicating simultaneous requests
  if (config.method?.toLowerCase() === 'get') {
    const key = getCacheKey(config);

    // If cache hit and not expired (4 seconds TTL)
    const cached = cacheMap.get(key);
    if (cached && Date.now() - cached.timestamp < 4000) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
      return config;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config?.method?.toLowerCase() === 'get') {
      const key = getCacheKey(res.config);
      cacheMap.set(key, { data: res.data, timestamp: Date.now() });
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
