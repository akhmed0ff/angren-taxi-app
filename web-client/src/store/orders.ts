import { create } from 'zustand';
import type { Order, OrderStatus } from '../types';

interface OrderState {
  activeOrder: Order | null;
  setActiveOrder: (order: Order) => void;
  updateStatus: (status: OrderStatus) => void;
  clearActiveOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  activeOrder: null,
  setActiveOrder: (order) => {
    localStorage.setItem('angren_active_order_id', order.id);
    set({ activeOrder: order });
  },
  updateStatus: (status) =>
    set((state) => ({
      activeOrder: state.activeOrder ? { ...state.activeOrder, status } : null,
    })),
  clearActiveOrder: () => {
    localStorage.removeItem('angren_active_order_id');
    set({ activeOrder: null });
  },
}));
