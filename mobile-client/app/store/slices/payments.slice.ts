import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import * as paymentsService from '../../services/payments.service';
import type { PaymentsState, PaymentMethod } from '../../types';

const initialState: PaymentsState = {
  paymentMethod: 'cash',
  history: [],
  isLoading: false,
  error: null,
};

export const processPaymentThunk = createAsyncThunk(
  'payments/process',
  async (
    payload: { orderId: string; method: PaymentMethod; amount: number },
    { rejectWithValue },
  ) => {
    try {
      return await paymentsService.processPayment(
        payload.orderId,
        payload.method,
        payload.amount,
      );
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchPaymentHistoryThunk = createAsyncThunk(
  'payments/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await paymentsService.getPaymentHistory();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.paymentMethod = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // processPayment
    builder.addCase(processPaymentThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(processPaymentThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.history = [action.payload, ...state.history];
    });
    builder.addCase(processPaymentThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchHistory
    builder.addCase(fetchPaymentHistoryThunk.fulfilled, (state, action) => {
      state.history = action.payload;
    });
  },
});

export const { setPaymentMethod, clearError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
