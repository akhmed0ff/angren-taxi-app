import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UIState } from '@/types';

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload as boolean;
    },
    showNotification(state, action) {
      state.notification = action.payload as UIState['notification'];
    },
    hideNotification(state) {
      state.notification = null;
    },
  },
  extraReducers: () => {},
});

export const { toggleSidebar, setSidebarCollapsed, showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;
