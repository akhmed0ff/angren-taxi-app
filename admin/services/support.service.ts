import api from './api';
import type { SupportTicket, PaginatedResponse } from '@/types';

const SUBJECTS = [
  'Не работает приложение',
  'Водитель не приехал',
  'Ошибка оплаты',
  'Хочу вернуть деньги',
  'Водитель нагрубил',
  'Не могу войти в аккаунт',
  'Неверный маршрут',
  'Проблема с картой',
];
const MESSAGES = [
  'Приложение вылетает при открытии. Пробовал переустановить - не помогает.',
  'Заказал такси, водитель принял заказ, но не приехал. Деньги списались.',
  'При оплате картой пишет ошибку, хотя деньги на счету есть.',
  'Поездка была отменена, но деньги не вернулись в течение 3 дней.',
  'Водитель был груб и не хотел везти по нужному адресу.',
  'Забыл пароль, смс на телефон не приходит.',
];
const CATEGORIES = ['payment', 'driver', 'app', 'order', 'other'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const STATUSES = ['open', 'open', 'in_progress', 'resolved', 'closed'] as const;
const USER_NAMES = ['Алишер Каримов', 'Камола Рашидова', 'Бобур Исмоилов', 'Нилуфар Юсупова'];

function generateTickets(): SupportTicket[] {
  return Array.from({ length: 60 }, (_, i) => {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString();
    return {
      id: String(i + 1),
      userId: String(i + 1),
      userName: USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)],
      userPhone: `+99890${1000000 + i}`,
      userType: Math.random() > 0.3 ? 'passenger' : 'driver',
      subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)],
      message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
      status,
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      assignedTo: status !== 'open' ? 'Администратор' : undefined,
      createdAt,
      updatedAt: new Date(new Date(createdAt).getTime() + Math.random() * 48 * 3600 * 1000).toISOString(),
      resolvedAt: status === 'resolved' || status === 'closed'
        ? new Date(new Date(createdAt).getTime() + 48 * 3600 * 1000).toISOString()
        : undefined,
      replies: status !== 'open' ? [{
        id: `r${i}`,
        ticketId: String(i + 1),
        authorName: 'Служба поддержки',
        authorRole: 'admin',
        message: 'Спасибо за обращение. Мы рассматриваем вашу жалобу и свяжемся с вами в ближайшее время.',
        createdAt: new Date(new Date(createdAt).getTime() + 2 * 3600 * 1000).toISOString(),
      }] : [],
    };
  });
}

const MOCK_TICKETS = generateTickets();

export interface TicketsQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
}

export const supportService = {
  async getTickets(query: TicketsQuery = {}): Promise<PaginatedResponse<SupportTicket>> {
    try {
      const { data } = await api.get<PaginatedResponse<SupportTicket>>('/admin/support/tickets', {
        params: query,
      });
      return data;
    } catch {
      const { page = 1, limit = 20, status, priority, category } = query;
      let filtered = [...MOCK_TICKETS];
      if (status) filtered = filtered.filter((t) => t.status === status);
      if (priority) filtered = filtered.filter((t) => t.priority === priority);
      if (category) filtered = filtered.filter((t) => t.category === category);
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const start = (page - 1) * limit;
      return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit };
    }
  },

  async replyToTicket(ticketId: string, message: string): Promise<void> {
    try {
      await api.post(`/admin/support/tickets/${ticketId}/reply`, { message });
    } finally {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
      if (ticket && ticket.status === 'open') ticket.status = 'in_progress';
    }
  },

  async closeTicket(ticketId: string): Promise<void> {
    try {
      await api.patch(`/admin/support/tickets/${ticketId}/close`);
    } finally {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
      if (ticket) ticket.status = 'resolved';
    }
  },
};
