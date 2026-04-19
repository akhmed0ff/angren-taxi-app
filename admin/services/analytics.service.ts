import api from './api';
import type {
  DashboardMetrics,
  RevenueDataPoint,
  OrdersStatPoint,
  CategoryStat,
} from '@/types';
import { subDays, format } from 'date-fns';

function generateRevenue(days: number): RevenueDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const orders = Math.floor(80 + Math.random() * 120);
    const revenue = orders * (8000 + Math.floor(Math.random() * 4000));
    return {
      date: format(date, 'yyyy-MM-dd'),
      revenue,
      orders,
      commission: Math.round(revenue * 0.15),
    };
  });
}

function generateOrdersStats(days: number): OrdersStatPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const total = Math.floor(80 + Math.random() * 120);
    const cancelled = Math.floor(total * (0.05 + Math.random() * 0.1));
    return {
      date: format(date, 'yyyy-MM-dd'),
      total,
      completed: total - cancelled,
      cancelled,
    };
  });
}

const MOCK_METRICS: DashboardMetrics = {
  totalOrders: 18_432,
  ordersGrowth: 12.4,
  totalRevenue: 184_320_000,
  revenueGrowth: 18.7,
  activeDrivers: 48,
  driversGrowth: 5.2,
  activeUsers: 1_234,
  usersGrowth: 22.1,
  avgOrderValue: 10_000,
  completionRate: 92.5,
  avgRating: 4.7,
  cancelRate: 7.5,
};

const MOCK_CATEGORY_STATS: CategoryStat[] = [
  { category: 'Эконом', value: 11_059, percentage: 60 },
  { category: 'Комфорт', value: 4_608, percentage: 25 },
  { category: 'Бизнес', value: 1_843, percentage: 10 },
  { category: 'Минивэн', value: 922, percentage: 5 },
];

export const analyticsService = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const { data } = await api.get<{ data: DashboardMetrics }>('/admin/analytics/metrics');
      return data.data;
    } catch {
      return { ...MOCK_METRICS };
    }
  },

  async getRevenueData(period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueDataPoint[]> {
    try {
      const { data } = await api.get<{ data: RevenueDataPoint[] }>('/admin/analytics/revenue', {
        params: { period },
      });
      return data.data;
    } catch {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      return generateRevenue(days);
    }
  },

  async getOrdersStats(period: 'week' | 'month' | 'year' = 'month'): Promise<OrdersStatPoint[]> {
    try {
      const { data } = await api.get<{ data: OrdersStatPoint[] }>('/admin/analytics/orders-stats', {
        params: { period },
      });
      return data.data;
    } catch {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      return generateOrdersStats(days);
    }
  },

  async getCategoryStats(): Promise<CategoryStat[]> {
    try {
      const { data } = await api.get<{ data: CategoryStat[] }>('/admin/analytics/categories');
      return data.data;
    } catch {
      return [...MOCK_CATEGORY_STATS];
    }
  },
};
