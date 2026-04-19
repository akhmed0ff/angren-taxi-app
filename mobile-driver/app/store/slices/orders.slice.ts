import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../types';

interface OrdersState {
  availableOrders: Order[];
  activeOrder: Order | null;
  orderHistory: Order[];
  isLoadingAvailable: boolean;
  isLoadingHistory: boolean;
  isProcessing: boolean;
  historyTotal: number;
  historyPage: number;
  error: string | null;
}

const initialState: OrdersState = {
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

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setAvailableOrders(state, action: PayloadAction<Order[]>) {
      state.availableOrders = action.payload;
    },
    addAvailableOrder(state, action: PayloadAction<Order>) {
      const exists = state.availableOrders.some((o) => o.id === action.payload.id);
      if (!exists) {
        state.availableOrders.unshift(action.payload);
      }
    },
    removeAvailableOrder(state, action: PayloadAction<string>) {
      state.availableOrders = state.availableOrders.filter((o) => o.id !== action.payload);
    },
    setActiveOrder(state, action: PayloadAction<Order | null>) {
      state.activeOrder = action.payload;
    },
    updateActiveOrder(state, action: PayloadAction<Partial<Order>>) {
      if (state.activeOrder) {
        state.activeOrder = { ...state.activeOrder, ...action.payload };
      }
    },
    setOrderHistory(state, action: PayloadAction<{ orders: Order[]; total: number }>) {
      state.orderHistory = action.payload.orders;
      state.historyTotal = action.payload.total;
    },
    appendOrderHistory(state, action: PayloadAction<{ orders: Order[]; total: number }>) {
      state.orderHistory = [...state.orderHistory, ...action.payload.orders];
      state.historyTotal = action.payload.total;
    },
    setHistoryPage(state, action: PayloadAction<number>) {
      state.historyPage = action.payload;
    },
    setLoadingAvailable(state, action: PayloadAction<boolean>) {
      state.isLoadingAvailable = action.payload;
    },
    setLoadingHistory(state, action: PayloadAction<boolean>) {
      state.isLoadingHistory = action.payload;
    },
    setProcessing(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetOrders(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setAvailableOrders,
  addAvailableOrder,
  removeAvailableOrder,
  setActiveOrder,
  updateActiveOrder,
  setOrderHistory,
  appendOrderHistory,
  setHistoryPage,
  setLoadingAvailable,
  setLoadingHistory,
  setProcessing,
  setError,
  resetOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
