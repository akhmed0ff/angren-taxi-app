import { useEffect } from 'react';
import { useOrdersStore } from '../store/useOrdersStore';
import { useDriverStore } from '../store/useDriverStore';
import { socketService } from '../services/socket.service';

interface RideStatusPayload {
  rideId: string;
}

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
    removeAvailableOrder,
    setActiveOrder,
  } = useOrdersStore();
  const isOnline = useDriverStore((state) => state.isOnline);

  // Socket.IO listeners aligned with backend realtime events.
  useEffect(() => {
    const handleRideCreated = (_data: unknown) => {
      // Backend payload doesn't include full Order shape for driver list, so refresh via REST.
      void loadAvailableOrders();
    };

    const handleRideCompleted = (data: unknown) => {
      const payload = data as RideStatusPayload;
      if (activeOrder?.id === payload.rideId) {
        setActiveOrder(null);
      }
      removeAvailableOrder(payload.rideId);
      void loadOrderHistory(1);
      void loadAvailableOrders();
    };

    const handleRideAccepted = (data: unknown) => {
      const payload = data as RideStatusPayload;
      if (activeOrder?.id === payload.rideId) {
        void loadActiveOrder();
      }
    };

    const handleRideStarted = (data: unknown) => {
      const payload = data as RideStatusPayload;
      if (activeOrder?.id === payload.rideId) {
        void loadActiveOrder();
      }
    };

    socketService.on('ride:created', handleRideCreated);
    socketService.on('ride:completed', handleRideCompleted);
    socketService.on('ride:accepted', handleRideAccepted);
    socketService.on('ride:started', handleRideStarted);

    return () => {
      socketService.off('ride:created', handleRideCreated);
      socketService.off('ride:completed', handleRideCompleted);
      socketService.off('ride:accepted', handleRideAccepted);
      socketService.off('ride:started', handleRideStarted);
    };
  }, [
    activeOrder,
    loadActiveOrder,
    loadAvailableOrders,
    loadOrderHistory,
    removeAvailableOrder,
    setActiveOrder,
  ]);

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
