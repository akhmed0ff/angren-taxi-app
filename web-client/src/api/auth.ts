import { api, ACCESS_KEY, REFRESH_KEY, USER_KEY } from './client';
import type { ApiResponse, User } from '../types';

interface AuthPayload {
  user: User;
  token: string;
  refreshToken: string;
}

export async function login(phone: string, password: string): Promise<AuthPayload> {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/api/auth/login', { phone, password });
  return data.data;
}

export async function register(name: string, phone: string, password: string): Promise<AuthPayload> {
  const { data } = await api.post<ApiResponse<AuthPayload>>('/api/auth/register', {
    name,
    phone,
    password,
    type: 'passenger',
  });
  return data.data;
}

export function persistAuth(payload: AuthPayload): void {
  localStorage.setItem(ACCESS_KEY, payload.token);
  localStorage.setItem(REFRESH_KEY, payload.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
