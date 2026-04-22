import api from './api';
import { Order, OrderStatus, ApiResponse, PaginatedResponse } from '../types';

interface OrderHistoryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersService = {
  async getAvailableOrders(): Promise<Order[]> {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders/available');
    return data.data;
  },

  async acceptOrder(orderId: string, vehicleId?: string): Promise<Order> {
    // Backend expects { orderId, vehicleId } in body at POST /orders/accept
    const { data } = await api.post<ApiResponse<Order>>('/orders/accept', { orderId, vehicleId });
    return data.data;
  },

  async rejectOrder(orderId: string, reason?: string): Promise<void> {
    await api.post(`/orders/${orderId}/reject`, { reason });
  },

  async startOrder(orderId: string): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/start`);
    return data.data;
  },

  async arriveAtPickup(orderId: string): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/arrived`);
    return data.data;
  },

  async completeOrder(orderId: string): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/complete`);
    return data.data;
  },

  async cancelOrder(orderId: string, reason: string): Promise<void> {
    await api.post(`/orders/${orderId}/cancel`, { reason });
  },

  async getActiveOrder(): Promise<Order | null> {
    const { data } = await api.get<ApiResponse<Order | null>>('/orders/active');
    return data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return data.data;
  },

  async getOrderHistory(params: OrderHistoryParams = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders/history', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        status: params.status,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      },
    });
    return data.data;
  },
};
