import { create } from 'zustand';
import { ratingsService } from '../services/ratings.service';
import type { RatingsSummary, Review } from '../types';

interface RatingsStore {
  summary: RatingsSummary | null;
  isLoading: boolean;
  error: string | null;
  setSummary: (summary: RatingsSummary) => void;
  appendReviews: (reviews: Review[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  loadRatings: () => Promise<void>;
  loadMoreReviews: (page: number) => Promise<void>;
  resetRatings: () => void;
}

const initialState = {
  summary: null,
  isLoading: false,
  error: null,
};

export const useRatingsStore = create<RatingsStore>((set) => ({
  ...initialState,
  setSummary: (summary) => set({ summary }),
  appendReviews: (reviews) =>
    set((state) => {
      if (!state.summary) return state;
      return {
        summary: {
          ...state.summary,
          reviews: [...state.summary.reviews, ...reviews],
        },
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  loadRatings: async () => {
    set({ isLoading: true, error: null });
    try {
      const summary = await ratingsService.getRatings();
      set({ summary });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load ratings' });
    } finally {
      set({ isLoading: false });
    }
  },
  loadMoreReviews: async (page) => {
    try {
      const reviews = await ratingsService.getReviews(page);
      set((state) => {
        if (!state.summary) return state;
        return {
          summary: {
            ...state.summary,
            reviews: [...state.summary.reviews, ...reviews],
          },
        };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load reviews' });
    }
  },
  resetRatings: () => set(initialState),
}));
