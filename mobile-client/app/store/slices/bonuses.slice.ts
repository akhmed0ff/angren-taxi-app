import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as bonusesService from '../../services/bonuses.service';
import type { BonusesState } from '../../types';

const initialState: BonusesState = {
  balance: 0,
  history: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchBonusBalanceThunk = createAsyncThunk(
  'bonuses/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      return await bonusesService.getBonusBalance();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchBonusHistoryThunk = createAsyncThunk(
  'bonuses/fetchHistory',
  async (
    params: { page?: number; limit?: number } | undefined,
    { rejectWithValue },
  ) => {
    try {
      return await bonusesService.getBonusHistory(params);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const bonusesSlice = createSlice({
  name: 'bonuses',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchBalance
    builder.addCase(fetchBonusBalanceThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBonusBalanceThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.balance = action.payload;
    });
    builder.addCase(fetchBonusBalanceThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchHistory
    builder.addCase(fetchBonusHistoryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBonusHistoryThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.history = action.payload.transactions;
      state.total = action.payload.total;
    });
    builder.addCase(fetchBonusHistoryThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = bonusesSlice.actions;
export default bonusesSlice.reducer;
