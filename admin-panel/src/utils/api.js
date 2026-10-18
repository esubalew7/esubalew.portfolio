import axios from 'axios';

const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://127.0.0.1:5000"
    : "https://portfolio-backend-gxhv.onrender.com");

const API_BASE_URL = rawBaseUrl.trim().replace(/\/$/, '');

// Axios instance configured for HttpOnly cookie auth + Bearer token fallback.
// withCredentials: true ensures the cookie is sent cross-origin.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

const normalizeError = (error) => {
  let message = error.response?.data?.message || error.message || 'An unexpected API error occurred';
  if (error.message === 'Network Error' && !error.response) {
    message = 'Network Error: Unable to connect to backend server. Please verify network connection or server status.';
  }
  return {
    ...error,
    message,
    status: error.response?.status,
    data: error.response?.data,
  };
};

// Request interceptor — attaches Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    // If sending FormData, let axios set the correct Content-Type with boundary
    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    // On 401, redirect to login (only if not already on /login to avoid refresh loops)
    if (status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }

    return Promise.reject(normalizeError(error));
  }
);


const apiClient = {
  get: (url, config) => api.get(url, config).then((res) => res.data),
  post: (url, data, config) => api.post(url, data, config).then((res) => res.data),
  put: (url, data, config) => api.put(url, data, config).then((res) => res.data),
  delete: (url, config) => api.delete(url, config).then((res) => res.data),
  request: (config) => api.request(config).then((res) => res.data),
};

export default apiClient;