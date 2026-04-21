import { apiClient } from './api';
import { SECURE_STORE_KEYS } from '../utils/constants';
import { deleteSecureItem, setSecureItem } from '../utils/secureStorage';
import type { User, RegisterData } from '../types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { phone, password });
  await setSecureItem(SECURE_STORE_KEYS.token, data.data.token);
  if (data.data.refreshToken) {
    await setSecureItem(SECURE_STORE_KEYS.refreshToken, data.data.refreshToken);
  }
  return data.data;
}

export async function register(registerData: RegisterData): Promise<RegisterResponse> {
  const payload = {
    phone: registerData.phone,
    name: registerData.name,
    password: registerData.password,
    type: 'passenger' as const,
    language: 'ru' as const,
  };
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload);
  await setSecureItem(SECURE_STORE_KEYS.token, data.data.token);
  if (data.data.refreshToken) {
    await setSecureItem(SECURE_STORE_KEYS.refreshToken, data.data.refreshToken);
  }
  return data.data;
}

export async function logout(): Promise<void> {
  await deleteSecureItem(SECURE_STORE_KEYS.token);
  await deleteSecureItem(SECURE_STORE_KEYS.refreshToken);
}

export async function refreshToken(token: string): Promise<{ token: string }> {
  const { data } = await apiClient.post<{ token: string }>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}

export async function forgotPassword(_email: string): Promise<void> {
  return Promise.resolve();
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function updateProfile(_profileData: Partial<User>): Promise<User> {
  return getProfile();
}
