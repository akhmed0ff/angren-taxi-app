import { api } from './client';
import type { ApiResponse, Order, OrderCategory, PaymentMethod } from '../types';

export interface CreateOrderInput {
  category: OrderCategory;
  from_address: string;
  from_latitude: number;
  from_longitude: number;
  to_address: string;
  to_latitude: number;
  to_longitude: number;
  payment_method: PaymentMethod;
  note?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await api.post<ApiResponse<Order>>('/api/orders/create', input);
  return data.data;
}

export async function getOrderById(id: string): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/api/orders/${id}`);
  return data.data;
}

export async function getHistory(page = 1, limit = 20): Promise<Order[]> {
  const { data } = await api.get<ApiResponse<Order[]>>('/api/orders/history', { params: { page, limit } });
  return data.data ?? [];
}
