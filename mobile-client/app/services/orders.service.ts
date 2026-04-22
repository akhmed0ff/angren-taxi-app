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
  const { data: resp } = await apiClient.post<{ success: boolean; data: Order }>('/orders/create', {
    category: data.carClass,
    from_address: data.from.address ?? `${data.from.latitude},${data.from.longitude}`,
    from_latitude: data.from.latitude,
    from_longitude: data.from.longitude,
    to_address: data.to.address ?? `${data.to.latitude},${data.to.longitude}`,
    to_latitude: data.to.latitude,
    to_longitude: data.to.longitude,
    payment_method: data.paymentMethod,
  });
  return resp.data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data: resp } = await apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
  return resp.data;
}

export async function cancelOrder(id: string): Promise<void> {
  await apiClient.post(`/orders/${id}/cancel`);
}

export async function getOrderHistory(params?: OrderHistoryParams): Promise<OrderHistoryResponse> {
  const { data: resp } = await apiClient.get<{ success: boolean; data: Order[]; pagination: { total: number } }>('/orders/history', { params });
  return { orders: resp.data, total: resp.pagination?.total ?? 0 };
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
