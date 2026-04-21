import { create } from 'zustand';

interface TripState {
  selectedTariff: string;
  selectedPayment: string;
  setSelectedTariff: (tariff: string) => void;
  setSelectedPayment: (payment: string) => void;
}

export const useTripStore = create<TripState>((set) => ({
  selectedTariff: 'standard',
  selectedPayment: 'cash',
  setSelectedTariff: (tariff: string) => set({ selectedTariff: tariff }),
  setSelectedPayment: (payment: string) => set({ selectedPayment: payment }),
}));
