import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setAvailableOrders,
  setActiveOrder,
  setOrderHistory,
  appendOrderHistory,
  setLoadingAvailable,
  setLoadingHistory,
  setProcessing,
  setHistoryPage,
  addAvailableOrder,
  removeAvailableOrder,
  updateActiveOrder,
} from '../store/slices/orders.slice';
import { ordersService } from '../services/orders.service';
import { socketService } from '../services/socket.service';
import { Order, OrderStatus } from '../types';

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const { availableOrders, activeOrder, orderHistory, isLoadingAvailable, isLoadingHistory, isProcessing, historyTotal, historyPage } =
    useAppSelector((state) => state.orders);
  const isOnline = useAppSelector((state) => state.driver.isOnline);

  const loadAvailableOrders = useCallback(async () => {
    dispatch(setLoadingAvailable(true));
    try {
      const orders = await ordersService.getAvailableOrders();
      dispatch(setAvailableOrders(orders));
    } catch (err) {
      console.warn('[Orders] Failed to load available orders:', err);
    } finally {
      dispatch(setLoadingAvailable(false));
    }
  }, [dispatch]);

  const loadActiveOrder = useCallback(async () => {
    try {
      const order = await ordersService.getActiveOrder();
      dispatch(setActiveOrder(order));
    } catch (err) {
      console.warn('[Orders] Failed to load active order:', err);
    }
  }, [dispatch]);

  const loadOrderHistory = useCallback(
    async (page = 1, status?: OrderStatus) => {
      dispatch(setLoadingHistory(true));
      try {
        const result = await ordersService.getOrderHistory({ page, status, limit: 20 });
        if (page === 1) {
          dispatch(setOrderHistory({ orders: result.data, total: result.total }));
        } else {
          dispatch(appendOrderHistory({ orders: result.data, total: result.total }));
        }
        dispatch(setHistoryPage(page));
      } catch (err) {
        console.warn('[Orders] Failed to load history:', err);
      } finally {
        dispatch(setLoadingHistory(false));
      }
    },
    [dispatch],
  );

  const acceptOrder = useCallback(
    async (orderId: string) => {
      dispatch(setProcessing(true));
      try {
        const order = await ordersService.acceptOrder(orderId);
        dispatch(setActiveOrder(order));
        dispatch(removeAvailableOrder(orderId));
        return order;
      } finally {
        dispatch(setProcessing(false));
      }
    },
    [dispatch],
  );

  const rejectOrder = useCallback(
    async (orderId: string, reason?: string) => {
      try {
        await ordersService.rejectOrder(orderId, reason);
        dispatch(removeAvailableOrder(orderId));
      } catch (err) {
        console.warn('[Orders] Failed to reject order:', err);
      }
    },
    [dispatch],
  );

  const arriveAtPickup = useCallback(async () => {
    if (!activeOrder) return;
    dispatch(setProcessing(true));
    try {
      const updated = await ordersService.arriveAtPickup(activeOrder.id);
      dispatch(updateActiveOrder(updated));
    } finally {
      dispatch(setProcessing(false));
    }
  }, [activeOrder, dispatch]);

  const startOrder = useCallback(async () => {
    if (!activeOrder) return;
    dispatch(setProcessing(true));
    try {
      const updated = await ordersService.startOrder(activeOrder.id);
      dispatch(updateActiveOrder(updated));
    } finally {
      dispatch(setProcessing(false));
    }
  }, [activeOrder, dispatch]);

  const completeOrder = useCallback(async () => {
    if (!activeOrder) return;
    dispatch(setProcessing(true));
    try {
      const updated = await ordersService.completeOrder(activeOrder.id);
      dispatch(updateActiveOrder(updated));
      dispatch(setActiveOrder(null));
      return updated;
    } finally {
      dispatch(setProcessing(false));
    }
  }, [activeOrder, dispatch]);

  const cancelOrder = useCallback(
    async (reason: string) => {
      if (!activeOrder) return;
      dispatch(setProcessing(true));
      try {
        await ordersService.cancelOrder(activeOrder.id, reason);
        dispatch(setActiveOrder(null));
      } finally {
        dispatch(setProcessing(false));
      }
    },
    [activeOrder, dispatch],
  );

  // WebSocket listeners
  useEffect(() => {
    const handleNewOrder = (data: unknown) => {
      dispatch(addAvailableOrder(data as Order));
    };

    const handleOrderCancelled = (data: unknown) => {
      const { orderId } = data as { orderId: string };
      dispatch(removeAvailableOrder(orderId));
      if (activeOrder?.id === orderId) {
        dispatch(setActiveOrder(null));
      }
    };

    const handleOrderUpdated = (data: unknown) => {
      const order = data as Order;
      if (activeOrder?.id === order.id) {
        dispatch(updateActiveOrder(order));
      }
    };

    socketService.on('new_order', handleNewOrder);
    socketService.on('order_cancelled', handleOrderCancelled);
    socketService.on('order_updated', handleOrderUpdated);

    return () => {
      socketService.off('new_order', handleNewOrder);
      socketService.off('order_cancelled', handleOrderCancelled);
      socketService.off('order_updated', handleOrderUpdated);
    };
  }, [activeOrder, dispatch]);

  // Load orders when coming online
  useEffect(() => {
    if (isOnline) {
      void loadAvailableOrders();
      void loadActiveOrder();
    }
  }, [isOnline, loadAvailableOrders, loadActiveOrder]);

  return {
    availableOrders,
    activeOrder,
    orderHistory,
    isLoadingAvailable,
    isLoadingHistory,
    isProcessing,
    historyTotal,
    historyPage,
    loadAvailableOrders,
    loadActiveOrder,
    loadOrderHistory,
    acceptOrder,
    rejectOrder,
    arriveAtPickup,
    startOrder,
    completeOrder,
    cancelOrder,
  };
};
