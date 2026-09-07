import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('harvesthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Important: let the browser generate the multipart boundary for FormData.
    // Setting a JSON content type here prevents Cloudinary uploads from being
    // parsed as files on the backend.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (token expired) — but not for auth endpoints themselves,
// since a wrong-password login also returns 401 and shouldn't force a redirect.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRequest = AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('harvesthub_token');
      localStorage.removeItem('harvesthub_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;