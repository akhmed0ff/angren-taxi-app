import { apiClient } from './api';
import type { Order, Location, CarClass, PriceEstimate, CreateOrderData } from '../types';

interface OrderHistoryParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface OrderHistoryResponse {
  orders: Order[];
  total: number;
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const { data: order } = await apiClient.post<Order>('/orders', data);
  return order;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function cancelOrder(id: string): Promise<void> {
  await apiClient.post(`/orders/${id}/cancel`);
}

export async function getOrderHistory(params?: OrderHistoryParams): Promise<OrderHistoryResponse> {
  const { data } = await apiClient.get<OrderHistoryResponse>('/orders', { params });
  return data;
}

export async function rateDriver(
  orderId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  await apiClient.post(`/orders/${orderId}/rate`, { rating, comment });
}

export async function calculatePrice(
  from: Location,
  to: Location,
  carClass: CarClass,
): Promise<PriceEstimate> {
  const { data } = await apiClient.post<PriceEstimate>('/orders/calculate', {
    from,
    to,
    carClass,
  });
  return data;
}
