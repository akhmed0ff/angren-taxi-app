import { create } from 'zustand';
import { ordersService } from '../services/orders.service';
import type { Order, OrderStatus } from '../types';

interface OrdersStore {
  availableOrders: Order[];
  activeOrder: Order | null;
  orderHistory: Order[];
  isLoadingAvailable: boolean;
  isLoadingHistory: boolean;
  isProcessing: boolean;
  historyTotal: number;
  historyPage: number;
  error: string | null;
  setAvailableOrders: (orders: Order[]) => void;
  addAvailableOrder: (order: Order) => void;
  removeAvailableOrder: (orderId: string) => void;
  setActiveOrder: (order: Order | null) => void;
  updateActiveOrder: (order: Partial<Order>) => void;
  setOrderHistory: (orders: Order[], total: number) => void;
  appendOrderHistory: (orders: Order[], total: number) => void;
  setHistoryPage: (page: number) => void;
  setLoadingAvailable: (value: boolean) => void;
  setLoadingHistory: (value: boolean) => void;
  setProcessing: (value: boolean) => void;
  setError: (value: string | null) => void;
  loadAvailableOrders: () => Promise<void>;
  loadActiveOrder: () => Promise<void>;
  loadOrderHistory: (page?: number, status?: OrderStatus) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<Order>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  arriveAtPickup: () => Promise<void>;
  startOrder: () => Promise<void>;
  completeOrder: () => Promise<Order | undefined>;
  cancelOrder: (reason: string) => Promise<void>;
  resetOrders: () => void;
}

const initialState = {
  availableOrders: [],
  activeOrder: null,
  orderHistory: [],
  isLoadingAvailable: false,
  isLoadingHistory: false,
  isProcessing: false,
  historyTotal: 0,
  historyPage: 1,
  error: null,
};

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  ...initialState,

  setAvailableOrders: (availableOrders) => set({ availableOrders }),
  addAvailableOrder: (order) => {
    const exists = get().availableOrders.some((o) => o.id === order.id);
    if (!exists) {
      set((state) => ({ availableOrders: [order, ...state.availableOrders] }));
    }
  },
  removeAvailableOrder: (orderId) =>
    set((state) => ({
      availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
    })),
  setActiveOrder: (activeOrder) => set({ activeOrder }),
  updateActiveOrder: (order) => {
    const current = get().activeOrder;
    if (current) {
      set({ activeOrder: { ...current, ...order } });
    }
  },
  setOrderHistory: (orderHistory, historyTotal) => set({ orderHistory, historyTotal }),
  appendOrderHistory: (orders, total) =>
    set((state) => ({ orderHistory: [...state.orderHistory, ...orders], historyTotal: total })),
  setHistoryPage: (historyPage) => set({ historyPage }),
  setLoadingAvailable: (isLoadingAvailable) => set({ isLoadingAvailable }),
  setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),

  loadAvailableOrders: async () => {
    set({ isLoadingAvailable: true });
    try {
      const orders = await ordersService.getAvailableOrders();
      set({ availableOrders: orders });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load available orders' });
    } finally {
      set({ isLoadingAvailable: false });
    }
  },

  loadActiveOrder: async () => {
    try {
      const order = await ordersService.getActiveOrder();
      set({ activeOrder: order });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load active order' });
    }
  },

  loadOrderHistory: async (page = 1, status) => {
    set({ isLoadingHistory: true });
    try {
      const result = await ordersService.getOrderHistory({ page, status, limit: 20 });
      if (page === 1) {
        set({ orderHistory: result.data, historyTotal: result.total, historyPage: page });
      } else {
        set((state) => ({
          orderHistory: [...state.orderHistory, ...result.data],
          historyTotal: result.total,
          historyPage: page,
        }));
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load order history' });
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  acceptOrder: async (orderId) => {
    set({ isProcessing: true });
    try {
      const order = await ordersService.acceptOrder(orderId);
      set((state) => ({
        activeOrder: order,
        availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
      }));
      return order;
    } finally {
      set({ isProcessing: false });
    }
  },

  rejectOrder: async (orderId, reason) => {
    await ordersService.rejectOrder(orderId, reason);
    set((state) => ({ availableOrders: state.availableOrders.filter((o) => o.id !== orderId) }));
  },

  arriveAtPickup: async () => {
    const activeOrder = get().activeOrder;
    if (!activeOrder) return;
    set({ isProcessing: true });
    try {
      const updated = await ordersService.arriveAtPickup(activeOrder.id);
      set({ activeOrder: updated });
    } finally {
      set({ isProcessing: false });
    }
  },

  startOrder: async () => {
    const activeOrder = get().activeOrder;
    if (!activeOrder) return;
    set({ isProcessing: true });
    try {
      const updated = await ordersService.startOrder(activeOrder.id);
      set({ activeOrder: updated });
    } finally {
      set({ isProcessing: false });
    }
  },

  completeOrder: async () => {
    const activeOrder = get().activeOrder;
    if (!activeOrder) return undefined;
    set({ isProcessing: true });
    try {
      const updated = await ordersService.completeOrder(activeOrder.id);
      set({ activeOrder: null });
      return updated;
    } finally {
      set({ isProcessing: false });
    }
  },

  cancelOrder: async (reason) => {
    const activeOrder = get().activeOrder;
    if (!activeOrder) return;
    set({ isProcessing: true });
    try {
      await ordersService.cancelOrder(activeOrder.id, reason);
      set({ activeOrder: null });
    } finally {
      set({ isProcessing: false });
    }
  },

  resetOrders: () => set(initialState),
}));
