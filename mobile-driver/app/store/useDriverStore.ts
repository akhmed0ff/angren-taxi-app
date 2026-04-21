import { create } from 'zustand';
import type { Vehicle, DriverLocation, DriverStats, DocumentsStatus } from '../types';

interface DriverStore {
  isOnline: boolean;
  currentLocation: DriverLocation | null;
  vehicle: Vehicle | null;
  stats: DriverStats | null;
  documentsStatus: DocumentsStatus;
  isVerified: boolean;
  isUpdatingStatus: boolean;
  error: string | null;
  setOnlineStatus: (isOnline: boolean) => void;
  setUpdatingStatus: (isUpdatingStatus: boolean) => void;
  setCurrentLocation: (location: DriverLocation) => void;
  setVehicle: (vehicle: Vehicle) => void;
  setStats: (stats: DriverStats) => void;
  updateStats: (stats: Partial<DriverStats>) => void;
  setDocumentsStatus: (status: DocumentsStatus) => void;
  setVerified: (isVerified: boolean) => void;
  setError: (error: string | null) => void;
  resetDriver: () => void;
}

const initialState = {
  isOnline: false,
  currentLocation: null,
  vehicle: null,
  stats: null,
  documentsStatus: 'missing' as DocumentsStatus,
  isVerified: false,
  isUpdatingStatus: false,
  error: null,
};

export const useDriverStore = create<DriverStore>((set, get) => ({
  ...initialState,

  setOnlineStatus: (isOnline) => set({ isOnline }),
  setUpdatingStatus: (isUpdatingStatus) => set({ isUpdatingStatus }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setVehicle: (vehicle) => set({ vehicle }),
  setStats: (stats) => set({ stats }),
  updateStats: (stats) => set({ stats: { ...get().stats, ...stats } as DriverStats }),
  setDocumentsStatus: (documentsStatus) => set({ documentsStatus }),
  setVerified: (isVerified) => set({ isVerified }),
  setError: (error) => set({ error }),
  resetDriver: () => set(initialState),
}));
