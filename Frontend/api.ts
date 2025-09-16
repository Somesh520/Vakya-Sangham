// api.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;
/** Call this from AuthContext once, e.g. setApiUnauthorizedHandler(() => signOut()); */
export const setApiUnauthorizedHandler = (fn: UnauthorizedHandler) => { onUnauthorized = fn; };

const api = axios.create({
  baseURL: 'https://vakya-sangham-62l7.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  },
  timeout: 60000,
});

/* -------------------- Attach access token -------------------- */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------- Refresh flow -------------------- */
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

const resolveQueue = (error: any, token: string | null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token as string)));
  queue = [];
};

api.interceptors.response.use(
  (response) => {
    // Optional debug: console.log(`[API] ${response.status} - ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean });

    // Only handle 401 from our API (avoid infinite loops)
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in progress, wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (newToken: string) => {
              if (!originalRequest.headers) originalRequest.headers = {};
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        // 👉 No refresh token available: clear & notify, but DON'T throw a new error
        if (!refreshToken) {
          await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
          resolveQueue(null, null);
          if (onUnauthorized) onUnauthorized(); // e.g., signOut() -> navigate to Login
          return Promise.reject(error);
        }

        // Call refresh endpoint
        const res = await axios.post(
          'https://vakya-sangham-62l7.onrender.com/auth/refresh',
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
        );

        const newAccessToken: string | undefined = res.data?.accessToken;
        const newRefreshToken: string | undefined = res.data?.refreshToken; // if your API returns one

        if (!newAccessToken) {
          // Refresh failed / malformed response
          await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
          resolveQueue(null, null);
          if (onUnauthorized) onUnauthorized();
          return Promise.reject(error);
        }

        // Persist new tokens
        await AsyncStorage.setItem('userToken', newAccessToken);
        if (newRefreshToken) await AsyncStorage.setItem('refreshToken', newRefreshToken);

        // Update defaults and retry original
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        resolveQueue(null, newAccessToken);

        // Retry the original request with the new token
        if (!originalRequest.headers) originalRequest.headers = {};
        (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Final failure: clear & notify
        await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
        resolveQueue(refreshErr, null);
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // All other errors: just pass through
    // Optional: console.error('[API ERROR]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
