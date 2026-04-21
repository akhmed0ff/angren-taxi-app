import { create } from 'zustand';
import * as bonusesService from '../services/bonuses.service';
import type { BonusTransaction } from '../types';

interface BonusesStore {
  balance: number;
  history: BonusTransaction[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  fetchHistory: (params?: { page?: number; limit?: number }) => Promise<void>;
  clearError: () => void;
}

export const useBonusesStore = create<BonusesStore>((set) => ({
  balance: 0,
  history: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const balance = await bonusesService.getBonusBalance();
      set({ balance, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchHistory: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bonusesService.getBonusHistory(params);
      set({ history: result.transactions, total: result.total, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
