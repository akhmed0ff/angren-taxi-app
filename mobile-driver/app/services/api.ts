import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from '../types';

declare const process:
  | { env: Record<string, string | undefined> }
  | undefined;

const API_URL = process?.env?.API_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = '@angren_driver:access_token';
const REFRESH_TOKEN_KEY = '@angren_driver:refresh_token';

export const saveTokens = async (tokens: AuthTokens): Promise<void> => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
  ]);
};

export const loadTokens = async (): Promise<AuthTokens | null> => {
  const pairs = await AsyncStorage.multiGet([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  const accessToken = pairs[0][1];
  const refreshToken = pairs[1][1];
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
};

export const clearTokens = async (): Promise<void> => {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach JWT to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const tokens = await loadTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Auto refresh token on 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await loadTokens();
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<{ data: AuthTokens }>(`${API_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        await saveTokens(data.data);
        processQueue(null, data.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
