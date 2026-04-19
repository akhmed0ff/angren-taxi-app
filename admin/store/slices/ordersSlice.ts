import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OrdersState } from '@/types';
import { ordersService, type OrdersQuery } from '@/services/orders.service';

const initialState: OrdersState = {
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
  selectedOrder: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (query: OrdersQuery, { rejectWithValue }) => {
    try {
      return await ordersService.getOrders(query);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await ordersService.getOrderById(id);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
