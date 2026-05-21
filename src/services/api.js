import axios from 'axios';

const DEFAULT_LOCAL_API_URL = 'http://localhost:3000';
const DEFAULT_FALLBACK_API_URL = 'https://sanctions-intelligence-management-system.onrender.com';

function cleanUrl(url) {
  return String(url || '').replace(/\/$/, '');
}

export const API_URLS = [
  cleanUrl(import.meta.env.VITE_API_URL || DEFAULT_LOCAL_API_URL),
  cleanUrl(import.meta.env.VITE_API_FALLBACK_URL || DEFAULT_FALLBACK_API_URL),
].filter((url, index, urls) => url && urls.indexOf(url) === index);

export let API_BASE_URL = API_URLS[0];

export function getApiBaseUrl() {
  return API_BASE_URL;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
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

// Response interceptor for handling global errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const fallbackUrl = API_URLS.find((url) => url !== API_BASE_URL);
    const canRetryOnFallback = !error.response && fallbackUrl && originalRequest && !originalRequest.__usedApiFallback;

    if (canRetryOnFallback) {
      API_BASE_URL = fallbackUrl;
      api.defaults.baseURL = fallbackUrl;
      originalRequest.baseURL = fallbackUrl;
      originalRequest.__usedApiFallback = true;
      console.warn(`Local API unavailable. Retrying request with fallback API: ${fallbackUrl}`);
      return api.request(originalRequest);
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Update: we'll handle redirect in the component/context if needed
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
