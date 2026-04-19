import api from './api';
import type { Order, PaginatedResponse } from '@/types';

const ANGREN_LOCATIONS = [
  { address: 'Ангрен, ул. Навои, 1', lat: 41.0167, lng: 70.1444 },
  { address: 'Ангрен, Автовокзал', lat: 41.0190, lng: 70.1460 },
  { address: 'Ангрен, ЦРБ', lat: 41.0145, lng: 70.1420 },
  { address: 'Ангрен, Рынок Дустлик', lat: 41.0200, lng: 70.1480 },
  { address: 'Ангрен, Химзавод', lat: 41.0100, lng: 70.1380 },
  { address: 'Алмалык, ул. Ленина, 5', lat: 40.8487, lng: 69.5997 },
  { address: 'Ташкент, Аэропорт', lat: 41.2579, lng: 69.2808 },
];

const USER_NAMES = ['Алишер К.', 'Камола Р.', 'Бобур И.', 'Нилуфар Ю.', 'Жасур Х.'];
const DRIVER_NAMES = ['Бахтиёр У.', 'Шерзод Х.', 'Фаррух Н.', 'Жамшид Р.', 'Улугбек М.'];
const STATUSES = ['completed', 'completed', 'completed', 'cancelled', 'in_progress', 'pending'] as const;
const CATEGORIES = ['economy', 'economy', 'comfort', 'business', 'minivan'] as const;
const PAYMENTS = ['cash', 'cash', 'card', 'wallet'] as const;

// Mock data generator — Math.random() is intentional here (non-security use: demo data only)
function generateOrders(): Order[] {
  return Array.from({ length: 200 }, (_, i) => {
    const from = ANGREN_LOCATIONS[Math.floor(Math.random() * ANGREN_LOCATIONS.length)];
    let to = ANGREN_LOCATIONS[Math.floor(Math.random() * ANGREN_LOCATIONS.length)];
    while (to === from) to = ANGREN_LOCATIONS[Math.floor(Math.random() * ANGREN_LOCATIONS.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const distance = parseFloat((1 + Math.random() * 20).toFixed(1));
    const duration = Math.round(distance * 3 + Math.random() * 10);
    const price = Math.round(distance * 1500 + 5000);
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString();
    const hasDriver = status !== 'pending';
    return {
      id: String(i + 1),
      userId: String(Math.floor(Math.random() * 120) + 1),
      userName: USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)],
      userPhone: `+99890${1000000 + i}`,
      driverId: hasDriver ? String(Math.floor(Math.random() * 80) + 1) : undefined,
      driverName: hasDriver ? DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)] : undefined,
      driverPhone: hasDriver ? `+99891${1000000 + i}` : undefined,
      status,
      from,
      to,
      distance,
      duration,
      price,
      paymentMethod: PAYMENTS[Math.floor(Math.random() * PAYMENTS.length)],
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      createdAt,
      acceptedAt: hasDriver ? new Date(new Date(createdAt).getTime() + 2 * 60 * 1000).toISOString() : undefined,
      completedAt: status === 'completed' ? new Date(new Date(createdAt).getTime() + (duration + 5) * 60 * 1000).toISOString() : undefined,
      cancelReason: status === 'cancelled' ? 'Пассажир отменил заказ' : undefined,
      rating: status === 'completed' && Math.random() > 0.3 ? Math.floor(3 + Math.random() * 3) : undefined,
    };
  });
}

const MOCK_ORDERS = generateOrders();

export interface OrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersService = {
  async getOrders(query: OrdersQuery = {}): Promise<PaginatedResponse<Order>> {
    try {
      const { data } = await api.get<PaginatedResponse<Order>>('/admin/orders', { params: query });
      return data;
    } catch {
      const { page = 1, limit = 20, search, status, category } = query;
      let filtered = [...MOCK_ORDERS];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) => o.id.includes(q) || o.userName.toLowerCase().includes(q) || o.from.address.toLowerCase().includes(q),
        );
      }
      if (status) filtered = filtered.filter((o) => o.status === status);
      if (category) filtered = filtered.filter((o) => o.category === category);
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const start = (page - 1) * limit;
      return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit };
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      const { data } = await api.get<{ data: Order }>(`/admin/orders/${id}`);
      return data.data;
    } catch {
      const order = MOCK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error('Заказ не найден');
      return order;
    }
  },

  async cancelOrder(id: string, reason: string): Promise<void> {
    try {
      await api.patch(`/admin/orders/${id}/cancel`, { reason });
    } catch {
      const order = MOCK_ORDERS.find((o) => o.id === id);
      if (order) { order.status = 'cancelled'; order.cancelReason = reason; }
    }
  },
};
