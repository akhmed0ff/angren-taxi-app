import * as SecureStore from 'expo-secure-store';

import { apiClient } from './api';
import { SECURE_STORE_KEYS } from '../utils/constants';
import type { User, RegisterData } from '../types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  await SecureStore.setItemAsync(SECURE_STORE_KEYS.token, data.token);
  await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, data.refreshToken);
  return data;
}

export async function register(registerData: RegisterData): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/auth/register', registerData);
  await SecureStore.setItemAsync(SECURE_STORE_KEYS.token, data.token);
  if (data.refreshToken) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, data.refreshToken);
  }
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.token);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken);
  }
}

export async function refreshToken(token: string): Promise<{ token: string }> {
  const { data } = await apiClient.post<{ token: string }>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/profile');
  return data;
}

export async function updateProfile(profileData: Partial<User>): Promise<User> {
  const { data } = await apiClient.patch<User>('/auth/profile', profileData);
  return data;
}
