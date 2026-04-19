import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, logout as logoutAction, setLoading, setError } from '../store/slices/auth.slice';
import { resetDriver } from '../store/slices/driver.slice';
import { resetOrders } from '../store/slices/orders.slice';
import { resetEarnings } from '../store/slices/earnings.slice';
import { resetRatings } from '../store/slices/ratings.slice';
import { authService } from '../services/auth.service';
import { socketService } from '../services/socket.service';
import { loadTokens } from '../services/api';
import { LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, accessToken } = useAppSelector(
    (state) => state.auth,
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const result = await authService.login(credentials);
        dispatch(setCredentials({ user: result.user, tokens: result.tokens }));
        socketService.connect(result.tokens.accessToken);
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const result = await authService.register(data);
        dispatch(setCredentials({ user: result.user, tokens: result.tokens }));
        socketService.connect(result.tokens.accessToken);
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    socketService.disconnect();
    await authService.logout();
    dispatch(logoutAction());
    dispatch(resetDriver());
    dispatch(resetOrders());
    dispatch(resetEarnings());
    dispatch(resetRatings());
  }, [dispatch]);

  const restoreSession = useCallback(async () => {
    const tokens = await loadTokens();
    if (!tokens) return false;
    try {
      const user = await authService.getMe();
      dispatch(setCredentials({ user, tokens }));
      socketService.connect(tokens.accessToken);
      return true;
    } catch {
      await AsyncStorage.clear();
      return false;
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    login,
    register,
    logout,
    restoreSession,
  };
};
