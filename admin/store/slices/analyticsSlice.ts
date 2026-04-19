import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AnalyticsState } from '@/types';
import { analyticsService } from '@/services/analytics.service';

const initialState: AnalyticsState = {
  metrics: null,
  revenueData: [],
  ordersStats: [],
  categoryStats: [],
  isLoading: false,
  error: null,
  period: 'month',
};

export const fetchAnalyticsMetrics = createAsyncThunk(
  'analytics/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getMetrics();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка');
    }
  },
);

export const fetchRevenueData = createAsyncThunk(
  'analytics/fetchRevenue',
  async (period: 'week' | 'month' | 'year', { rejectWithValue }) => {
    try {
      return await analyticsService.getRevenueData(period);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка');
    }
  },
);

export const fetchOrdersStats = createAsyncThunk(
  'analytics/fetchOrdersStats',
  async (period: 'week' | 'month' | 'year', { rejectWithValue }) => {
    try {
      return await analyticsService.getOrdersStats(period);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка');
    }
  },
);

export const fetchCategoryStats = createAsyncThunk(
  'analytics/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getCategoryStats();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка');
    }
  },
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setPeriod(state, action: PayloadAction<AnalyticsState['period']>) {
      state.period = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsMetrics.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAnalyticsMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchAnalyticsMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.revenueData = action.payload;
      })
      .addCase(fetchOrdersStats.fulfilled, (state, action) => {
        state.ordersStats = action.payload;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.categoryStats = action.payload;
      });
  },
});

export const { setPeriod } = analyticsSlice.actions;
export default analyticsSlice.reducer;
