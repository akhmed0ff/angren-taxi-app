import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Language = 'ru' | 'uz';

interface UiState {
  isLoading: boolean;
  error: string | null;
  language: Language;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

const initialState: UiState = {
  isLoading: false,
  error: null,
  language: 'ru',
  notificationsEnabled: true,
  soundEnabled: true,
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
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },
  },
});

export const { setLoading, setError, setLanguage, setNotificationsEnabled, setSoundEnabled } =
  uiSlice.actions;

export default uiSlice.reducer;
