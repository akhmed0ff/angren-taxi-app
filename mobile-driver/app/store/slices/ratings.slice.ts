import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RatingsSummary, Review } from '../../types';

interface RatingsState {
  summary: RatingsSummary | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RatingsState = {
  summary: null,
  isLoading: false,
  error: null,
};

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    setSummary(state, action: PayloadAction<RatingsSummary>) {
      state.summary = action.payload;
    },
    appendReviews(state, action: PayloadAction<Review[]>) {
      if (state.summary) {
        state.summary.reviews = [...state.summary.reviews, ...action.payload];
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetRatings(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setSummary, appendReviews, setLoading, setError, resetRatings } =
  ratingsSlice.actions;

export default ratingsSlice.reducer;
