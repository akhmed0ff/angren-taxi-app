import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { loadTokens } from '../services/api';
import { socketService } from '../services/socket.service';
import { useDriverStore } from './useDriverStore';
import { useOrdersStore } from './useOrdersStore';
import type { LoginCredentials, RegisterData, User } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCredentials: (payload: { user: User; accessToken: string; refreshToken: string }) => void;
  login: (credentials: LoginCredentials) => Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }>;
  register: (data: RegisterData) => Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCredentials: ({ user, accessToken, refreshToken }) =>
    set({ user, accessToken, refreshToken, isAuthenticated: true, error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(credentials);
      set({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        isAuthenticated: true,
      });
      socketService.connect(result.tokens.accessToken);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(data);
      set({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        isAuthenticated: true,
      });
      socketService.connect(result.tokens.accessToken);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    socketService.disconnect();
    await authService.logout();
    useDriverStore.getState().resetDriver();
    useOrdersStore.getState().resetOrders();
    set(initialState);
  },

  restoreSession: async () => {
    const tokens = await loadTokens();
    if (!tokens) return false;

    try {
      const user = await authService.getMe();
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      });
      socketService.connect(tokens.accessToken);
      return true;
    } catch {
      await AsyncStorage.clear();
      set(initialState);
      return false;
    }
  },
}));
