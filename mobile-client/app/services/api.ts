import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL, SECURE_STORE_KEYS } from '../utils/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.token);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response interceptor: handle 401 / transform errors ─────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(`[API] Response ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${String(token)}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.refreshToken);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<{ token: string }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        await SecureStore.setItemAsync(SECURE_STORE_KEYS.token, data.token);
        processQueue(null, data.token);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.token);
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform error to a readable message
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Unknown error';

    if (__DEV__) {
      console.error(`[API] Error ${error.response?.status}: ${message}`);
    }

    return Promise.reject(new Error(message));
  },
);
