import { create } from 'zustand';
import * as ordersService from '../services/orders.service';
import type { Order, CreateOrderData } from '../types';

interface OrdersStore {
  currentOrder: Order | null;
  orderHistory: Order[];
  total: number;
  isLoading: boolean;
  error: string | null;

  createOrder: (data: CreateOrderData) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  fetchHistory: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchCurrentOrder: (orderId: string) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  updateOrderStatus: (status: Order['status']) => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  currentOrder: null,
  orderHistory: [],
  total: 0,
  isLoading: false,
  error: null,

  createOrder: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersService.createOrder(data);
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  cancelOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      await ordersService.cancelOrder(orderId);
      const cur = get().currentOrder;
      if (cur) set({ currentOrder: { ...cur, status: 'cancelled' } });
      set({ isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  fetchHistory: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await ordersService.getOrderHistory(params);
      set({ orderHistory: result.orders, total: result.total, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchCurrentOrder: async (orderId) => {
    try {
      const order = await ordersService.getOrder(orderId);
      set({ currentOrder: order });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setCurrentOrder: (order) => set({ currentOrder: order }),

  updateOrderStatus: (status) => {
    const cur = get().currentOrder;
    if (cur) set({ currentOrder: { ...cur, status } });
  },

  clearError: () => set({ error: null }),
}));
