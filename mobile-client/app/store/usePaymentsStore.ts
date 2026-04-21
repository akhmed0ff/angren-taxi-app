import { create } from 'zustand';
import * as paymentsService from '../services/payments.service';
import type { Payment, PaymentMethod } from '../types';

interface PaymentsStore {
  paymentMethod: PaymentMethod;
  history: Payment[];
  isLoading: boolean;
  error: string | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  processPayment: (orderId: string, amount: number) => Promise<Payment>;
  fetchHistory: () => Promise<void>;
  clearError: () => void;
}

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  paymentMethod: 'cash',
  history: [],
  isLoading: false,
  error: null,

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  processPayment: async (orderId, amount) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await paymentsService.processPayment(orderId, get().paymentMethod, amount);
      set((state) => ({ history: [payment, ...state.history], isLoading: false }));
      return payment;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await paymentsService.getPaymentHistory();
      set({ history, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
