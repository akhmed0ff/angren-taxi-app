import { create } from 'zustand';
import * as authService from '../services/auth.service';
import { getSecureItem, setSecureItem, deleteSecureItem } from '../utils/secureStorage';
import type { User, RegisterData } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(phone, password);
      await setSecureItem('auth_token', result.token);
      if (result.refreshToken) {
        await setSecureItem('auth_refresh_token', result.refreshToken);
      }
      set({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(data);
      await setSecureItem('auth_token', result.token);
      if (result.refreshToken) {
        await setSecureItem('auth_refresh_token', result.refreshToken);
      }
      set({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authService.logout();
    await deleteSecureItem('auth_token');
    await deleteSecureItem('auth_refresh_token');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await getSecureItem('auth_token');
      if (!token) {
        set({ isLoading: false });
        return false;
      }
      const user = await authService.getProfile();
      const refreshToken = await getSecureItem('auth_refresh_token');
      set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      await deleteSecureItem('auth_token');
      await deleteSecureItem('auth_refresh_token');
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  setUser: (user) => set({ user }),

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
