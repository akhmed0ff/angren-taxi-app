import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState } from '@/types';
import { authService } from '@/services/auth.service';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка входа');
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const initAuthThunk = createAsyncThunk('auth/init', async () => {
  const token = authService.getStoredToken();
  const user = authService.getStoredUser();
  if (!token || !user) return null;
  return { token, user };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(initAuthThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
