import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const ACCESS_KEY = 'angren_access_token';
export const REFRESH_KEY = 'angren_refresh_token';
export const USER_KEY = 'angren_user';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string }>) => {
    const original = (error.config ?? {}) as RetriableConfig;

    if (
      error.response?.status === 401
      && !original._retry
      && !String(original.url ?? '').includes('/api/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        original._retry = true;
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const payload = data.data;

          localStorage.setItem(ACCESS_KEY, payload.token);
          localStorage.setItem(REFRESH_KEY, payload.refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(payload.user));

          const headers = AxiosHeaders.from(original.headers);
          headers.set('Authorization', `Bearer ${payload.token}`);
          original.headers = headers;
          return api(original);
        } catch {
          localStorage.removeItem(ACCESS_KEY);
          localStorage.removeItem(REFRESH_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
    }

    return Promise.reject(error);
  }
);
