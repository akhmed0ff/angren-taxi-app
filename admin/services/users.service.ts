import api from './api';
import type { User, PaginatedResponse } from '@/types';

// ─── Mock data ────────────────────────────────────────────────────────────────

const CITIES = ['Ангрен', 'Ташкент', 'Алмалык', 'Янгибозор'];
const NAMES = [
  'Алишер Каримов', 'Камола Рашидова', 'Бобур Исмоилов', 'Нилуфар Юсупова',
  'Жасур Хасанов', 'Феруза Мамадалиева', 'Санжар Норматов', 'Дилноза Тошматова',
  'Отабек Рустамов', 'Зулайхо Абдуллаева', 'Умид Махмудов', 'Гулнора Кодирова',
];

function randomPhone(): string {
  // Math.random() is intentional here (non-security use: demo data only)
  const codes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const code = codes[Math.floor(Math.random() * codes.length)];
  const num = Math.floor(Math.random() * 9_000_000) + 1_000_000;
  return `+998${code}${num}`;
}

// Mock data generator — Math.random() is intentional here (non-security use: demo data only)

function generateUsers(): User[] {
  return Array.from({ length: 120 }, (_, i) => ({
    id: String(i + 1),
    name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ''),
    phone: randomPhone(),
    email: Math.random() > 0.4 ? `user${i + 1}@example.com` : undefined,
    status: (['active', 'active', 'active', 'blocked', 'pending'] as const)[
      Math.floor(Math.random() * 5)
    ],
    totalOrders: Math.floor(Math.random() * 150),
    totalSpent: Math.floor(Math.random() * 5_000_000),
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    registeredAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString(),
    city: CITIES[Math.floor(Math.random() * CITIES.length)],
  }));
}

const MOCK_USERS = generateUsers();

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
}

export const usersService = {
  async getUsers(query: UsersQuery = {}): Promise<PaginatedResponse<User>> {
    try {
      const { data } = await api.get<PaginatedResponse<User>>('/admin/users', { params: query });
      return data;
    } catch {
      const { page = 1, limit = 20, search, status, city } = query;
      let filtered = [...MOCK_USERS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q),
        );
      }
      if (status) filtered = filtered.filter((u) => u.status === status);
      if (city) filtered = filtered.filter((u) => u.city === city);
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
      };
    }
  },

  async getUserById(id: string): Promise<User> {
    try {
      const { data } = await api.get<{ data: User }>(`/admin/users/${id}`);
      return data.data;
    } catch {
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) throw new Error('Пользователь не найден');
      return user;
    }
  },

  async blockUser(id: string, reason: string): Promise<void> {
    try {
      await api.patch(`/admin/users/${id}/block`, { reason });
    } catch {
      const user = MOCK_USERS.find((u) => u.id === id);
      if (user) user.status = 'blocked';
    }
  },

  async unblockUser(id: string): Promise<void> {
    try {
      await api.patch(`/admin/users/${id}/unblock`);
    } catch {
      const user = MOCK_USERS.find((u) => u.id === id);
      if (user) user.status = 'active';
    }
  },
};
