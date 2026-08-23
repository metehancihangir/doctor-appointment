import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // HttpOnly cookie (refresh token) için gerekli
});

let accessToken = null;

export const setApiAccessToken = (token) => {
  accessToken = token;
};

// ─── Request Interceptor ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry only once for 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if the failed request was a refresh or login
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.accessToken;
        setApiAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Notify any listeners (like AuthContext) that token was updated
        window.dispatchEvent(new CustomEvent('auth:token_refreshed', { detail: newToken }));

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user should be logged out
        setApiAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
