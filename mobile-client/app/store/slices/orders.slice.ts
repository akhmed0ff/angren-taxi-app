import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import * as ordersService from '../../services/orders.service';
import type { OrdersState, Order, CreateOrderData } from '../../types';

const initialState: OrdersState = {
  currentOrder: null,
  orderHistory: [],
  total: 0,
  page: 1,
  isLoading: false,
  error: null,
};

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const createOrderThunk = createAsyncThunk(
  'orders/create',
  async (data: CreateOrderData, { rejectWithValue }) => {
    try {
      return await ordersService.createOrder(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const cancelOrderThunk = createAsyncThunk(
  'orders/cancel',
  async (orderId: string, { rejectWithValue }) => {
    try {
      await ordersService.cancelOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchOrderHistoryThunk = createAsyncThunk(
  'orders/fetchHistory',
  async (
    params: { page?: number; limit?: number; status?: string } | undefined,
    { rejectWithValue },
  ) => {
    try {
      return await ordersService.getOrderHistory(params);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchCurrentOrderThunk = createAsyncThunk(
  'orders/fetchCurrent',
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await ordersService.getOrder(orderId);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder(state, action: PayloadAction<Order | null>) {
      state.currentOrder = action.payload;
    },
    updateCurrentOrderStatus(state, action: PayloadAction<Order['status']>) {
      if (state.currentOrder) {
        state.currentOrder.status = action.payload;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // createOrder
    builder.addCase(createOrderThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createOrderThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(createOrderThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // cancelOrder
    builder.addCase(cancelOrderThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelOrderThunk.fulfilled, (state) => {
      state.isLoading = false;
      if (state.currentOrder) {
        state.currentOrder.status = 'cancelled';
      }
    });
    builder.addCase(cancelOrderThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchOrderHistory
    builder.addCase(fetchOrderHistoryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderHistoryThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orderHistory = action.payload.orders;
      state.total = action.payload.total;
    });
    builder.addCase(fetchOrderHistoryThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchCurrentOrder
    builder.addCase(fetchCurrentOrderThunk.fulfilled, (state, action) => {
      state.currentOrder = action.payload;
    });
  },
});

export const { setCurrentOrder, updateCurrentOrderStatus, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
