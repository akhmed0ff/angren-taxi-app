import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createOrderThunk,
  cancelOrderThunk,
  fetchOrderHistoryThunk,
} from '../store/slices/orders.slice';
import type { CreateOrderData } from '../types';

export function useOrders() {
  const dispatch = useAppDispatch();
  const { currentOrder, orderHistory, total, isLoading, error } = useAppSelector(
    (state) => state.orders,
  );

  const createOrder = useCallback(
    async (data: CreateOrderData) => {
      const result = await dispatch(createOrderThunk(data));
      if (createOrderThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch],
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      await dispatch(cancelOrderThunk(orderId));
    },
    [dispatch],
  );

  const fetchHistory = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      await dispatch(fetchOrderHistoryThunk(params));
    },
    [dispatch],
  );

  return {
    currentOrder,
    orderHistory,
    total,
    isLoading,
    error,
    createOrder,
    cancelOrder,
    fetchHistory,
  };
}
