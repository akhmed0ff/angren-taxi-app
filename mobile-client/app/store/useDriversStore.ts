import { create } from 'zustand';
import type { Driver } from '../types';

interface DriversStore {
  availableDrivers: Driver[];
  selectedDriver: Driver | null;
  isLoading: boolean;
  error: string | null;
  setDrivers: (drivers: Driver[]) => void;
  setSelectedDriver: (driver: Driver | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useDriversStore = create<DriversStore>((set) => ({
  availableDrivers: [],
  selectedDriver: null,
  isLoading: false,
  error: null,
  setDrivers: (drivers) => set({ availableDrivers: drivers }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
