import api from './api';
import type { AdminUser, LoginCredentials } from '@/types';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';

const MOCK_USER: AdminUser = {
  id: '1',
  name: 'Администратор',
  email: 'admin@angren-taxi.uz',
  role: 'super_admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: AdminUser }> {
    try {
      const { data } = await api.post<{ token: string; user: AdminUser }>(
        '/auth/admin/login',
        credentials,
      );
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data;
    } catch {
      // Demo fallback
      if (
        credentials.email === 'admin@angren-taxi.uz' &&
        credentials.password === 'Admin123!'
      ) {
        const token = 'mock-admin-token-' + Date.now();
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(MOCK_USER));
        return { token, user: MOCK_USER };
      }
      throw new Error('Неверный логин или пароль');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/admin/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getStoredUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  async getMe(): Promise<AdminUser> {
    try {
      const { data } = await api.get<{ data: AdminUser }>('/auth/admin/me');
      return data.data;
    } catch {
      return MOCK_USER;
    }
  },
};
