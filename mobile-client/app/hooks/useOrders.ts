import { useOrdersStore } from '../store/useOrdersStore';

export function useOrders() {
  const {
    currentOrder,
    orderHistory,
    total,
    isLoading,
    error,
    createOrder,
    cancelOrder,
    fetchHistory,
  } = useOrdersStore();

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
