import { create } from 'zustand';
import { earningsService } from '../services/earnings.service';
import type { EarningsSummary, Payout } from '../types';

interface EarningsStore {
  summary: EarningsSummary | null;
  isLoading: boolean;
  isRequestingPayout: boolean;
  error: string | null;
  setSummary: (summary: EarningsSummary) => void;
  setLoading: (isLoading: boolean) => void;
  setRequestingPayout: (value: boolean) => void;
  setError: (error: string | null) => void;
  addPayout: (payout: Payout) => void;
  loadEarnings: (period: 'week' | 'month' | 'all') => Promise<void>;
  requestPayout: (amount: number) => Promise<Payout>;
  resetEarnings: () => void;
}

const initialState = {
  summary: null,
  isLoading: false,
  isRequestingPayout: false,
  error: null,
};

export const useEarningsStore = create<EarningsStore>((set) => ({
  ...initialState,
  setSummary: (summary) => set({ summary }),
  setLoading: (isLoading) => set({ isLoading }),
  setRequestingPayout: (isRequestingPayout) => set({ isRequestingPayout }),
  setError: (error) => set({ error }),
  addPayout: (payout) =>
    set((state) => {
      if (!state.summary) return state;
      return {
        summary: {
          ...state.summary,
          payouts: [payout, ...state.summary.payouts],
          pendingPayout: 0,
        },
      };
    }),
  loadEarnings: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await earningsService.getEarnings(period);
      set({ summary });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load earnings' });
    } finally {
      set({ isLoading: false });
    }
  },
  requestPayout: async (amount) => {
    set({ isRequestingPayout: true, error: null });
    try {
      const payout = await earningsService.requestPayout(amount);
      set((state) => {
        if (!state.summary) return state;
        return {
          summary: {
            ...state.summary,
            payouts: [payout, ...state.summary.payouts],
            pendingPayout: 0,
          },
        };
      });
      return payout;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to request payout' });
      throw err;
    } finally {
      set({ isRequestingPayout: false });
    }
  },
  resetEarnings: () => set(initialState),
}));
