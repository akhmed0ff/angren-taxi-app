import { useEffect, useCallback } from 'react';
import { useOrdersStore } from '../store/useOrdersStore';
import { useDriverStore } from '../store/useDriverStore';
import { socketService } from '../services/socket.service';
import { Order, OrderStatus } from '../types';

export const useOrders = () => {
  const {
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
    addAvailableOrder,
    removeAvailableOrder,
    setActiveOrder,
    updateActiveOrder,
  } = useOrdersStore();
  const isOnline = useDriverStore((state) => state.isOnline);

  // WebSocket listeners
  useEffect(() => {
    const handleNewOrder = (data: unknown) => {
      addAvailableOrder(data as Order);
    };

    const handleOrderCancelled = (data: unknown) => {
      const { orderId } = data as { orderId: string };
      removeAvailableOrder(orderId);
      if (activeOrder?.id === orderId) {
        setActiveOrder(null);
      }
    };

    const handleOrderUpdated = (data: unknown) => {
      const order = data as Order;
      if (activeOrder?.id === order.id) {
        updateActiveOrder(order);
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
  }, [activeOrder, addAvailableOrder, removeAvailableOrder, setActiveOrder, updateActiveOrder]);

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
