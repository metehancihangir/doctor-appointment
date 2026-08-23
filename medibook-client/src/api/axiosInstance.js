import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // HttpOnly cookie (refresh token) için gerekli
});

// ─── Request Interceptor ─────────────────────────────────────────
// Her isteğe Authorization header ekler
// Access token memory'de (AuthContext'te) tutulur
api.interceptors.request.use(
  (config) => {
    // Access token AuthContext'ten gelecek (Faz 2'de doldurulacak)
    // const token = getAccessToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────
// 401 → refresh token → başarısız isteği tekrar dene
// (Faz 2'de tam implementasyon yapılacak)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Faz 2'de: 401 alınırsa /auth/refresh çağır, başarısızsa logout
    return Promise.reject(error);
  }
);

export default api;
