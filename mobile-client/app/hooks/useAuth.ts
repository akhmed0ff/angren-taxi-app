import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  clearError,
} from '../store/slices/auth.slice';
import { socketService } from '../services/socket.service';
import { SECURE_STORE_KEYS } from '../utils/constants';
import type { RegisterData } from '../types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, token } = useAppSelector(
    (state) => state.auth,
  );

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(result)) {
        socketService.connect(result.payload.token);
      }
    },
    [dispatch],
  );

  const register = useCallback(
    async (data: RegisterData): Promise<void> => {
      const result = await dispatch(registerThunk(data));
      if (registerThunk.fulfilled.match(result)) {
        socketService.connect(result.payload.token);
      }
    },
    [dispatch],
  );

  const logout = useCallback(async (): Promise<void> => {
    socketService.disconnect();
    await dispatch(logoutThunk());
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.token);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken);
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return { user, isAuthenticated, isLoading, error, token, login, register, logout, dismissError };
}
