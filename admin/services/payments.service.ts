import api from './api';
import type { Transaction, PaginatedResponse } from '@/types';

const TYPES = ['commission', 'payout', 'refund', 'top_up', 'penalty'] as const;
const STATUSES = ['completed', 'completed', 'completed', 'pending', 'failed'] as const;
const DESCRIPTIONS = [
  'Комиссия за поездку #',
  'Выплата водителю',
  'Возврат пассажиру',
  'Пополнение баланса',
  'Штраф за нарушение',
];

function generateTransactions(): Transaction[] {
  return Array.from({ length: 150 }, (_, i) => {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const typeIdx = TYPES.indexOf(type);
    return {
      id: String(i + 1),
      type,
      amount: Math.floor(5000 + Math.random() * 50000),
      currency: 'UZS',
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      description: DESCRIPTIONS[typeIdx] + (type === 'commission' ? String(1000 + i) : ''),
      relatedId: String(Math.floor(Math.random() * 200) + 1),
      relatedName: type === 'payout' ? 'Бахтиёр У.' : 'Алишер К.',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString(),
    };
  });
}

const MOCK_TRANSACTIONS = generateTransactions();

export interface TransactionsQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export const paymentsService = {
  async getTransactions(query: TransactionsQuery = {}): Promise<PaginatedResponse<Transaction>> {
    try {
      const { data } = await api.get<PaginatedResponse<Transaction>>('/admin/finances/transactions', {
        params: query,
      });
      return data;
    } catch {
      const { page = 1, limit = 20, type, status } = query;
      let filtered = [...MOCK_TRANSACTIONS];
      if (type) filtered = filtered.filter((t) => t.type === type);
      if (status) filtered = filtered.filter((t) => t.status === status);
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const start = (page - 1) * limit;
      return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit };
    }
  },

  async getFinanceSummary(): Promise<{
    totalRevenue: number;
    totalCommission: number;
    totalPayouts: number;
    pendingPayouts: number;
  }> {
    try {
      const { data } = await api.get('/admin/finances/summary');
      return data.data;
    } catch {
      return {
        totalRevenue: 184_320_000,
        totalCommission: 27_648_000,
        totalPayouts: 156_672_000,
        pendingPayouts: 4_250_000,
      };
    }
  },
};
