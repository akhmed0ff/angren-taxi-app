import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { UIState, Language, Theme } from '../../types';

const initialState: UIState = {
  isLoading: false,
  error: null,
  language: 'ru',
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
  },
});

export const { setLoading, setError, clearError, setLanguage, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
