import { create } from 'zustand';
import type { User } from '../types';
import { USER_KEY, ACCESS_KEY, REFRESH_KEY } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hydrate: () => void;
  setAuth: (payload: { user: User; token: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  hydrate: () => {
    const token = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    set({ token, refreshToken, user, isAuthenticated: Boolean(token) });
  },
  setAuth: ({ user, token, refreshToken }) =>
    set({ user, token, refreshToken, isAuthenticated: true }),
  logout: () =>
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
}));
