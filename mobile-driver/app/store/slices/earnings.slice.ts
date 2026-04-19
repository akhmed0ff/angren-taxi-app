import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EarningsSummary, DailyEarning, Payout } from '../../types';

interface EarningsState {
  summary: EarningsSummary | null;
  isLoading: boolean;
  isRequestingPayout: boolean;
  error: string | null;
}

const initialState: EarningsState = {
  summary: null,
  isLoading: false,
  isRequestingPayout: false,
  error: null,
};

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    setSummary(state, action: PayloadAction<EarningsSummary>) {
      state.summary = action.payload;
    },
    addPayout(state, action: PayloadAction<Payout>) {
      if (state.summary) {
        state.summary.payouts.unshift(action.payload);
        state.summary.pendingPayout = 0;
      }
    },
    updateDailyBreakdown(state, action: PayloadAction<DailyEarning[]>) {
      if (state.summary) {
        state.summary.dailyBreakdown = action.payload;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setRequestingPayout(state, action: PayloadAction<boolean>) {
      state.isRequestingPayout = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetEarnings(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSummary,
  addPayout,
  updateDailyBreakdown,
  setLoading,
  setRequestingPayout,
  setError,
  resetEarnings,
} = earningsSlice.actions;

export default earningsSlice.reducer;
